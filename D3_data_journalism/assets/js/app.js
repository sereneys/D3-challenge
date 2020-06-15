// @TODO: YOUR CODE HERE!

//set up svg
var svgWidth = parseInt(d3.select("#scatter").style("width"));

var svgHeight = svgWidth - svgWidth/4;

var margin = {
    top: 20,
    right: 5,
    bottom: 90,
    left: 90
  };
  
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;  

var labelArea = 110;

var botPad = 40;
var leftPad = 40;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("class", "chart");

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create axis labels

// Left Y Axis

chartGroup.append("g").attr("class", "yText");

var yLabel = d3.select(".yText");

//append y labels text
var obesityLabel = yLabel.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -30)
  .attr("x", 0 - (height / 2))
  .attr("data-axis", "y")
  .attr("data-name", "obesity")
  .attr("class", "aText active y")
  .text("Obesity (%)");

var smokesLabel = yLabel.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -55)
  .attr("x", 0 - (height / 2))
  .attr("data-axis", "y")
  .attr("data-name", "smokes")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

var healthcareLabel = yLabel.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -80)
  .attr("x", 0 - (height / 2))
  .attr("data-axis", "y")
  .attr("data-name", "healthcare")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// Bottom X Axis
chartGroup.append("g").attr("class", "xText");

var xLabel = d3.select(".xText");

//append X labels text
xLabel
  .append("text")
  .attr("x", (width/2))
  .attr("y", height+35)
  .attr("data-axis", "x")
  .attr("data-name", "poverty")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

xLabel
  .append("text")
  .attr("x", (width/2))
  .attr("y", height+60)
  .attr("data-axis", "x")
  .attr("data-name", "age")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

xLabel
  .append("text")
  .attr("x", (width/2))
  .attr("y", height+85)
  .attr("data-axis", "x")
  .attr("data-name", "income")
  .attr("class", "aText inactive x")
  .text("Median Household Income");

// function used for updating x-scale var upon click on axis label
function xScales(xMin, xMax) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([0, width]);

  return xLinearScale;
};

// function used for updating y-scale var upon click on axis label
function yScales(yMin, yMax) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  return xLinearScale;
};


//Import CSV data
d3.csv("assets/data/data.csv").then(function(data) {
  createChart(data);
});

// Create function to create chart
function createChart(theData) {
  
  var curX = "poverty";
  var curY = "obesity";

  var toolTip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([80, -60])
  .html(function(d) {
    var theX = "<div>" + curX + ":" + d[curX] + "</div>";
    var theState = "<div>" + d.state + "</div>";
    var theY = "<div>" + curY + ":" + d[curY] + "%</div>";

    return theState + theX + theY;
  });
  
  chartGroup.call(toolTip);

  var xMin;
  var xMax;
  var yMin;
  var yMax;

  function xMinMax() {
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });

    xMax = d3.max(theData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  function yMinMax() {
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    yMax = d3.max(theData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  function labelUpdate(axis, clickedText) {
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);
    
    clickedText.classed("inactive", false).classed("active", true);
  }

  xMinMax();
  yMinMax();

  var xScale = xScales(xMin, xMax);
  var yScale = yScales(yMin, yMax);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // append x axis
  chartGroup
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${height})`);

  // append y axis
  chartGroup
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", `translate(0, 0)`);

  // append circles
  var circlesGroup = chartGroup.selectAll("g theCircles")
    .data(theData)
    .enter()
    
  circlesGroup
    .append("circle")
    .attr("cx", d => xScale(d[curX]))
    .attr("cy", d => yScale(d[curY]))
    .attr("r", 10)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "red");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d, this);
      d3.select(this).style("stroke", "#e3e3e3");
    });
  
  circlesGroup
    .append("text")
    .text(d => d.abbr)
    .attr("dx", d => xScale(d[curX]))
    .attr("dy", d => (yScale(d[curY]) + 4))
    .attr("font-szie", 4)
    .attr("class", "stateText")
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "red");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });
    
    d3.selectAll(".aText").on("click", function() {
      
      var self = d3.select(this);

      if (self.classed("inactive")) {
        var axis = self.attr("data-axis")
        var name = self.attr("data-name")

        if (axis === "x") {
          curX = name;
          xMinMax();

          xScale.domain([xMin, xMax]);

          chartGroup.select(".xAxis").transition().duration(300).call(xAxis);

          d3.selectAll("circle").each(function(){
            d3
              .select(this)
              .transition()
              .attr("cx", d=> xScale(d[curX]))
              .duration(300);
          });

          d3.selectAll(".stateText").each(function(){
            d3
              .select(this)
              .transition()
              .attr("dx", d=> xScale(d[curX]))
              .duration(300);
          });

          labelUpdate(axis, self);
        }
        else {
          curY = name;
          yMinMax();

          yScale.domain([yMin, yMax]);
          
          chartGroup.select(".yAxis").transition().duration(300).call(yAxis);

          d3.selectAll("circle").each(function(){
            d3
              .select(this)
              .transition()
              .attr("cy", d=> yScale(d[curY]))
              .duration(300);
          });

          d3.selectAll(".stateText").each(function(){
            d3
              .select(this)
              .transition()
              .attr("dy", d=> yScale(d[curY]))
              .duration(300);
          });

          labelUpdate(axis, self);
        }
      }
    });
  
}