// Global variables to initialize the scatter plot  
var selectedAxisX = "povertyLabel";
var selectedAxisY = "healthCareLabel";


//Scatter plot with D3.js
// Define SVG size 
var svgWidth = 960;
var svgHeight = 500;

// SCG margins 
var margin = {
  top: 20,
  right: 100,
  bottom: 100,
  left: 100
};

// SVG workable area   
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold the chart
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Shift the latter by left and top margins.
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import data 
d3.csv("./assets/data/data.csv").then(function(healthData) {
  
  // Step 1: Parse Data/Cast as numbers
  // ==============================
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // Step 2: Create scale functions
  // ==============================
  var xLinearScale = d3.scaleLinear()
    .range([0, width])
    .domain([d3.min(healthData, d => d.poverty)-1, d3.max(healthData, d => d.poverty)+1]);
    
  var yLinearScale = d3.scaleLinear()
    .range([height, 0])
    .domain([d3.min(healthData, d => d.healthcare)-1, d3.max(healthData, d => d.healthcare)]);
  
  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Step 4: Append Axes to the chart
  // ==============================
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("id","xAxis")
    .call(bottomAxis);

  chartGroup.append("g")
    .attr("id","yAxis")
    .call(leftAxis);

  
  // Step 5: Create Circles
  // ==============================
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("class","stateCircle")
    .attr("r", "15");
    
  // Step 6: create circles label (state abbreviations)
  // ==============================    
  chartGroup.selectAll(".stateText")
  .data(healthData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d.poverty))
  .attr("y", d => yLinearScale(d.healthcare))
  .attr("class",'stateText')
  .text(function(d){return d.abbr});
  
  // Step 7: Initialize tool tip
  // ==============================
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>% Poberty: ${d.poverty}<br>Healthcare: ${d.healthcare}%`);
    });

  // Step 8: Create tooltip in the chart
  // ==============================
  chartGroup.call(toolTip);

  // Step 9: Create event listeners to display and hide the tooltip
  // ==============================
  circlesGroup.on("click", function(data) {
    toolTip.show(data, this);
  })
    //onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  
  // Step 10: Create axes labels
  // ==============================
  // y axis labels: Lacks Healthcare, Obese and Smokes
  var healthCareLabel = chartGroup.append("text")
  .attr("id","healthCareLabel")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText eje_y active")
  .style("text-anchor", "middle")
  .text("Lacks Healthcare(%)");

  var smokesLabel =chartGroup.append("text")
  .attr("id","smokesLabel")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 20)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText eje_y inactive")
  .style("text-anchor", "middle")
  .text("Smokes(%)");

  var obeseLabel =chartGroup.append("text")
  .attr("id","obeseLabel")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText eje_y inactive")
  .style("text-anchor", "middle")
  .text("Obese(%)");

  // x axis labels: Lacks Poverty,Age and Income
  var povertyLabel = chartGroup.append("text")
  .attr("id", "povertyLabel")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
  .attr("class", "axisText eje_x active")
  .style("text-anchor", "middle")
  .text("In Poverty (%)");

  var ageLabel = chartGroup.append("text")
  .attr("id", "ageLabel")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 50})`)
  .attr("class", "axisText eje_x inactive")
  .style("text-anchor", "middle")
  .text("Age (Median)");

  var incomeLabel =chartGroup.append("text")
  .attr("id", "incomeLabel")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 70})`)
  .attr("class", "axisText eje_x inactive")
  .style("text-anchor", "middle")
  .text("Household Income (Median)");


  // Step 11: Create event listeners to deactivate/activate axis and to refresh the chart data by the funtions onChangeEjeX or onchangeEjeY 
  // ==============================
  healthCareLabel.on("click", onChangeYAxis);
  smokesLabel.on("click", onChangeYAxis);
  obeseLabel.on("click", onChangeYAxis);
  povertyLabel.on("click", onChangeXAxis);
  ageLabel.on("click", onChangeXAxis);
  incomeLabel.on("click", onChangeXAxis);

  function onChangeXAxis () {
    //Catch the selected value
    selectedAxisX = this.id;
  
    // Deactive/activate axis label 
    d3.selectAll(".eje_x").attr("class", "axisText eje_x inactive");
    d3.select("#"+selectedAxisX).attr("class", "axisText eje_x active");
  
    
    //Select data column for the chart: X Axis 
    switch (selectedAxisX) {
      case "ageLabel":
        var xvalue = "age"
        var xname = "Age"
        break
      case "incomeLabel":
        var xvalue = "income"
        var xname = "Income"
        break
      default:
        var xvalue = "poverty"
        var xname = "% Poverty"
    };

    //Select data column for the chart: Y Axis 
    switch (selectedAxisY) {
      case "smokesLabel":
        var yvalue = "smokes"
        var yname = "% Smokers"
        break
      case "obeseLabel":
        var yvalue = "obesity"
        var yname = "% Obesity"
        break
      default:
        var yvalue = "healthcare"
        var yname = "Healthcare"
    };

    //Change the scale 
    xLinearScale.domain([d3.min(healthData, d => d[xvalue])-1, d3.max(healthData, d => d[xvalue])+1]);
    
    bottomAxis.scale(xLinearScale)
    
    //Redraw the xAxis 
    d3.select('#xAxis') 
        .transition().duration(1000)
        .call(bottomAxis);
    
    // Move the circles 
    d3.selectAll('circle') 
      .transition().duration(1000)
      .attr('cx',function (d) { return xLinearScale(d[xvalue]) });
    
    d3.selectAll('.stateText')
      .transition().duration(1000)
      .attr("x", d => xLinearScale(d[xvalue]));
    
    
    //Redraw the tooltip 
    toolTip.html(function(d) {
        return (`${d.state}<br>${xname}: ${d[xvalue]}<br>${yname}: ${d[yvalue]}%`);
        });
    
  }
  
  function onChangeYAxis () {
    //Catch the selected value
    selectedAxisY = this.id;
    
    // Deactive/activate axis label 
    d3.selectAll(".eje_y").attr("class", "axisText eje_y inactive");
    d3.select("#"+selectedAxisY).attr("class", "axisText eje_y active");

    //Select data column for the chart: X Axis 
    switch (selectedAxisX) {
      case "ageLabel":
        var xvalue = "age"
        var xname = "Age"
        break
      case "incomeLabel":
        var xvalue = "income"
        var xname = "Income"
        break
      default:
        var xvalue = "poverty"
        var xname = "% Poverty"
    };

    //Select data column for the chart: YAxis 
    switch (selectedAxisY) {
      case "smokesLabel":
        var yvalue = "smokes"
        var yname = "% Smokers"
        break
      case "obeseLabel":
        var yvalue = "obesity"
        var yname = "% Obesity"
        break
      default:
        var yvalue = "healthcare"
        var yname = "% Lack Healthcare"
    };
    
    //Change the scale 
    yLinearScale.domain([d3.min(healthData, d => d[yvalue])-1, d3.max(healthData, d => d[yvalue])]);;
    
    leftAxis.scale(yLinearScale)
    
    //Redraw the xAxis 
    d3.select('#yAxis') 
        .transition().duration(1000)
        .call(leftAxis);
    
    // Move the circles 
    d3.selectAll('circle') 
      .transition().duration(1000)
      .attr('cy',function (d) { return yLinearScale(d[yvalue]) });
    
    d3.selectAll('.stateText')
      .transition().duration(1000)
      .attr("y", d => yLinearScale(d[yvalue]));
    
    //Redraw the tooltip 
    toolTip.html(function(d) {
      return (`${d.state}<br>${xname}: ${d[xvalue]}<br>${yname}: ${d[yvalue]}%`);
      });
  }
  
}).catch(function(error) {
  console.log(error);
});



