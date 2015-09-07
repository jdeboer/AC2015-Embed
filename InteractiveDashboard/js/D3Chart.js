/**
 *	GLOBALS
 *
 */
var margin = {
	"TOP" : 20,
	"RIGHT" : 30,
	"BOTTOM" : 30,
	"LEFT" : 40
};

var dimensions = {
	"WIDTH" : 960,
	"HEIGHT" : 500,
};
 
/**
 *	API BASE READY
 *
 */
gapi.analytics.ready(function(){
	
	/**
	 *	D3 Visualisation component for the Embed API
	 *
	 */
	gapi.analytics.createComponent("D3Chart", {
		
		/**
		 *	Initialises the D3Chart compoment
		 *	@param {Object} options the initial component properties when initialising the component
		 */
		initialize : function(options){
		
			this.container = typeof options.container == "string" ? 
				document.getElementById(options.container) : options.container;
		},
		
		/**
		 *	Queries Google Analytics and renders the results as a D3 visualisation
		 *	@return {D3Chart} the instance
		 */
		execute : function(){
			var options = this.get();
			
			this.report = new gapi.analytics.report.Data({
				"query" : options.query
			});

			
			if(gapi.analytics.auth.isAuthorized())
				this.queryGA();
			else
				gapi.anaytics.auth.once("success", this.queryGA.bind(this));
			
			this.report.on("success", function(response){
				
				this.renderChart(response);
				
				this.emit("success", {
					"report" : response
				});
				
			}.bind(this));
			
			return this;
		},
		
		/**
		 *	Queries Google Analytics using the built-in Data component
		 *
		 */
		queryGA : function(){
			var options = this.get();
			
			this.report.set(options.query);
			this.report.execute();
		},
		
		/**
		 *	Renders a D3 bar chart visualisation using the resulting data from the 
		 *	Google Analytics query
		 *	@param {Object} Google Analytics data
		 */
		renderChart : function(data){
			this.container.innerHTML = "";
			
			var INNER_WIDTH = dimensions.WIDTH - margin.LEFT - margin.RIGHT;
			var INNER_HEIGHT = dimensions.HEIGHT - margin.TOP - margin.BOTTOM;
			
			while(!gapi.analytics.metadata.isInitialized()){}
			
			var dataHeaders = data.columnHeaders.map(function(d){ 
				return gapi.analytics.metadata.getColumn(d.name).attributes.uiName;
			});
			
			var dataSet = data.rows;
			
			var x = d3.scale.ordinal()
				.domain(dataSet.map(function(d){return d[0];}))
				.rangeRoundBands([0, INNER_WIDTH], 0.1);
				
			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");
			
			var y = d3.scale.linear()
				.domain([0, d3.max(dataSet, function(d){return +d[1];})])
				.range([INNER_HEIGHT, 0]);
				
			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.tickFormat(d3.format(",d"));
			
			var tip = d3.tip()
				.attr("class", "d3-tip")
				.offset([-10, 0])
				.html(function(d){return "<span>" + d[1].toLocaleString() + "</span>";});
				
			d3.select(this.container)
				.append("svg")
				.attr("id", "D3SVG")
				.attr("width", dimensions.WIDTH)
				.attr("height", dimensions.HEIGHT);
			
			var chart = d3.select("#D3SVG")
			  .append("g")
			  	.attr("transform", "translate(" + margin.LEFT + "," + margin.TOP + ")");
			  	
			chart.call(tip);
			  	
			chart.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + INNER_HEIGHT + ")")
				.call(xAxis);
				
			chart.append("g")
				.attr("class", "y axis")
				.call(yAxis)
			  .append("text")
			  	.attr("transform", "rotate(-90)")
			  	.attr("y", 6)
			  	.attr("dy", "0.71em")
			  	.style("text-anchor", "end")
			  	.text(dataHeaders[1]);
				
			chart.selectAll(".bar")
				.data(dataSet)
			  .enter().append("rect")
			  	.attr("class", "bar")
			  	.attr("x", function(d){return x(d[0]);})
			  	.attr("y", function(d){return y(d[1]);})
			  	.attr("height", function(d){return INNER_HEIGHT - y(d[1]);})
			  	.attr("width", x.rangeBand())
			  	.on("mouseover", tip.show)
			  	.on("mouseout", tip.hide);			
			
		}
	});
});