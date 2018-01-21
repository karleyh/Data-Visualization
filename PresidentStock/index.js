/*
Karley Herschelman
Data Visualization - Assignment 1
Create graph similar to the one shown on CNN: http://www.cnn.com/2018/01/05/politics/trump-dow-jones-interactive
January 2018
 */

/* ========================== Begin D3 Graph ========================= */
d3.json("stockMarketPerformanceData.json", function(stock) {
    /* ========= Constants ========= */
    // Define Text Colors
    var lowerLineColor = "#acadae";
    var lowerHighlightColor = "#d7207e";
    var upperLineColor = "#868788";
    var upperHighlightColor = "#4dfff5";
    var textColor = "#9a9b9c";
    var textSize = "10px";
    var trumpTextColor = "#8e8f90";
    var trumpLineColor = "#ff0a0a";
    var trumpTextSize = "11px";
    //width and height of svg
    var w = 800;
    var h = 600;
    var padding = 30;

    /* ====================== Data processing ========================= */
    // graph bounds
    var maxDate = 0;
    var maxStock = 0;
    var minStock = 1000;
    // cast strings to numbers, get endpoints, and multiply by 100
    for (var i in stock){
        for (var j in stock[i]){
            if (j != 'date') {
                // president values
                s = parseFloat(stock[i][j]) * 100;
                if (s > maxStock) {
                    maxStock = s;
                }
                if (s < minStock) {
                    minStock = s;
                }
            }
            else{
                // date values
                s = parseInt(stock[i][j]);
                if (s > maxDate){
                    maxDate = s;
                }
            }
            stock[i][j] = s;
        }
    }
    /* ========= Create SVG ========= */
    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    /* ==================== Create Grid ======================== */
    //Create scale functions
    var xScale = d3.scaleLinear()
        .domain([0, maxDate])
        .range([padding, w - padding * 2]);
    var yScale = d3.scaleLinear()
        .domain([minStock, maxStock])
        .range([h - padding, padding]);
    //Define axis based on scales
    var xAxis = d3.axisBottom()
        .scale(xScale);
    var yAxis = d3.axisLeft()
        .scale(yScale);
    //Create X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);
    //Create Y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    /* =========== Create lines for each president with mouseover highlight and text ============= */
    var keys = Object.keys(stock[0]);
    for (var i in keys) {
        var p = keys[i];
        if ((p != 'date') && (p != 'Trump')) {
            createLines(p, xScale, yScale, svg, stock, upperLineColor, upperHighlightColor,
                lowerLineColor, lowerHighlightColor);
            createText(svg, stock, xScale, maxDate, yScale, p, textColor, textSize);
        }
    }
    createTrumpLine(xScale, yScale, svg, stock, trumpLineColor, maxDate, trumpTextColor, trumpTextSize);
});


/* ========================== Global Functions ===================== */
function createText(svg, stock, xScale, maxDate, yScale, p, textColor, textSize) {
// Add presidents name to each line
    svg.append("text").datum(stock)
        .attr("x", xScale(maxDate))
        .attr("y", yScale(stock[stock.length - 1][p]))
        .text(p.toLowerCase())
        .attr("font-family", "sans-serif")
        .attr("font-size", textSize)
        .attr("fill", textColor);
}

function createLines(p, xScale, yScale, svg, stock, upperLineColor, upperHighlightColor,
                     lowerLineColor, lowerHighlightColor) {
    var posLine = d3.line()
        .defined(function (d) {
            return d[p] >= 0;
        })
        .x(function (d) {
            return xScale(d.date);
        })
        .y(function (d) {
            return yScale(d[p]);
        });
    var negLine = d3.line()
        .defined(function (d) {
            return d[p] < 0;
        })
        .x(function (d) {
            return xScale(d.date);
        })
        .y(function (d) {
            return yScale(d[p]);
        });
    svg.append("path")
        .datum(stock)
        .attr("fill", "none")
        .attr("stroke", upperLineColor)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("class", "line")
        .attr("d", posLine)
        .on("mouseover", function () {
            d3.select(this)
                .attr("stroke", upperHighlightColor);
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke", upperLineColor);
        });
    svg.append("path")
        .datum(stock)
        .attr("fill", "none")
        .attr("stroke", lowerLineColor)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("class", "line")
        .attr("d", negLine)
        .on("mouseover", function () {
            d3.select(this)
                .attr("stroke", lowerHighlightColor);
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke", lowerLineColor);
        });
}

function createGradientLines(p, xScale, yScale, svg, stock, upperLineColor, upperHighlightColor,
                             lowerLineColor, lowerHighlightColor) {
    //Define line generator
    var line = d3.line()
        .defined(function (d) {
            return d[p];
        })
        .x(function (d) {
            return xScale(d.date);
        })
        .y(function (d) {
            return yScale(d[p]);
        });

    svg.append("linearGradient")
        .attr("y1", yScale(minStock))
        .attr("y2", yScale(maxStock))
        .attr("x1", 0)
        .attr("x2", xScale(maxDate))
        .attr("id", "gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .append("stop")
        .attr("offset", "0")
        .attr("stop-color", "#ff0")
        .append("stop")
        .attr("offset", "0.5")
        .attr("stop-color", "#f00")

    svg.append("path")
        .datum(stock)
        .attr("fill", "none")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("class", "line")
        .attr("d", line);
}

function createTrumpLine(xScale, yScale, svg, stock, trumpLineColor, maxDate, trumpTextColor, trumpTextSize) {
    var trumpLine = d3.line()
        .defined(function (d) {
            return d["Trump"];
        })
        .x(function (d) {
            return xScale(d.date);
        })
        .y(function (d) {
            return yScale(d["Trump"]);
        });
    svg.append("path")
        .datum(stock)
        .attr("fill", "none")
        .attr("stroke", trumpLineColor)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("class", "line")
        .attr("d", trumpLine);
    createText(svg, stock, xScale, maxDate, yScale, "Trump", trumpTextColor, trumpTextSize);
}


