/*
Karley Herschelman
Data Visualization - Assignment 1
Create graph similar to the one shown on CNN: http://www.cnn.com/2018/01/05/politics/trump-dow-jones-interactive
January 2018
 */

/* ========================== Begin D3 Graph ========================= */
d3.json("stockMarketPerformanceData.json", function(stock) {
    /* ========= Constants ========= */
    // Define Text Properties
    var lowerLineColor = "#e5e6e7";
    var lowerHighlightColor = "#d7207e";
    var upperLineColor = "#bfc0c1";
    var upperHighlightColor = "#0db4c1";
    var textColor = "#9a9b9c";
    var textSize = "10px";
    var trumpTextColor = "#8e8f90";
    var trumpLineColor = "#ff0a0a";
    var trumpTextSize = "11px";
    var highlightTextSize = "16px";
    var highlightTextColor = "#525354";
    var gridColor = "#b8b9ba";
    //width and height of svg
    var w = 800;
    var h = 800;
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
    //createAxis(xScale, yScale, svg, h, padding);
    createGrid(svg, h, padding, xScale, yScale, w);


    /* =========== Create lines for each president with mouseover highlight and text ============= */
    var keys = Object.keys(stock[0]);
    for (var i in keys) {
        var p = keys[i];
        if ((p != 'date') && (p != 'Trump')) {
            createLines(p, xScale, yScale, svg, stock, upperLineColor, upperHighlightColor,
                lowerLineColor, lowerHighlightColor, highlightTextColor, highlightTextSize);
            createText(svg, stock, xScale, maxDate, yScale, p, textColor, textSize, upperLineColor, upperHighlightColor,
                lowerLineColor, lowerHighlightColor, textSize, textColor, highlightTextSize, highlightTextColor);
        }
    }
    createTrumpLine(xScale, yScale, svg, stock, trumpLineColor, maxDate, trumpTextColor, trumpTextSize,
        highlightTextColor, highlightTextSize, gridColor);
});


/* ========================== Global Functions ===================== */
var previousMouseOver = "Clinton";
function mouseOver(p, lowerHighlightColor, upperHighlightColor, highlightTextSize, highlightTextColor,
                   lowerLineColor, upperLineColor, textSize, textColor) {
    document.getElementById(p + "lower").style.stroke = lowerHighlightColor;
    document.getElementById(p + "upper").style.stroke = upperHighlightColor;
    document.getElementById(p + "text").style.fontSize = highlightTextSize;
    document.getElementById(p + "text").style.fill = highlightTextColor;
    document.getElementById(previousMouseOver + "lower").style.stroke = lowerLineColor;
    document.getElementById(previousMouseOver + "upper").style.stroke = upperLineColor;
    document.getElementById(previousMouseOver + "text").style.fontSize = textSize;
    document.getElementById(previousMouseOver + "text").style.fill = textColor;
    previousMouseOver = p;
}

function createText(svg, stock, xScale, maxDate, yScale, p, textColor, textSize, upperLineColor, upperHighlightColor,
                    lowerLineColor, lowerHighlightColor, highlightTextColor, highlightTextSize) {
// Add presidents name to each line
    svg.append("text").datum(stock)
        .attr("x", xScale(maxDate))
        .attr("y", yScale(stock[stock.length - 1][p]))
        .text(p.toLowerCase())
        .attr("font-family", "sans-serif")
        .attr("font-size", textSize)
        .attr("fill", textColor)
        .attr("id", p + "text")
        .datum(p)
        .on("mouseover", function () {
            mouseOver(p, lowerHighlightColor, upperHighlightColor, highlightTextSize, highlightTextColor,
                lowerLineColor, upperLineColor, textSize, textColor);
        });
}

function createLines(p, xScale, yScale, svg, stock, upperLineColor, upperHighlightColor,
                     lowerLineColor, lowerHighlightColor, textSize, textColor, highlightTextSize,
                     highlightTextColor) {
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
        .attr("id", p + "upper")
        .attr("d", posLine)
        .datum(p)
        .on("mouseover", function () {
            mouseOver(p, lowerHighlightColor, upperHighlightColor, highlightTextSize, highlightTextColor,
                lowerLineColor, upperLineColor, textSize, textColor);
        })
        .on("mousemove", function(d){
            svg.selectAll("text.val").remove();
            svg.append("text")
                .attr("y", d3.mouse(this)[1])//magic number here
                .attr("x", d3.mouse(this)[0])
                .attr('text-anchor', 'middle')
                .attr("font-size", 30)
                .attr("class", "val")
                .text(parseInt(yScale.invert(d3.mouse(this)[1]))+"%");
        });
    svg.append("path")
        .datum(stock)
        .attr("fill", "none")
        .attr("stroke", lowerLineColor)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("class", "line")
        .attr("id", p + "lower")
        .attr("d", negLine)
        .datum(p)
        .on("mouseover", function (p) {
            mouseOver(p, lowerHighlightColor, upperHighlightColor, highlightTextSize, highlightTextColor,
                lowerLineColor, upperLineColor, textSize, textColor);
        })
    .on("mousemove", function(d){
        svg.selectAll("text.val").remove();
        svg.append("text")
            .attr("y", d3.mouse(this)[1])//magic number here
            .attr("x", d3.mouse(this)[0])
            .attr('text-anchor', 'middle')
            .attr("font-size", 30)
            .attr("class", "val")
            .text(parseInt(yScale.invert(d3.mouse(this)[1]))+"%");
    });

}

function createTrumpLine(xScale, yScale, svg, stock, trumpLineColor, maxDate, trumpTextColor, trumpTextSize,
                         highlightTextColor, highlightTextSize) {
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
    createText(svg, stock, xScale, maxDate, yScale, "Trump", trumpTextColor, trumpTextSize,
        trumpLineColor, trumpLineColor, trumpLineColor, trumpLineColor, highlightTextColor, highlightTextSize);
}

function createAxis(xScale, yScale, svg, h, padding) {
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
}

function createGrid(svg, h, padding, xScale, yScale, w, gridColor) {
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + (h + padding) + ")")
        .attr("stroke", gridColor)
        .attr("stroke-opacity", 0.7)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('stroke-width', 0)
        .call(d3.axisBottom(xScale)
            .tickSize(-h)
            .tickFormat("")
        );
    svg.append("g")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .attr("stroke", gridColor)
        .attr("stroke-opacity", 0.7)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .call(d3.axisBottom(xScale)
            .ticks(5));

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + padding + ",0)")
        .attr("stroke", gridColor)
        .attr("stroke-opacity", 0.7)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('stroke-width', 0)
        .call(d3.axisLeft(yScale)
            .tickSize(-w+70)
            .tickFormat("")
        );
    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .attr("stroke", gridColor)
        .attr("stroke-opacity", 0.7)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .call(d3.axisLeft(yScale)
            .ticks(5));
}


