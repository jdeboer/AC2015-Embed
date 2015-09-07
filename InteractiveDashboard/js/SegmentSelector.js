/**
 *	API BASE READY
 *
 */
 gapi.analytics.ready(function(){
	
	/**
	 *	Segment Selector component for the Embed API
	 *
	 */
	 gapi.analytics.createComponent("SegmentSelector", {
		
		/**
		 *	Initialises the DOM element to store the Segement selector
		 *	@param {Object} options the initial component properties when initialising the component
		 */ 
		initialize : function(options){
			this.container = typeof options.container == "string" ? 
				document.getElementById(options.container) : options.container;
				
			this.segments = gapi.client.analytics.management.segments.list();
		},
		
		/**
		 *	Load all segments for the authenticated user and render the segment selector onto the page
		 *	@return {SegmentSelector} The instance
		 */
		execute : function(){
	
			if(gapi.analytics.auth.isAuthorized())
				this.loadSegments();
			else
				gapi.analytics.auth.once("success", this.loadSegments.bind(this));
			
			this.container.onchange = this.onChange.bind(this);
			 
			return this;
		},
		
		/**
		 *	Loads all of the segments associated with the authenticated user's Google Analytics access
		 *	using the Management API
		 *
		 */
		loadSegments : function(){
			
			this.segments.execute(function(response){
			
				if(response && !response.error){
					this.segments = response.items;
					
					this.render(response.items);
				 	
					this.emit("success", {"response" : response.items});
				}
				else{
					this.emit("fail", {
						"response" : "Failed getting segments"
					});
				}
			}.bind(this));
		},
		
		/**
		 *	Renders the Segment selector onto the page
		 *	@param {Object} Google Analytics segment data
		 */
		render : function(data){
			var renderedHTML = 
				"Segment&nbsp&nbsp<select id='segment-list'>";
				
			for(i = 0; i < data.length; i++){
				renderedHTML = renderedHTML + 
					"	<option value=" + i + ">" + data[i].name + "</option>";
			}
			
			renderedHTML = renderedHTML + "</select>";
				
			this.container.innerHTML = renderedHTML;
		},
		
		/**
		 *	Emits a change event based on the selected segment
		 *
		 */
		onChange : function(response){
			var child = this.container.getElementsByTagName("select")[0].value;
			
			 this.emit("change", {
				 "segment" : this.segments[child]
			 })
		}
	 });
 });
