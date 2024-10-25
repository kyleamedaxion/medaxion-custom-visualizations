import * as d3 from "d3";
import x from "highcharts-more";

// Error function approximation
function erf(x) {
  // constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

looker.plugins.visualizations.add({
  id: "bell-curve",
  label: "Bell Curve",
  options: {
    medianName: {
      type: "string",
      label: "Median Name",
      default: "Peer Median",
      display: "text",
      section: "Labels"
    },
    actualName: {
      type: "string",
      label: "Actual Name",
      default: "Actual/Current",
      display: "text",
      section: "Labels"
    },
    actualColor: {
      type: "array",
      label: "Actual/Current Color",
      display: "color",
      default: ["#ff0000"],
      section: "Lines"
    },
    medianColor: {
      type: "array",
      label: "Peer Median Color",
      display: "color",
      default: ["#00ff00"],
      section: "Lines"
    },
    curveColor: {
      type: "array",
      label: "Curve Color",
      display: "color",
      default: ["#0000ff"],
      section: "Lines"
    },
    fillColor: {
      type: "array",
      label: "Fill Color",
      display: "color",
      default: ["#0000ff"],
      section: "Lines"
    },
    hideXAxis: {
      type: "boolean",
      label: "Hide X Axis",
      default: false,
      section: "Axis"
    },
    title: {
      type: "string",
      label: "Title",
      default: "Bell Curve",
      display: "text",
      section: "Labels"
    },
    currentRow: {
      type: "string",
      label: "Current Row Column",
      default: "is_current",
      display: "text",
      section: "Labels"
    },
    curveWidth: {
      type: "string",
      label: "Curve Width",
      default: "1.5",
      display: "text",

      section: "Lines"
    },
    medianWidth: {
      type: "string",
      label: "Median Width",
      default: "3",
      display: "text",

      section: "Lines"
    },
    currentWidth: {
      type: "string",
      label: "Current Width",
      default: "3",
      display: "text",
      section: "Lines"
    },
    displayTooltipAsPct: {
      type: "boolean",
      label: "Display Tooltip as Percentage",
      default: false,
      section: "Labels"
    },
    tooltipFontFamily: {
      type: "string",
      label: "Tooltip Font Family",
      default: "IBM Plex Sans, sans-serif",
      display: "text",
      section: "Labels"
    },
    titleFontFamily: {
      type: "string",
      label: "Title Font Family",
      default: "IBM Plex Sans, sans-serif",
      display: "text",
      section: "Labels"
    },
    hideTitle: {
      type: "boolean",
      label: "Hide Title",
      default: false,
      section: "Labels"
    },
    titleFontSize: {
      type: "string",
      label: "Title Font Size",
      default: "16px",
      display: "text",
      section: "Labels"
    },
    titleFontWeight: {
      type: "string",
      label: "Title Font Weight",
      default: "normal",
      display: "text",
      section: "Labels"
    },
    xAxisFontSize: {
      type: "string",
      label: "X Axis Font Size",
      default: "12px",
      display: "text",
      section: "Axis"
    },
    xAxisFontFamily: {
      type: "string",
      label: "X Axis Font Family",
      default: "IBM Plex Sans, sans-serif",
      display: "text",
      section: "Axis"
    },
    xAxisFontWeight: {
      type: "string",
      label: "X Axis Font Weight",
      default: "normal",
      display: "text",
      section: "Axis"
    },
    hairlineWidth: {
      type: "string",
      label: "Hairline Width",
      default: "1",
      display: "text",
      section: "Axis"
    },
    // either dashed or solid
    hairlineStyle: {
      type: "string",
      label: "Hairline Style",
      default: "dashed",
      display: "select",
      values: [
        { "Dashed": "dashed" },
        { "Solid": "solid" }
      ],
      section: "Axis"
    },
    hairlineColor: {
      type: "array",
      label: "Hairline Color",
      display: "color",
      default: ["#000000"],
      section: "Axis"
    },
    labelFontSize: {
      type: "string",
      label: "Label Font Size",
      default: "12px",
      display: "text",
      section: "Flags"
    },
    labelFontFamily: {
      type: "string",
      label: "Label Font Family",
      default: "IBM Plex Sans, sans-serif",
      display: "text",
      section: "Flags"
    },
    valueFontSize: {
      type: "string",
      label: "Value Font Size",
      default: "12px",
      display: "text",
      section: "Flags"
    },
    labelTextColor: {
      type: "array",
      label: "Label Text Color",
      display: "color",
      default: ["#ffffff"],
      section: "Flags"
    },
    labelFontWeight: {
      type: "string",
      label: "Label Font Weight",
      default: "normal",
      display: "text",
      section: "Flags"
    },
    valueFontWeight: {
      type: "string",
      label: "Value Font Weight",
      default: "normal",
      display: "text",
      section: "Flags"
    },
  },
  create: function (element, config) {
    element.innerHTML = '<div id="bellCurveChart"></div>';
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    // Find the row where the 'is_current' column is true
    const currentRow = data.find(row => row[config.currentRow]?.value === "Yes");

    if (!currentRow) {
      console.error("No row found with 'is_current' set to true.");
      done();
      return;
    }

    const median = currentRow['median'].value;
    const stddev = currentRow['stddev'].value;
    const actual = currentRow['actual'].value;
    const peerMedian = currentRow['median'].value;

    // Calculate positions for ±1 standard deviation
    const minus1StdDev = median - stddev;
    const plus1StdDev = median + stddev;

   
    const margin = { top: 20, right: 20, bottom: 10, left: 20 }; // Reduced margins
    if (config.hideTitle) {
      margin.top = 10; // Reduce top margin when title is hidden
    }
    const width = element.clientWidth;
    const height = element.clientHeight - margin.top;

    function roundToSignificantFigures(num, sigFigs) {
      if (num === 0) return 0;
      const d = Math.ceil(Math.log10(num < 0 ? -num : num));
      const power = sigFigs - d;
      const magnitude = Math.pow(10, power);
      const shifted = Math.round(num * magnitude);
      return Math.round(shifted / magnitude);
    }

    const svg = d3.select("#bellCurveChart")
      .html("") // Clear any existing content
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Add title
    if (!config.hideTitle) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", config.titleFontSize)
        .style("font-family", config.titleFontFamily)
        .style("font-weight", config.titleFontWeight)
        .text(config.title);
    }
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top + 20})`); // Adjusted for title

    const x = d3.scaleLinear()
      .domain([median - 4 * stddev, median + 4 * stddev])
      .range([0, width - margin.left - margin.right]);


    // Add hairlines for ±1 standard deviation
    const addHairline = (value) => {
      chartGroup.append("line")
        .attr("x1", x(value))
        .attr("x2", x(value))
        .attr("y1", 0)
        .attr("y2", height - margin.top - margin.bottom - 40) // Adjusted for legend
        .attr("stroke", config.hairlineColor[0])
        .attr("stroke-width", config.hairlineWidth)
        .attr("stroke-dasharray", config.hairlineStyle === "dashed" ? "2,2" : "none");
    };

    // Add hairlines for ±1 standard deviation
    addHairline(minus1StdDev);
    addHairline(plus1StdDev);

    const bellCurveData = [];
    const stepSize = (8 * stddev) / 1000; // Adjust step size to generate 1000 data points
    for (let i = median - 4 * stddev; i <= median + 4 * stddev; i += stepSize) {
      bellCurveData.push({
        x: i,
        y: (1 / (stddev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - median) / stddev, 2))
      });
    }

    // Calculate the maximum y value for the bell curve data
    const maxY = d3.max(bellCurveData, d => d.y);

    const y = d3.scaleLinear()
      .domain([0, maxY])
      .range([height - margin.top - margin.bottom - 40, 0]); // Adjusted for legend

    const xAxis = d3.axisBottom(x)
      .tickSize(0) // Remove tick marks
      .tickValues([]); // No tick values;

    // Define gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "bellCurveGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", config.fillColor[0])
      .attr("stop-opacity", 0.6);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", config.fillColor[0])
      .attr("stop-opacity", 0);

    const bellCurve = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y));

    const area = d3.area()
      .x(d => x(d.x))
      .y0(height - margin.top - margin.bottom - 40) // Adjusted for legend
      .y1(d => y(d.y));

    // Add bell curve gradient area
    chartGroup.append("path")
      .datum(bellCurveData)
      .attr("fill", "url(#bellCurveGradient)")
      .attr("d", area);

    // Add bell curve line
    chartGroup.append("path")
      .datum(bellCurveData)
      .attr("fill", "none")
      .attr("stroke", config.curveColor[0])
      .attr("stroke-width", config.curveWidth)
      .attr("d", bellCurve);

    function rightRoundedRect(x, y, width, height, radius) {
      return "M" + x + "," + y
        + "h" + (width - radius)
        + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
        + "v" + (height - 2 * radius)
        + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
        + "h" + (radius - width)
        + "z";
    }

    function leftRoundedRect(x, y, width, height, radius) {
      return "M" + (x + radius) + "," + y // Move to the start of the top-left corner arc
        + "h" + (width - radius) // Draw a horizontal line to the top-right corner
        + "v" + height // Draw a vertical line down to the bottom-right corner
        + "h" + (radius - width) // Draw a horizontal line to the start of the bottom-left corner arc
        + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius // Draw the bottom-left corner arc
        + "v" + (2 * radius - height) // Draw a vertical line up to the start of the top-left corner arc
        + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius // Draw the top-left corner arc
        + "z"; // Close the path
    }

    function calculateTextWidthAndHeight(text, fontSize, fontFamily, fontWeight) {
      // Create a temporary SVG element
      const svg = d3.select('body').append('svg').attr('width', 0).attr('height', 0);

      // Create a temporary text element
      const textElement = svg.append('text')
        .attr('x', -9999) // Position off-screen
        .attr('y', -9999) // Position off-screen
        .style('font-size', fontSize)
        .style('font-family', fontFamily)
        .style('font-weight', fontWeight)
        .text(text);

      // Get the bounding box of the text element
      const bbox = textElement.node().getBBox();

      // Remove the temporary SVG element
      svg.remove();

      // Return the width of the bounding box
      return [bbox.width, bbox.height];
    }

    const addReferenceLineWithFlag = (value, color, width, label, yOffset, isLeft, textLabel) => {
      chartGroup.append("line")
        .attr("x1", x(value))
        .attr("x2", x(value))
        .attr("y1", 0)
        .attr("y2", height - margin.top - margin.bottom - 40)
        .attr("stroke", color)
        .attr("stroke-width", width);

      const valueFontSize = parseInt(config.valueFontSize.replace("px", ""), 10) || 12;
      const labelFontSize = parseInt(config.labelFontSize.replace("px", ""), 10) || 12;
      const [labelWidth, labelHeight] = calculateTextWidthAndHeight(textLabel, config.labelFontSize, config.labelFontFamily, config.labelFontWeight);
      const [valueWidth, valueHeight] = calculateTextWidthAndHeight(label, config.valueFontSize, config.labelFontFamily, config.labelFontWeight);
      const flagWidth = Math.max(labelWidth, valueWidth) + 20;
      console.log(label, labelWidth, valueWidth);

      const xOffset = isLeft ? -flagWidth : 0;
      let flagHeight = labelHeight + valueHeight + 15

      console.log(flagWidth);

      chartGroup.append("path")
        .attr("d", isLeft ? leftRoundedRect(x(value) + xOffset, yOffset, flagWidth, flagHeight, 5) : rightRoundedRect(x(value) + xOffset, yOffset, flagWidth, flagHeight, 5))
        .attr("fill", color);

      chartGroup.append("text")
        .attr("x", x(value) + xOffset + flagWidth / 2)
        .attr("y", yOffset + labelFontSize + 5)
        .attr("text-anchor", "middle")
        .style("font-size", config.labelFontSize)
        .style("font-family", config.labelFontFamily)
        .style("font-weight", config.labelFontWeight)
        .style("fill", config.labelTextColor[0])
        .text(textLabel);

      chartGroup.append("text")
        .attr("x", x(value) + xOffset + flagWidth / 2)
        .attr("y", yOffset + labelFontSize + valueFontSize + 10)
        .attr("text-anchor", "middle")
        .style("font-size", config.valueFontSize)
        .style("font-family", config.labelFontFamily)
        .style("font-weight", config.valueFontWeight)
        .style("fill", config.labelTextColor[0])
        .text(label);

    };

    const actualLabel = roundToSignificantFigures(actual, 2);
    const medianLabel = roundToSignificantFigures(peerMedian, 2);

    let actualFlagXOffset, medianFlagXOffset;
    if (actual < peerMedian) {
      addReferenceLineWithFlag(actual, config.actualColor[0], config.currentWidth, actualLabel, height * 0.1, true, config.actualName);
      addReferenceLineWithFlag(peerMedian, config.medianColor[0], config.medianWidth, medianLabel, height * 0.2, false, config.medianName);
    } else {
      addReferenceLineWithFlag(actual, config.actualColor[0], config.currentWidth, actualLabel, height * 0.1, false, config.actualName);
      addReferenceLineWithFlag(peerMedian, config.medianColor[0], config.medianWidth, medianLabel, height * 0.2, true, config.medianName);
    }
    // Conditionally append the x-axis based on config.hideXaxis
    if (!config.hideXAxis) {
      const xAxisGroup = chartGroup.append("g")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom - 40})`) // Adjusted for legend
        .call(xAxis);

      // Remove tick labels
      xAxisGroup.selectAll(".tick text").style("display", "none");

      // Add text labels for ±1 standard deviation
      chartGroup.append("text")
        .attr("x", x(plus1StdDev))
        .attr("y", height - margin.top - margin.bottom - 15)
        .attr("text-anchor", "middle")
        .style("font-size", config.xAxisFontSize)
        .style("font-family", config.xAxisFontFamily)
        .style("font-weight", config.xAxisFontWeight)
        .text(`${roundToSignificantFigures(plus1StdDev, 2)}`);

      chartGroup.append("text")
        .attr("x", x(minus1StdDev))
        .attr("y", height - margin.top - margin.bottom - 15)
        .attr("text-anchor", "middle")
        .style("font-size", config.xAxisFontSize)
        .style("font-family", config.xAxisFontFamily)
        .style("font-weight", config.xAxisFontWeight)
        .text(`${roundToSignificantFigures(minus1StdDev, 2)}`);

      // Add median text label
      chartGroup.append("text")
        .attr("x", x(median))
        .attr("y", height - margin.top - margin.bottom - 15)
        .attr("text-anchor", "middle")
        .style("font-size", config.xAxisFontSize)
        .style("font-family", config.xAxisFontFamily)
        .style("font-weight", config.xAxisFontWeight)
        .text(`${roundToSignificantFigures(median, 2)}`);
    }

    // Create tooltip element
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("font-family", config.tooltipFontFamily)
      .style("display", "none");

    // Function to calculate the CDF of the normal distribution
    const normalCDF = (x, mean, stddev) => {
      return (1 - erf((mean - x) / (Math.sqrt(2) * stddev))) / 2;
    };

    // Calculate percentages using the CDF
    const percentageAbove = (1 - normalCDF(actual, median, stddev)) * 100;
    const percentageBelow = normalCDF(actual, median, stddev) * 100;

    const tooltipValueSuffix = config.displayTooltipAsPct ? `${percentageAbove.toFixed(2)}%` : actual;
    // Add overlay for tooltip
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => tooltip.style("display", "block"))
      .on("mousemove", (event) => {
        tooltip
          .html(`
        <strong>${config.actualName}:</strong> ${config.displayTooltipAsPct ? actual.toFixed(2) + '%' : Math.round(actual)}<br>
        <strong>${config.medianName}:</strong> ${config.displayTooltipAsPct ? peerMedian.toFixed(2) + '%' : Math.round(peerMedian)}<br>
        ${percentageAbove.toFixed(0)}%<strong> Above You</strong><br>
        ${percentageBelow.toFixed(0)}%<strong> Below You</strong>
      `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    done();
  },
});