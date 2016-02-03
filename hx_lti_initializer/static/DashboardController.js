/**
 *  DashboardController.js
 *	
 * This file contains all logic for the sidebar or bottombar in order to show
 * annotations in a table/list view instead of, or alongside, the mouseovers
 * in the target object. 
 **/
(function($) {

	$.DashboardController = function(options, commonInfo, dashboardView) {
		
		// sets up the default options
		var defaultOptions = {

			// media can be "text", "video", or "image"
			media: commonInfo.mediaType,
			userId: commonInfo.user_id,

			// if true, this will allow users to change between annotations for video, text,
			// or images that exist in the same page
			showMediaSelector: false,

			// if true this will allow users to switch between public/private
			showPublicPrivate: true,
			pagination: 50,
			flags: false,

			// adds a suffix to get the appropriate template
		};

		this.element = options.annotationElement;
		this.dashboardView = dashboardView;
		this.initOptions = jQuery.extend({}, defaultOptions, options.initOptions, commonInfo);
		this.annotationsMasterList = [];
		this.current_tab = this.initOptions.default_tab;
		this.dashboardReady = jQuery.Deferred();
		
		this.writingReply = false;

		var endpointLoaded = jQuery.Deferred();
		if (this.initOptions.mediaType !== "image") {
			this.endpoint = new AnnotatorEndpointController(endpointLoaded);
		} else {
			this.endpoint = new MiradorEndpointController(endpointLoaded);
		}

		this.init(endpointLoaded);
	};

	/* init
	 * 
	 */
	$.DashboardController.prototype.init = function(deferredObject) {
		var self = this;

		var annotationsLoaded = self.__bind(self.annotationsLoaded, self);
		var annotationCreated = self.__bind(self.annotationCreated, self);
		var annotationUpdated = self.__bind(self.annotationUpdated, self);
		var annotationDeleted = self.__bind(self.annotationDeleted, self);

		jQuery.when(deferredObject).done(function() {
			if (self.initOptions.mediaType === "image") {
				self.endpoint.setUpListener('catchAnnotationsLoaded', annotationsLoaded);
				self.endpoint.setUpListener('catchAnnotationCreated', annotationCreated);
				self.endpoint.setUpListener('catchAnnotationDeleted', annotationDeleted);
				self.endpoint.setUpListener('catchAnnotationUpdated', annotationUpdated);
			} else {
				// sets up all event listeners and their actions
				self.endpoint.setUpListener('annotationsLoaded', annotationsLoaded);
				self.endpoint.setUpListener('annotationCreated', annotationCreated);
				self.endpoint.setUpListener('annotationDeleted', annotationDeleted);
				self.endpoint.setUpListener('annotationUpdated', annotationUpdated);
			}
			
			// TODO: Allow instructor (or maybe even user) to switch between different dashboards
			self.viewer = new self.dashboardView({
				suffix: self.initOptions.dashboardVersion,
				template_urls: self.initOptions.template_urls,
				element: self.element,
				endpoint: self.endpoint,
				pagination: self.initOptions.pagination,
				controller: self,
				default_tab: self.initOptions.default_tab,
				show_instructor_tab: self.initOptions.show_instructor_tab,
			});
		});

	};

	$.DashboardController.prototype.setUpButtons = function() {
		var self = this;

		jQuery('#public').click(function (e){
			self.endpoint.queryDatabase({
				"user_id": undefined,
			}, self.initOptions.pagination, self.initOptions.media);
		});
		jQuery('#mynotes').click(function (e){
			self.endpoint.queryDatabase({
				"user_id": self.initOptions.user_id,
			}, self.initOptions.pagination, self.initOptions.media);
		});
		jQuery('#instructor').click(function (e){
			self.endpoint.queryDatabase({
				"user_id": self.initOptions.instructors,
			}, self.initOptions.pagination, self.initOptions.media);
		});
		
		jQuery('button#search-submit').click(function (e) {
			var text = jQuery('#srch-term').val();
			var search_filter = self.viewer.getSelectedFilterValue().attr("id");
			if (search_filter === "users-filter"){
				self.endpoint.queryDatabase({
					"username": text,
				}, self.initOptions.pagination, self.initOptions.media);
			} else if (search_filter === "annotationtext-filter"){
				self.endpoint.queryDatabase({
					"text": text,
				}, self.initOptions.pagination, self.initOptions.media);
			} else if (search_filter === "tag-filter"){
				self.endpoint.queryDatabase({
					"tag": text,
				}, self.initOptions.pagination, self.initOptions.media)
			}
		});

		jQuery('button#search-clear').click(function (e) {
			jQuery('#srch-term').val("");
			self.viewer.getSelectedTabValue().trigger("click");
		});

		var annotationClicked = self.__bind(self.annotationClicked, self);
		var replyDeleteClicked = self.__bind(self.replyDeleteClicked, self);
		var instructionsClicked = self.__bind(self.instructionsClicked, self);
		var fullscreenClicked = self.__bind(self.fullscreenClicked, self);
		var el = self.element;
		el.on("click", ".annotationItem", annotationClicked);
		el.on("click", ".annotation-instructions", instructionsClicked);
		el.on("click", ".annotation-fullscreen", fullscreenClicked);
		el.on("click", ".replyItem .replyeditgroup #delete", replyDeleteClicked);
	};

	$.DashboardController.prototype.loadMoreAnnotations = function() {
		var annotator = this.annotator;

		// TODO: Change below to be a call to the Core Controller
		var loadFromSearch = annotator.plugins.Store.options.loadFromSearch;
		var numberOfAnnotations = jQuery('.annotationSection .annotationItem').length;

		loadFromSearch.limit = this.initOptions.pagination + numberOfAnnotations;
		annotator.plugins.Store.loadAnnotationsFromSearch(loadFromSearch);
	};

	$.DashboardController.prototype.annotationsLoaded = function (before_annotations) {
		//console.log("AnnotationsLoaded Triggered");
		//check permissions
		var annotations = [];
		var self = this;
		var store = AController.annotationCore.annotation_tool.plugins.Store;
		var permissions = AController.annotationCore.annotation_tool.plugins.Permissions;
		jQuery.each(before_annotations, function(index, value) {
			if (value.permissions !== undefined && (value.permissions.read.length === 0 || permissions.authorize('read', value, permissions.user))) {
				annotations.push(value);
			} else {
				var child, h, _k, _len2, _ref1;
				if (value.highlights != null) {
				_ref1 = value.highlights;
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				  h = _ref1[_k];
				  if (!(h.parentNode != null)) {
				    continue;
				  }
				  child = h.childNodes[0];
				  jQuery(h).replaceWith(h.childNodes);
				}
				}
				AController.annotationCore.annotation_tool.plugins.Store.unregisterAnnotation(value);
			}
		});

		var self = this;
		this.dashboardReady.done(function() {
			if (typeof self.initOptions.focus_on_annotation !== "undefined") {
				self.endpoint.updateMasterList(self.initOptions.focus_on_annotation, self.viewer);
				self.initOptions.focus_on_annotation = undefined;
			} else {
				self.endpoint.updateMasterList();
				if (self.endpoint.getNumOfAnnotationsOnScreen() > self.initOptions.pagination) {
					self.endpoint.updateEndpointList({limit:self.initOptions.pagination});
				};
				self.viewer.clearDashboard();
				self.viewer.updateDashboard(0, self.initOptions.pagination, annotations, false);
			}
		});
	};

	$.DashboardController.prototype.annotationCreated = function (annotation) {
		//console.log("AnnotationsCreated Triggered");
		var self = this;
		var attempts = 0;
		var isChanged = function (){
			if (attempts < 100){
				setTimeout( function() {
					if (typeof annotation.id !== 'undefined') {
						self.endpoint.addNewAnnotationToMasterList(annotation);
						self.viewer.addCreatedAnnotation(annotation.media, annotation);
					} else {
						attempts++;
						isChanged();
					}
				}, 100);
			}
		};
		isChanged();
	};

	$.DashboardController.prototype.annotationUpdated = function (annotation) {
		//console.log("AnnotationsUpdated Triggered");
		this.endpoint.updateAnnotationInMasterList(annotation);
		this.viewer.updateAnnotation(annotation);
	};

	$.DashboardController.prototype.annotationDeleted = function(annotation) {
		//console.log("AnnotationDeleted Triggered");
		var isReply = this.endpoint.removeAnnotationFromMasterList(annotation);
		if (!isReply) {
			this.viewer.deleteAnnotation(annotation);
		};
		
	};

	$.DashboardController.prototype.__bind = function(fn, me) { 
	    return function() { 
	        return fn.apply(me, arguments); 
    	}
    }; 

    $.DashboardController.prototype.annotationClicked = function(e) {
    	var self = this;
    	var target = jQuery(e.target);
    	var annotation_id = this.viewer.findAnnotationId(target, false);

    	var annotationClicked = self.endpoint.getAnnotationById(annotation_id);
    	var addCreatedAnnotation = self.__bind(self.viewer.addCreatedAnnotation, self.viewer);
    	self.viewer.displayModalView(annotationClicked, addCreatedAnnotation);
    	var displayReplies = self.__bind(self.viewer.displayReplies, self.viewer);
    	self.endpoint.loadRepliesForParentAnnotation(annotation_id, displayReplies);
    };

    $.DashboardController.prototype.instructionsClicked = function(e) {
    	var self = this;
    	var target = jQuery(e.target);

    	self.viewer.displayInstructions(this.initOptions.instructions);
    };

    $.DashboardController.prototype.annotationViaKeyboardInput = function(e){
    	var self = this;
    	self.viewer.annotationViaKeyboardInput();
    };

    $.DashboardController.prototype.fullscreenClicked = function(e) {
    	this.viewer.toggleFullscreen();
    };

    $.DashboardController.prototype.replyDeleteClicked = function(e) {
    	var self = this;
    	var button = jQuery(e.target);
    	var replyItem = this.viewer.findAnnotationId(button, true);
    	var annotation_id = this.viewer.findAnnotationId(replyItem, false);
    	var annotation = this.endpoint.list_of_replies[annotation_id];
    	//console.log(this.endpoint);
    	var parentId = annotation.parent;

    	button.confirmation({
			title: "Would you like to delete your reply?",
			container: "body",
			onConfirm: function (){
				self.endpoint.deleteReply(annotation, function(){ 
					replyItem.remove(); 
            		var numReply = parseInt(jQuery('.item-' + parentId).find('.replyNum').html(), 10);
           		 	jQuery('.item-' + parentId).find('.replyNum').html(numReply-1);
				});
			},
		});

		button.confirmation('show');
	};

}(AController));
