// floating-bars.ts
import { Looker, VisualizationDefinition } from "../common/types";
import * as d3 from 'd3';

declare var looker: Looker;

interface FloatingColumnViz extends VisualizationDefinition {
  elementRef?: HTMLDivElement;
}

export const vis: FloatingColumnViz = {
  id: "floating-column-chart",
  label: "Floating Column Chart",
  options: {
    lowMeasure: {
      type: "string",
      label: "Low Measure",
      display: "select",
      values: [],
      section: "Data",
    },
    highMeasure: {
      type: "string",
      label: "High Measure",
      display: "select",
      values: [],
      section: "Data",
    },
    averageMeasure: {
      type: "string",
      label: "Average Measure",
      display: "select",
      values: [],
      section: "Data",
    },
    // add color options
    barColor: {
      type: "string",
      label: "Bar Color",
      display: "color",
      default: "steelblue",
      section: "Style",
    },
    // add reference line color options
    globalMaxLineColor: {
      type: "string",
      label: "Global Max Line Color",
      display: "color",
      default: "green",
      section: "Style",
    },
    globalMaxLineWidth: {
      type: "string",
      label: "Global Max Line Width",
      display: "text",
      default: "2",
      section: "Style",
    },
    globalMaxLineStyle: {
      type: "string",
      label: "Global Max Line Style",
      display: "select",
      values: [
        { "Solid": "solid" },
        { "Dashed": "dashed" },
        { "Dotted": "dotted" },
      ],
      default: "solid",
      section: "Style",
    },
    globalMinLineColor: {
      type: "string",
      label: "Global Min Line Color",
      display: "color",
      default: "blue",
      section: "Style",
    },
    globalMinLineWidth: {
      type: "string",
      label: "Global Min Line Width",
      display: "text",
      default: "2",
      section: "Style",
    },
    globalMinLineStyle: {
      type: "string",
      label: "Global Min Line Style",
      display: "select",
      values: [
        { "Solid": "solid" },
        { "Dashed": "dashed" },
        { "Dotted": "dotted" },
      ],
      default: "solid",
      section: "Style",
    },
    meanOfAveragesLineColor: {
      type: "string",
      label: "Mean of Averages Line Color",
      display: "color",
      default: "purple",
      section: "Style",
    },
    meanOfAveragesLineWidth: {
      type: "string",
      label: "Mean of Averages Line Width",
      display: "text",
      default: "2",
      section: "Style",
    },
    meanOfAveragesLineStyle: {
      type: "string",
      label: "Mean of Averages Line Style",
      display: "select",
      values: [
        { "Solid": "solid" },
        { "Dashed": "dashed" },
        { "Dotted": "dotted" },
      ],
      default: "solid",
      section: "Style",
    },
    columnMeanLineColor: {
      type: "string",
      label: "Column Mean Line Color",
      display: "color",
      default: "red",
      section: "Style",
    },
    columnMeanLineWidth: {
      type: "string",
      label: "Column Mean Line Width",
      display: "text",
      default: "2",
      section: "Style",
    },
    columnMeanLineStyle: {
      type: "string",
      label: "Column Mean Line Style",
      display: "select",
      values: [
        { "Solid": "solid" },
        { "Dashed": "dashed" },
        { "Dotted": "dotted" },
      ],
      default: "solid",
      section: "Style",
    },
    columnWidthFactor: {
      type: "number",
      label: "Column Width Factor",
      display: "range",
      min: 0.1,
      max: 1,
      step: 0.1,
      default: 0.8,
      section: "Style",
    },
    columnLegendName: {
      type: "string",
      label: "Column Name (Leave blank for none)",
      display: "text",
      default: "",
      section: "Legend",
    },
    globalMaxLegendName: {
      type: "string",
      label: "Global Max Name (Leave blank for none)",
      display: "text",
      default: "",
      section: "Legend",
    },
    globalMinLegendName: {
      type: "string",
      label: "Global Min Name (Leave blank for none)",
      display: "text",
      default: "",
      section: "Legend",
    },
    meanOfAveragesLegendName: {
      type: "string",
      label: "Mean of Averages Name (Leave blank for none)",
      display: "text",
      default: "",
      section: "Legend",
    },
    columnMeanLegendName: {
      type: "string",
      label: "Column Mean Name (Leave blank for none)",
      display: "text",
      default: "",
      section: "Legend",
    },
    legendFontSize: {
      type: "string",
      label: "Legend Font Size",
      display: "text",
      default: "12",
      section: "Legend",
    },
    legendFontFamily: {
      type: "string",
      label: "Legend Font Family",
      display: "text",
      default: 'Roboto, "Noto Sans", "Noto Sans JP", "Noto Sans CJK KR", "Noto Sans Arabic UI", "Noto Sans Devanagari UI", "Noto Sans Hebrew", "Noto Sans Thai UI", Helvetica, Arial, sans-serif',
      section: "Legend",
    },
    legendFontWeight: {
      type: "string",
      label: "Legend Font Weight",
      display: "text",
      default: "normal",
      section: "Legend",
    },
    axisFontFamily: {
      type: "string",
      label: "Axis Font Family",
      display: "text",
      default: 'Roboto, "Noto Sans", "Noto Sans JP", "Noto Sans CJK KR", "Noto Sans Arabic UI", "Noto Sans Devanagari UI", "Noto Sans Hebrew", "Noto Sans Thai UI", Helvetica, Arial, sans-serif',
      section: "Axes",
    },
    axisFontSize: {
      type: "string",
      label: "Axis Font Size",
      display: "text",
      default: "12",
      section: "Axes",
    },
    axisFontWeight: {
      type: "string",
      label: "Axis Font Weight",
      display: "text",
      default: "normal",
      section: "Axes",
    },
    removeYAxis: {
      type: "boolean",
      label: "Remove Y Axis",
      display: "checkbox",
      default: false,
      section: "Axes",
    },
    removeXAxis: {
      type: "boolean",
      label: "Remove X Axis",
      display: "checkbox",
      default: false,
      section: "Axes",
    },
    yAxisTickCount: {
      type: "string",
      label: "Y Axis Ticks",
      display: "text",
      default: "5",
      section: "Axes",
    },
    axisLineColor: {
      type: "string",
      label: "Axis Line Color",
      display: "color",
      default: "#c2c2c2",
      section: "Axes",
    },
    axisFontColor: {
      type: "string",
      label: "Axis Font Color",
      display: "color",
      default: "#2C2D33",
      section: "Axes",
    },
    legendFontColor: {
      type: "string",
      label: "Legend Font Color",
      display: "color",
      default: "#2C2D33",
      section: "Legend",
    }
  },
  create(element, config) {
    element.className = "d3-floating-column-chart";
    const style = document.createElement('style');
    style.innerHTML = `
    .d3-floating-column-chart {
      font-family: 'Source Sans Pro', sans-serif;
    }
  `;
    document.head.appendChild(style);
  },
  updateAsync(data, element, config, queryResponse, details, done) {
    const { measure_like: measures } = queryResponse.fields;

    // Populate the select options for measures
    const measureOptions = measures.map(measure => ({ [measure.label]: measure.name }));
    this.options.lowMeasure.values = measureOptions;
    this.options.highMeasure.values = measureOptions;
    this.options.averageMeasure.values = measureOptions;

    // @ts-ignore
    this.trigger && this.trigger("registerOptions", this.options);

    const lowMeasure = config.lowMeasure || measures[0].name;
    const highMeasure = config.highMeasure || measures[1].name;
    const averageMeasure = config.averageMeasure || measures[2].name;

    const averageSum = data.reduce((acc, d) => acc + d[averageMeasure].value, 0);
    const meanOfAverages = averageSum / data.length;

    // Make a little more space for the legend
    element.style.marginBottom = '0';

    // Clear previous SVG
    d3.select(element).selectAll("*").remove();

    // Set up SVG container
    const margin = { top: 13, right: 20, bottom: 57, left: 60 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom + 10;

    const svg = d3.select(element)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 10)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data
    const categories = data.map(d => d[queryResponse.fields.dimension_like[0].name].value);
    const lowValues = data.map(d => d[lowMeasure].value);
    const highValues = data.map(d => d[highMeasure].value);

    // Start the y-axis at the minimum low value minus 15% of the range
    let yAxisMin = d3.min(lowValues) as number - 0.15 * (d3.max(highValues) as number - d3.min(lowValues) as number);
    if (yAxisMin < 0 && d3.min(lowValues) > 0) {
      yAxisMin = 0;
    }
    // Create scales
    const x = d3.scaleBand()
      .domain(categories)
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([yAxisMin, d3.max(highValues) as number])
      .nice()
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0)) // Remove ticks
      .selectAll("text")
      .style("font-family", config.axisFontFamily)
      .style("font-size", config.axisFontSize + "px")
      .style("font-weight", config.axisFontWeight)
      .style("fill", config.axisFontColor)
      .attr("dy", "1em")
      .attr("transform", "translate(0, 7)"); // Move labels lower by 5 pixels

    // Change x-axis line color
    if (config.removeXAxis) {
      svg.selectAll(".x.axis path")
        .style("stroke", 'none');
    } else {
      svg.selectAll(".x.axis path")
        .style("stroke", config.axisLineColor);
    }

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y)
        .ticks(config.yAxisTickCount)
        .tickSize(0))
      .selectAll("text")
      .style("font-family", config.axisFontFamily)
      .style("font-size", config.axisFontSize + "px")
      .style("font-weight", config.axisFontWeight)
      .style("fill", config.axisFontColor)
      .attr("dx", "-0.5em"); // Add padding to y-axis labels

    if (config.removeYAxis) {
      svg.selectAll(".y.axis path")
        .style("stroke", 'none');
    } else {
      // Change y-axis line color
      svg.selectAll(".y.axis path")
        .style("stroke", config.axisLineColor);
    }

    // Draw floating columns
    svg.selectAll(".column")
      .data(data)
      .enter().append("rect")
      .attr("class", "column")
      .attr("x", d => x(d[queryResponse.fields.dimension_like[0].name].value) as number + ((x.bandwidth() * (1 - config.columnWidthFactor)) / 2))
      .attr("y", d => y(d[highMeasure].value))
      .attr("width", x.bandwidth() * config.columnWidthFactor)
      .attr("height", d => Math.max(0, y(d[lowMeasure].value) - y(d[highMeasure].value)))
      .attr("fill", config.barColor);

    // Draw reference lines inside each column for the average value
    svg.selectAll(".column-average-line")
      .data(data)
      .enter().append("line")
      .attr("class", "column-average-line")
      .attr("x1", d => (x(d[queryResponse.fields.dimension_like[0].name].value) as number) + (x.bandwidth() * (1 - config.columnWidthFactor) / 2))

      .attr("x2", d => (x(d[queryResponse.fields.dimension_like[0].name].value) as number) + (x.bandwidth() * (1 - config.columnWidthFactor) / 2) + (x.bandwidth() * config.columnWidthFactor))
      .attr("y1", d => y(d[averageMeasure].value))
      .attr("y2", d => y(d[averageMeasure].value))
      .attr("stroke", config.columnMeanLineColor)
      .attr("stroke-width", config.columnMeanLineWidth)
      ;

    // conditionally apply line style
    if (config.columnMeanLineStyle === "dashed") {
      svg.selectAll(".column-average-line")
        .attr("stroke-dasharray", "4 4");
    } else if (config.columnMeanLineStyle === "dotted") {
      svg.selectAll(".column-average-line")
        .attr("stroke-dasharray", "1 2");
    }

    const globalMax = d3.max(highValues) as number;
    const globalMin = d3.min(lowValues) as number;


    // Draw reference lines across the entire chart for the highest and lowest values
    svg.append("line")
      .attr("class", "global-max-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(globalMax))
      .attr("y2", y(globalMax))
      .attr("stroke", config.globalMaxLineColor)
      .attr("stroke-width", config.globalMaxLineWidth)

    if (config.globalMaxLineStyle === "dashed") {
      svg.selectAll(".global-max-line")
        .attr("stroke-dasharray", "4 4");
    } else if (config.globalMaxLineStyle === "dotted") {
      svg.selectAll(".global-max-line")
        .attr("stroke-dasharray", "1 2");
    }

    svg.append("line")
      .attr("class", "global-min-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(globalMin))
      .attr("y2", y(globalMin))
      .attr("stroke", config.globalMinLineColor)
      .attr("stroke-width", config.globalMinLineWidth)

    // conditionally apply line style
    if (config.globalMinLineStyle === "dashed") {
      svg.selectAll(".global-min-line")
        .attr("stroke-dasharray", "4 4");
    } else if (config.globalMinLineStyle === "dotted") {
      svg.selectAll(".global-min-line")
        .attr("stroke-dasharray", "1 2");
    }
    // Draw reference line for the mean of all the high and low values
    svg.append("line")
      .attr("class", "mean-of-averages-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(meanOfAverages))
      .attr("y2", y(meanOfAverages))
      .attr("stroke", config.meanOfAveragesLineColor)
      .attr("stroke-width", config.meanOfAveragesLineWidth)

    // conditionally apply line style
    if (config.meanOfAveragesLineStyle === "dashed") {
      svg.selectAll(".mean-of-averages-line")
        .attr("stroke-dasharray", "4 4");
    } else if (config.meanOfAveragesLineStyle === "dotted") {
      svg.selectAll(".mean-of-averages-line")
        .attr("stroke-dasharray", "1 2");
    }


    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(0, ${height + margin.bottom})`);

    const legendItems = [
      { name: config.globalMaxLegendName, color: config.globalMaxLineColor, y: y(globalMax) },
      { name: config.globalMinLegendName, color: config.globalMinLineColor, y: y(globalMin) },
      { name: config.meanOfAveragesLegendName, color: config.meanOfAveragesLineColor, y: y(meanOfAverages) },
      { name: config.columnMeanLegendName, color: config.columnMeanLineColor, y: y((d3.max(highValues) as number + d3.min(lowValues) as number) / 2) },
      { name: config.columnLegendName, color: config.barColor, y: y((d3.max(highValues) as number + d3.min(lowValues) as number) / 2) }
    ];
    // Add legend for any configured legend names


    // Filter out legend items with no name
    const filteredLegendItems = legendItems.filter(item => item.name && item.name.length > 0);
    const legendItemHeight = 20;
    const legendItemWidth = 100;
    // Create legend item groups
    const legendItemGroups = legend.selectAll(".legend-item")
      .data(filteredLegendItems)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // Append rectangles and text to legend items
    legendItemGroups.append("circle")
      .attr("cx", 5)
      .attr("cy", 10)
      .attr("r", 5)
      .attr("fill", d => d.color);

    legendItemGroups.append("text")
      .attr("x", 15)
      .attr("y", 11)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "middle")
      // add font size
      .style("font-size", config.legendFontSize + "px")
      .style("font-family", config.legendFontFamily)
      .style("font-weight", config.legendFontWeight)
      .style("fill", config.legendFontColor)
      .text(d => d.name);

    // Measure text width and set legend item width
    legendItemGroups.each(function (d) {
      const textElement = d3.select(this).select("text");
      // @ts-ignore
      const textWidth = textElement.node()?.getBBox().width || 0;
      // @ts-ignore
      d.textWidth = textWidth;
    });

    // Adjust the position of each legend item based on the text width
    let currentX = 0;
    legendItemGroups.attr("transform", function (d) {
      const transform = `translate(${currentX}, 0)`;
      // @ts-ignore
      currentX += d.textWidth + 30; // Add some padding between legend items
      return transform;
    });


    // Calculate total legend width
    const totalLegendWidth = currentX;

    // Center the legend group
    const legendX = (width - totalLegendWidth) / 2;
    legend.attr("transform", `translate(${legendX}, ${height + margin.bottom - 20})`);
    done();
  },
};

looker.plugins.visualizations.add(vis);

export default vis;