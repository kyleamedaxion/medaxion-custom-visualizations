import { Looker, VisualizationDefinition } from "../common/types";
import * as d3 from 'd3';
import { ganttOptions } from '../common/ganttOptions';
import "./styles.css";
declare var looker: Looker;

interface GanttViz extends VisualizationDefinition {
  elementRef?: HTMLDivElement;
}
type LegendItem = {
  element: d3.Selection<SVGGElement, unknown, null, undefined>;
  width: number;
};


export const vis: GanttViz = {
  id: "gantt-chart",
  label: "Gantt Chart",
  // @ts-ignore
  options: ganttOptions,
  create(element, config) {
    element.className = "d3-gantt-vis";
    const style = document.createElement('style');
    style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');

    .d3-gantt-vis {
      font-family:${config.bodyStyle ? config.bodyStyle : "'Noto Sans'"}
    }

  `;
    document.head.appendChild(style);
  },
  updateAsync(data, element, config, queryResponse, details, done) {

    const { dimension_like: dimensions } = queryResponse.fields;

    // Populate the select options for dimensions
    const dimensionOptions = dimensions.map(dim => ({ [dim.label]: dim.name }));

    const optionsToSet = ['nameDim', 'startDim', 'endDim', 'ref1BandStart', 'ref1BandEnd', 'ref2BandStart', 'ref2BandEnd', 'colorCategory', 'titleColumn'];

    optionsToSet.forEach(option => {
      this.options[option].values = dimensionOptions;
    });

      // console.log('optins to set', optionsToSet)
      // console.log('all options',this.options)
    const colorCategory = config.colorCategory;
    if (!colorCategory) {
      // @ts-ignore
      this.trigger && this.trigger("registerOptions", this.options);
      return
    }
    // console.log('colorCategory', colorCategory);
    const colorCategoryValues = data.map(row => row[colorCategory].value).filter((value, index, self) => self.indexOf(value) === index);
    colorCategoryValues.forEach((value, index) => {
      this.options[`colorFor${value}`] = {
        type: "string",
        label: `${value} Color`,
        display: "color",
        section: "Style",
      }
      this.options[`patternFor${value}`] = {
        type: "string",
        label: `${value} Pattern`,
        display: "select",
        values: [
          { "Solid": "solid" },
          { "Dots": "dots" },
          { "Crosshatch": "crosshatch" },
          { "Diagonal Stripes": "diagonalStripes" },
          { "Horizontal Stripes": "horizontalStripes" },
          { "Vertical Stripes": "verticalStripes" },
        ],
        section: "Style",
      }
    });
    // @ts-ignore
    this.trigger && this.trigger("registerOptions", this.options);

    const nameDim = config.nameDim || dimensions[0].name;
    const startDim = config.startDim || dimensions[1].name;
    const endDim = config.endDim || dimensions[2].name;
    const refBand1Start = config.ref1BandStart || dimensions[3].name;
    const refBand1End = config.ref1BandEnd || dimensions[4].name;
    const refBand2Start = config.ref2BandStart || dimensions[5].name;
    const refBand2End = config.ref2BandEnd || dimensions[6].name;
    const titleColumn = config.titleColumn || dimensions[0].name;
    const title = data[0][titleColumn].value || config.chartTitle || "Gantt Chart";
    const legendFontSize = config.legendFontSize || 12;
    const yAxis = config.toolOffY;


    const getColor = (category: string) => {
      return config[`colorFor${category}`] || 'black';
    }

    const getPattern = (category: string) => {
      return config[`patternFor${category}`] || 'solid';
    }

    // Group data by nameDim
    const groupedData = data.reduce((acc, row) => {
      const name = row[nameDim].value;
      if (!acc[name]) {
        // @ts-ignore
        acc[name] = [];
      }
      acc[name].push({
        name: row[nameDim].value,
        start: new Date(row[startDim].value).getTime(),
        end: new Date(row[endDim].value).getTime(),
        color: row[colorCategory] ? getColor(row[colorCategory].value) : undefined,
      });
      return acc;
    }, {});

    const categories = Object.keys(groupedData);

    // Assign yAxis index to each data point
    Object.keys(groupedData).forEach((name, index) => {
      // @ts-ignore
      groupedData[name].forEach(item => {
        item.y = index;
      });
    });

    const firstRow = data[0];
    const refBands = {
      refBand1Start: new Date(firstRow[refBand1Start].value).getTime(),
      refBand1End: new Date(firstRow[refBand1End].value).getTime(),
      refBand2Start: new Date(firstRow[refBand2Start].value).getTime(),
      refBand2End: new Date(firstRow[refBand2End].value).getTime(),
    };

    // Clear previous SVG
    d3.select(element).selectAll("*").remove();

    // Calculate left margin width based on axis values
    const longestLabel = categories.reduce((a, b) => a.length > b.length ? a : b, '');
    const tempSvg = d3.select('body').append('svg');
    const tempText = tempSvg.append('text')
      .attr('class', 'temp-text')
      .style("fill", config.titleColor ? config.titleColor : "#000000")
      .style('font-size', '10px')
      .text(longestLabel);

    const labelWidth = tempText.node()?.getBBox().width || 0;
    tempSvg.remove();

    // Calculate the top margin based on the title size
    const tempTitleSvg = d3.select('body').append('svg');
    const tempTitleText = tempTitleSvg.append('text')
      .attr('class', 'temp-text')
      .style("fill", config.titleColor ? config.titleColor : "#000000")
      .style('font-size', `${config.titleSize || 18}px`)
      .style('font-weight', `${config.weightTitle || "400"}`)
      .text(title);
    const titleHeight = tempTitleText.node()?.getBBox().height || 0;

    tempText.style('font-family', `${config.bodyStyle || "'Noto Sans'"}`);
    tempTitleSvg.remove();


    const additionalWidth = `${config.rotateY ? 5 : 25 }`
    console.log(additionalWidth, "additionalWidth")
    // Set up SVG container
    const margin = { top: titleHeight + 6, right: 20, bottom: 60, left: labelWidth + 25}; // Add some padding to the label width
    // const margin = { top: 34, right: 10, bottom: 38, left: labelWidth + 10 }; // Add some padding to the label width
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom + 15;

    const svg = d3.select(element)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 4)
      .attr("text-anchor", "middle")
      .style("fill", config.titleColor ? config.titleColor: "#000")
      .style("font-size", `${config.titleSize || 18}px`)
      .style('font-family', `${config.bodyStyle || "'Noto Sans'"}`)
      .style('font-weight', `${config.weightTitle || "400"}`)
      // .style("color", config.colors[0] ? config.colors[0] : "black")
      .text(title);

    const defs = svg.append("defs");

    defs.append("pattern")

      .attr("id", "crosshatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 10)
      .attr("height", 10)
      .append("path")
      .attr("d", "M0,0 L10,10 M10,0 L0,10")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    defs.append("pattern")
      .attr("id", "diagonalStripes")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 10)
      .attr("height", 10)
      .append("path")
      .attr("d", "M0,10 L10,0")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    defs.append("pattern")
      .attr("id", "dots")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 5)
      .attr("height", 5)
      .append("circle")
      .attr("cx", 2.5)
      .attr("cy", 2.5)
      .attr("r", 1)
      .attr("fill", "black");

    defs.append("pattern")
      .attr("id", "horizontalStripes")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 10)
      .attr("height", 4)
      .append("path")
      .attr("d", "M0,0 L10,0")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    defs.append("pattern")
      .attr("id", "verticalStripes")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 5)
      .attr("height", 10)
      .append("path")
      .attr("d", "M0,0 L0,10")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // Set up scales
    const minDate = d3.min(data, d => d[startDim].value ? new Date(d[startDim].value) : null);
    let maxDate = d3.max(data, d => d[endDim].value ? new Date(d[endDim].value) : null);
    // shift the max date if the value refBands.refBand2End is larger than the max date
    if (!maxDate || new Date(refBands.refBand2End) > maxDate) {
      maxDate = new Date(refBands.refBand2End);
    }

    // Extend the maximum date by 30 minutes
    const extendedMaxDate = maxDate ? new Date(maxDate) : new Date();
    extendedMaxDate.setMinutes(extendedMaxDate.getMinutes() + 30);
    const x = d3.scaleTime()
      .domain([
        minDate,
        extendedMaxDate
      ].filter(d => d !== null) as Date[])
      .range([0, width])
      ;

    const y = d3.scaleBand()
      .domain(categories)
      .range([0, height])
      .padding(config.rowPaddingPercentage ? config.rowPaddingPercentage / 100 : 0.1); // Use the padding percentage from config

    // Define custom time format for military time without leading zeros
    const customTimeFormat = d3.timeFormat("%-I:%M %p");
    const xAxisFontSize = config.axesFontSize ? parseInt(config.axesFontSize, 10) : 10;
    const xAxisPadding = xAxisFontSize * 0.3; // Adjust the multiplier as needed for desired padding
    
    // Add axes
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    // @ts-ignore
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%-H:%M")).tickSize(0).ticks(config.xAxisTickCount || 10))
    .selectAll('text')
    .style("font-weight", "100")
    .style('font-family', `${config.bodyStyle || "'Noto Sans'"}`)
    .style("font-size", config.axesFontSize ? config.axesFontSize : "10px")
    .style("stroke", config.xAxisLineColor || 'lightgray')
    .attr("y", xAxisPadding); // Apply the calculated padding
  ;


    svg.selectAll(".x.axis path")
      .style("stroke", config.xAxisLineColor || 'lightgray');

  //   if (!yAxis) {
  //   svg.append("g")
  //     .attr("class", "y axis")
  //     .call(d3.axisLeft(y).tickSizeOuter(0))
  //     .selectAll('text')
  //     .style("font-size", config.axesFontSize ? config.axesFontSize : "10px")

  //     .style("font-family", `${config.bodyStyle || "'Noto Sans'"}`)
  //     .style("text-anchor", `${config.rotateY ? "middle" : ""}`)
  //     .attr("transform", `${config.rotateY ? "rotate(-90) translate(7.5, -15)" : ""}`);
  // }
  svg.append("g")
  .attr("class", "y axis")
  .call(d3.axisLeft(y).tickSize(0))
  .selectAll("text")
  .style("font-family", config.bodyStyle || "'Source Sans Pro', sans-serif")
  .style("font-size", config.axesFontSize || "10px")

  .style("text-anchor", `${config.rotateY ? "middle" : ""}`)

  .attr("transform", `${config.rotateY ? "rotate(-90) translate(7.5, -15)" : ""}`)
  .style("color", config.yAxisLabelColor || "black");

  // Conditionally render y-axis line
  if (yAxis) {
    svg.selectAll(".y.axis path")
      .style("stroke", "none"); // Hide y-axis line
  }

    // Draw range bands
    svg.append("rect")
      .attr("class", "range-band")
      .attr("x", x(new Date(refBands.refBand1Start)))
      .attr("y", 0)
      .attr("width", x(new Date(refBands.refBand1End)) - x(new Date(refBands.refBand1Start)))
      .attr("height", height)

      .attr("fill", (d: any) => {
        return config.refBand1Color || "rgba(68, 170, 213, 0.1)";
      });

    svg.append("rect")
      .attr("class", "range-band")
      .attr("x", x(new Date(refBands.refBand2Start)))
      .attr("y", 0)
      .attr("width", x(new Date(refBands.refBand2End)) - x(new Date(refBands.refBand2Start)))
      .attr("height", height)

      .attr("fill", config.refBand2Color || "rgba(68, 170, 213, 0.1)");

    // Add background rectangles for alternating rows
    categories.forEach((category, index) => {
      if (index % 2 === 1) {
        svg.append("rect")
          .attr("x", 0)
          .attr("y", y(category) ?? 0)
          .attr("width", width)
          .attr("height", y.bandwidth())
          .attr("fill", config.alternateRowColor || "#f0f0f0") // Use the color from config or a default color
          .attr("opacity", 0.1); // Adjust opacity as needed
      }
    });

    // Draw bars
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => {
        const xPos = x(new Date(d[startDim].value));
        return xPos;
      })
      .attr("y", d => {
        const yPos = y(d[nameDim].value)?.toString() ?? '';
        return yPos;
      })
      .attr("width", d => {
        const width = x(new Date(d[endDim].value)) - x(new Date(d[startDim].value));
        return width;
      })
      .attr("height", y.bandwidth())
      // allow for color with patterns
      .attr("fill", d => getColor(d[colorCategory].value))

      .attr("rx", 3)
      .attr("fill-opacity", d => getPattern(d[colorCategory].value) === 'solid' ? 1 : 1); // Adjust opacity if pattern is used

    // Apply patterns to bars with patterns
    svg.selectAll(".bar-pattern")
      .data(data.filter(d => getPattern(d[colorCategory].value) !== 'solid'))
      .enter().append("rect")
      .attr("class", "bar-pattern")
      .attr("x", d => {
        const xPos = x(new Date(d[startDim].value));
        return xPos;
      })
      .attr("y", d => {
        const yPos = y(d[nameDim].value)?.toString() ?? '';
        return yPos;
      })
      .attr("width", d => {
        const width = x(new Date(d[endDim].value)) - x(new Date(d[startDim].value));
        return width;
      })
      .attr("height", y.bandwidth())
      .attr("fill", d => `url(#${getPattern(d[colorCategory].value)})`);

    // Define time format
    const timeFormat = d3.timeFormat("%H:%M");

    // Add tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute") // Ensure tooltip is positioned absolutely
      .style("background-color", "white") // Add white background to tooltip
      .style("padding", "5px") // Add padding to tooltip
      .style("border", "1px solid #ccc") // Add border to tooltip
      .style("border-radius", "4px") // Add border radius to tooltip
      .style('font-family', `${config.bodyStyle || "'Noto Sans'"}`)
      .style("font-size", "14px");

    svg.selectAll(".bar")
      .on("mouseover", function (event, d: any) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <b>Start:</b> ${timeFormat(new Date(d[startDim].value))}<br/>
          <b>End:</b> ${timeFormat(new Date(d[endDim].value))}<br/>
          <b>Duration:</b> ${Math.floor((new Date(d[endDim].value).getTime() - new Date(d[startDim].value).getTime()) / 3600000)}:${Math.floor(((new Date(d[endDim].value).getTime() - new Date(d[startDim].value).getTime()) % 3600000) / 60000)}
        `)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function (event) {
        const tooltipWidth = tooltip?.node()?.offsetWidth || 100;
        const tooltipHeight = tooltip?.node()?.offsetHeight || 100;
        const pageWidth = window.innerWidth;
        const pageHeight = window.innerHeight;
        const xOffset = 10;
        const yOffset = 10;

        let left = event.pageX + xOffset;
        let top = event.pageY + yOffset;

        if (event.pageX + tooltipWidth + xOffset > pageWidth) {
          left = event.pageX - tooltipWidth - xOffset;
        }

        if (event.pageY + tooltipHeight + yOffset > pageHeight) {
          top = event.pageY - tooltipHeight - yOffset;
        }

        tooltip.style("left", `${left}px`)
          .style("top", `${top}px`);
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    svg.selectAll(".bar-pattern")
      .on("mouseover", function (event, d: any) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <b>${config.yAxisCategories}: ${d[nameDim].value}</b><br/>
          <b>Category:</b> <span style="color: ${getColor(d[colorCategory].value)};">${d[colorCategory].value}</span><br/>
          <b>Start:</b> ${d[startDim].value}<br/>
          <b>End:</b> ${d[endDim].value}<br/>
          <b>Duration:</b> ${Math.floor((new Date(d[endDim].value).getTime() - new Date(d[startDim].value).getTime()) / 3600000)} hours ${Math.floor(((new Date(d[endDim].value).getTime() - new Date(d[startDim].value).getTime()) % 3600000) / 60000)} minutes
        `)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });


const makeNumber = Number(config.moveLegend) || 38


    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")

      .attr("transform", `translate(0, ${height + makeNumber})`)
      .style('font-family', `${config.bodyStyle || "'Noto Sans'"}`) // Add font-family
      .style("font-size", legendFontSize); // Add font-size

    // Add range colors to legend
    const rangeColors = [
      { label: config.refBand1Name, color: config.refBand1Color || "rgba(68, 170, 213, 0.1)" },
      { label: config.refBand2Name, color: config.refBand2Color || "rgba(68, 170, 213, 0.1)" }
    ];

    const legendItems: LegendItem[] = []
    rangeColors.forEach((range, i) => {
      if (range.label){
      const legendItem = legend.append("g")


      legendItem.append("rect")
        .attr("x", 0)
        .attr("y", config.moveLegendCircle ? -`${config.moveLegendCircle}` : 0)
        .attr("width", config.changeCircleSize ? config.changeCircleSize : 12)
        .attr("height", config.changeCircleSize ? config.changeCircleSize : 12)
        .attr("fill", range.color)
        .attr("radius", 3)
        .attr("rx", config.square ? 0 : 50)
        .attr("ry", 50)


      const text = legendItem.append("text")
        .attr("x", 22)
        .attr("y", 10)
        .text(range.label)
        .style("font-size", legendFontSize);

      const textWidth = text?.node()?.getBBox()?.width ?? 120;

      legendItems.push({ element: legendItem, width: textWidth + 50 }); // Store element and its width
      }
    });

    // Add colorCategoryValues to legend
    colorCategoryValues.forEach((value, i) => {
      const legendItem = legend.append("g")

      const pattern = getPattern(value);
      const color = getColor(value);
      const fill = pattern === 'Solid' ? getColor(value) : `url(#${pattern})`;

      legendItem.append("rect")
        .attr("x", 0)
        .attr("y", config.moveLegendCircle ? -`${config.moveLegendCircle}` : 0)
        .attr("width", config.changeCircleSize ? config.changeCircleSize : 12)
        .attr("height", config.changeCircleSize ? config.changeCircleSize : 12)
        .attr("fill", color)
        .attr("radius", 3)
        .attr("rx", config.square ? 0 : 50)
        .attr("ry", 50)

      // Add pattern rectangle if pattern is not 'Solid'
      if (pattern !== 'Solid') {
        legendItem.append("rect")
          .attr("x", 0)
          .attr("y", config.moveLegendCircle ? -`${config.moveLegendCircle}` : 0)
          .attr("width", config.changeCircleSize ? config.changeCircleSize : 12)
          .attr("height", config.changeCircleSize ? config.changeCircleSize : 12)
          .attr("fill", fill)
          .attr("rx", config.square ? 0 : 50)
          .attr("ry", 50)
          .attr("fill-opacity", 0.5); // Adjust opacity to show both color and pattern
      }

      const text = legendItem.append("text")
        .attr("x", 20)
        .attr("y", 10)

        .text(value)
        .style("font-size", legendFontSize)
        .style('font-family', `${config.bodyStyle || "'Noto Sans'"}`)

      // Adjust spacing based on text width
      const textWidth = text?.node()?.getBBox()?.width ?? 120;
      legendItems.push({ element: legendItem, width: textWidth + 50 }); // Store element and its width

    });
    // Calculate total width of all legend items
    const totalLegendWidth = legendItems.reduce((acc, item) => acc + item.width, 0);

    // Calculate starting x position to center legend items
    var legendCenter = (width - totalLegendWidth) / 2;

    var legendLeft = 0;

    var legendRight = (width - totalLegendWidth)



    // Position legend items
    let currentX =
    config.legendPosition === "legendCenter" ? legendCenter :
    config.legendPosition === "legendLeft" ? legendLeft:
    config.legendPosition === "legendRight" ? legendRight:
    legendCenter


    legendItems.forEach(item => {
      item.element.attr("transform", `translate(${currentX})`);
      currentX += item.width;
    });
    done()
  },

};

looker.plugins.visualizations.add(vis);

export default vis;
