import { Looker, VisualizationDefinition } from "../common/types";
import {
  handleErrors,
  getMinMaxDatetimes,
  processQueryResponse,
} from "../common/utils";
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import moment from 'moment-timezone';
import { start } from "repl";

more(Highcharts);

declare var looker: Looker;

declare var LookerCharts: {
  Utils: {
    htmlForCell: (cell: any) => string;
  };
};

const detectDateTimeFormat = (datetimeString: string): string => {
  const colonCount = (datetimeString.match(/:/g) || []).length;
  if (colonCount === 2) {
    return 'YYYY-MM-DD HH:mm:ss';
  } else if (colonCount === 1) {
    return 'YYYY-MM-DD HH:mm';
  } else {
    return 'YYYY-MM-DD HH';
  }
};

interface LineAreaOverlapViz extends VisualizationDefinition {
  elementRef?: HTMLDivElement;
}

interface Measure {
  label: string;
  name: string;
}

const vis: LineAreaOverlapViz = {
  id: "gauge-chart", // id/label not required, but nice for testing and keeping manifests in sync
  label: "gauge-chart",
  //  These are the Looker Viz Config menu options.
  options: {
    actualColor: {
      type: "array",
      label: "Avg Actuals Color",
      display: "color",
      section: "Colors",
    },
    coverageColor: {
      type: "array",
      label: "Coverage Color",
      display: "color",
      section: "Colors",
    },
    actualMarkerType: {
      type: "string",
      label: "Actual Point Type",
      display: "select",
      values: [
        { "None": "none" },
        { "Filled": "filled" },
        { "Outline": "outline" },
      ],
      section: "Style",
    },
    actualLineWidth: {
      type: "number",
      label: "Actual Line Width",
      display: "range",
      max: 10,
      min: 1,
      step: 1,
      section: "Style",
    },
    coverageLineWidth: {
      type: "number",
      label: "Coverage Line Width",
      display: "range",
      max: 10,
      min: 1,
      step: 1,
      section: "Style",
    },
    coverageMarkerType: {
      type: "string",
      label: "Coverage Point Type",
      display: "select",
      values: [
        { "None": "none" },
        { "Filled": "filled" },
        { "Outline": "outline" },
      ],
      section: "Style",
    },
    legendAlign: {
      type: "string",
      label: "Legend Horizontal Alignment",
      display: "select",
      values: [
        { "Left": "left" },
        { "Center": "center" },
        { "Right": "right" },
      ],
      section: "Style",
    },
    legendVerticalAlign: {
      type: "string",
      label: "Legend Vertical Alignment",
      display: "select",
      values: [
        { "Top": "top" },
        { "Middle": "middle" },
        { "Bottom": "bottom" },
      ],
      section: "Style",
    },
    actualMarkerSymbol: {
      type: "string",
      label: "Actual Marker Symbol",
      display: "select",
      values: [
        { "Circle": "circle" },
        { "Square": "square" },
        { "Diamond": "diamond" },
        { "Triangle": "triangle" },
        { "Triangle Down": "triangle-down" },
      ],
      section: "Style",
    },
    coverageMarkerSymbol: {
      type: "string",
      label: "Coverage Marker Symbol",
      display: "select",
      values: [
        { "Circle": "circle" },
        { "Square": "square" },
        { "Diamond": "diamond" },
        { "Triangle": "triangle" },
        { "Triangle Down": "triangle-down" },
      ],
      section: "Style",
    },
    rangeColor1: {
      type: "array",
      label: "First Hour Range Color",
      display: "color",
      section: "Colors",
    },
    overColor1: {
      type: "array",
      label: "First Hour Over Color",
      display: "color",
      section: "Colors",
    },
    underColor1: {
      type: "array",
      label: "First Hour Under Color",
      display: "color",
      section: "Colors",
    },

    rangeColor2: {
      type: "array",
      label: "Second Hour Range Color",
      display: "color",
      section: "Colors",
    },
    overColor2: {
      type: "array",
      label: "Second Hour Over Color",
      display: "color",
      section: "Colors",
    },
    underColor2: {
      type: "array",
      label: "Second Hour Under Color",
      display: "color",
      section: "Colors",
    },
    coverageLabel: {
      type: "string",
      label: "Coverage Label",
      display: "text",
      section: "Labels",
    },
    actualLabel: {
      type: "string",
      label: "Actual Label",
      display: "text",
      section: "Labels",
    },
    firstRangeOverLabel: {
      type: "string",
      label: "First Hour Over Label",
      display: "text",
      section: "Labels",
    },
    firstRangeUnderLabel: {
      type: "string",
      label: "First Hour Under Label",
      display: "text",
      section: "Labels",
    },
    secondRangeOverLabel: {
      type: "string",
      label: "Second Hour Over Label",
      display: "text",
      section: "Labels",
    },
    secondRangeUnderLabel: {
      type: "string",
      label: "Second Hour Under Label",
      display: "text",
      section: "Labels",
    },
    chartTitle: {
      type: "string",
      label: "Chart Title",
      display: "text",
      section: "Labels",
    },
    showTitle: {
      type: "string",
      label: "Show Title",
      display: "select",
      values: [
        { "Yes": "yes" },
        { "No": "no" },
      ],
      section: "Labels",
    },
    axisFontColor: {
      type: "string",
      label: "Axis Font Color",
      display: "color",
      default: "#2C2D33",
      section: "Axes",
    },
    axisFontSize: {
      type: "string",
      label: "Axis Font Size",
      display: "text",
      default: "12px",
      section: "Axes",
    },
    legendFontSize: {
      type: "string",
      label: "Legend Font Size",
      display: "text",
      default: "12px",
      section: "Labels",
    },
    tooltipFontSize: {
      type: "string",
      label: "Tooltip Font Size",
      display: "text",
      default: "12px",
      section: "Labels",
    },
    hideYAxis: {
      type: "string",
      label: "Hide Y Axis",
      display: "select",
      values: [
        { "Yes": "yes" },
        { "No": "no" },
      ],
      section: "Axes",
    },
    xAxisLineColor: {
      type: "string",
      label: "X Axis Line Color",
      display: "color",
      default: "gray",
      section: "Axes",
    },
    legendFontColor: {
      type: "string",
      label: "Legend Font Color",
      display: "color",
      default: "#2C2D33",
      section: "Style",
    },
  },
  // Set up the initial state of the visualization
  create(element, config) {
    element.className = "highcharts-custom-vis";
    element.style.marginBottom = "0"; // Remove the 10px margin-bottom

  },
  // Render in response to the data or settings changing
  update(data, element, config, queryResponse) {

    
    // Expect 1 time series dimension and 3 or more measures
    const errors = handleErrors(this, queryResponse, {
      min_pivots: 0,
      max_pivots: 0,
      min_dimensions: 1,
      max_dimensions: 1,
      min_measures: 3,
      max_measures: 100,
    });

    const { measure_like: measureLike, dimension_like: dimensionLike } = queryResponse.fields;
    const measures1: Measure[] = measureLike.map((measure) => ({
      label: measure.label_short ?? measure.label,
      name: measure.name,
    }));

    const updatedOptions = { ...this.options };
    measures1.forEach((measure, i) => {
      updatedOptions[`${measure.name}_type`] = {
        section: "Metrics",
        type: "string",
        label: `${measure.label} Type`,
        display: "select",
        order: 3 * i,
        values: [
          { "Coverage": "coverage" },
          { "Actual": "actual" },
          { "Range": "range" },
        ],
      };
    })

    // if there are 2 or more measures with coverage or actual type, throw an error
    let coverageCount = 0;
    let actualCount = 0;
    let rangeCount = 0;
    let rangeMeasures: string[] = [];
    measures1.forEach((measure) => {
      const type = config[`${measure.name}_type`];
      if (type === "coverage") {
        coverageCount++;
      } else if (type === "actual") {
        actualCount++;
      } else if (type === "range") {
        rangeCount++;
        rangeMeasures.push(measure.name);
      }
    });
    if (coverageCount >= 2 || actualCount >= 2 || rangeCount <= 1) {
      this.addError && this.addError({
        title: `Incorrect Configuration`,
        message: `This visualization requires only one measure of each type: coverage and actual. 
        There are ${coverageCount} coverage measures and ${actualCount} actual measures.
        This visualization requires at least one range measure. There are ${rangeCount} range measures.`,
        group: 'configError'
      });
    } else { this.clearErrors && this.clearErrors('configError'); }

    // @ts-ignore
    this.trigger && this.trigger("registerOptions", updatedOptions);


    let timeSeries = dimensionLike.filter((field) => field.type?.includes("date"));

    if (timeSeries.length > 1) {
      this.addError &&
        this.addError({
          title: `Need a Single Date Dimension`,
          message: `This visualization requires only one date dimension. 
          There are ${timeSeries.length} date dimensions.`,
          group: 'dateError'
        });

    } else { this.clearErrors && this.clearErrors('dateError'); }

    // Define the measure names for coverage and actual
    const coverageMeasure = measures1.find((measure) => config[`${measure.name}_type`] === "coverage")?.name || '';
    const actualMeasure = measures1.find((measure) => config[`${measure.name}_type`] === "actual")?.name || '';
    const dimension = timeSeries[0].name


    // Detect the date-time format from the first row of data
    const detectedFormat = detectDateTimeFormat(data[0][dimension].value);
    console.log("detectedFormat", detectedFormat);

    const getDatePart = (datetimeString: string): string => {
      return moment.tz(datetimeString, detectedFormat, 'GMT').format('YYYY-MM-DD');
    }

    const getTimestampFromHour = (datePart: string, hour: number): string => {
      return moment.tz(`${datePart} ${hour.toString().padStart(2, '0')}:00:00`, 'YYYY-MM-DD HH:mm:ss', 'GMT').format(detectedFormat);
    }

    // Extract the date part from the first row of data
    // This is necessary to properly assign the 'hour' shift changes as a datatime
    const datePart = getDatePart(data[0][dimension].value);

    const sortedData = data.sort((a, b) => {
      return moment.tz(a[dimension].value, detectedFormat, 'GMT').valueOf() - moment.tz(b[dimension].value, detectedFormat, 'GMT').valueOf();
    });

    // Create an array of range measures with color and value
    // This comes from the first row of data
    const rangeMeasuresData = measures1.filter((measure) => config[`${measure.name}_type`] === "range");
    // Range data for the first highlighted hour

    const rangeData: any[] = [];

    rangeMeasuresData.forEach((measure, rangeDataIndex) => {
      const calculateDataPoints = (hourOffset: number) => {
        const startTimestamp = moment.tz(getTimestampFromHour(datePart, sortedData[0][measure.name].value + hourOffset), detectedFormat, 'GMT').valueOf();
        const endTimestamp = moment.tz(getTimestampFromHour(datePart, sortedData[0][measure.name].value + hourOffset + 1), detectedFormat, 'GMT').valueOf();

        const overDataPoints: any[] = []
        const underDataPoints: any[] = []
        const dataLength = sortedData.length;
        sortedData.forEach((row, i) => {
          const timestamp = moment.tz(row[dimension].value, detectedFormat, 'GMT').valueOf();
          const isInRange = timestamp >= startTimestamp && timestamp < endTimestamp;
          // the blockEndsAt is the lesser of the endTimestamp or the timestamp of the next row
          if (i === dataLength - 1 || !isInRange) {
            return;
          }
          const blockEndsAt = Math.min(endTimestamp, moment.tz(sortedData[i + 1][dimension].value, detectedFormat, 'GMT').valueOf());
          // const timestampDiffs = [startTimestamp, endTimestamp, timestamp].map(t => moment(t).format('YYYY-MM-DD HH:mm:ss'));
          // console.log('timestampDiffs', timestampDiffs, isInRange);
          if (row[coverageMeasure].value <= row[actualMeasure].value) {
            overDataPoints.push([timestamp, row[coverageMeasure].value, row[actualMeasure].value])
            overDataPoints.push([blockEndsAt, row[coverageMeasure].value, row[actualMeasure].value]);
          } else {
            underDataPoints.push([timestamp, row[coverageMeasure].value, row[actualMeasure].value])
            underDataPoints.push([blockEndsAt, row[coverageMeasure].value, row[actualMeasure].value]);
          }
        })

        // const { interpolatedOverDataPoints, interpolatedUnderDataPoints } = addInterpolatedPoints(sortedData, dimension, actualMeasure, coverageMeasure, startTimestamp, endTimestamp);
        // console.log('calling interpolatedPoints with', sortedData, dimension, actualMeasure, coverageMeasure, startTimestamp, endTimestamp);
        const combinedOverDataPoints = [...overDataPoints].sort((a, b) => a[0] - b[0]);
        const combinedUnderDataPoints = [...underDataPoints].sort((a, b) => a[0] - b[0]);
        // console.log("combinedOverDataPoints", combinedOverDataPoints);
        return {
          startTimestamp,
          endTimestamp,
          overDataPoints: combinedOverDataPoints,
          underDataPoints: combinedUnderDataPoints,
        };
      };

      const firstHourData = calculateDataPoints(0);
      const secondHourData = calculateDataPoints(1);

      rangeData.push({
        name: "First Hour",
        color: config.rangeColor1[0],
        underColor: config.underColor1[0],
        overColor: config.overColor1[0],
        value: firstHourData.startTimestamp,
        overData: firstHourData.overDataPoints,
        underData: firstHourData.underDataPoints,
        shiftChangeNumber: rangeDataIndex
      });

      rangeData.push({
        name: "Second Hour",
        color: config.rangeColor2[0],
        underColor: config.underColor2[0],
        overColor: config.overColor2[0],
        value: secondHourData.startTimestamp,
        overData: secondHourData.overDataPoints,
        underData: secondHourData.underDataPoints,
        shiftChangeNumber: rangeDataIndex,
      });

    });

    // console.log("rangeData", rangeData);
    // Retrieve the marker type configurations
    const actualMarkerType = config.actualMarkerType;
    const coverageMarkerType = config.coverageMarkerType;

    // Function to map marker type to Highcharts marker configuration
    const getMarkerOptions = (markerType: string, color: string = "#ffffff", symbol: string = "circle") => {
      switch (markerType) {
        case 'none':
          return { enabled: false, fillColor: '#000000', lineWidth: 0 };
        case 'filled':
          return { enabled: true, fillColor: color, lineWidth: 0, symbol: symbol };
        case 'outline':
          return { enabled: true, fillColor: '#ffffff', lineWidth: 2, lineColor: color, symbol: symbol };
        default:
          return { enabled: true, fillColor: color, lineWidth: 0, symbol: symbol };
      }
    };

    // Retrieve the line width configurations
    const actualLineWidth = config.actualLineWidth || 2; // Default to 2 if not set
    const coverageLineWidth = config.coverageLineWidth || 2; // Default to 2 if not set

    // Compose Highcharts Visualization options
    const options: Highcharts.Options = {
      credits: {
        enabled: false
      },
      chart: {
        type: 'area',
        marginTop: config.showTitle === 'yes' ? 40 : 8,
        marginBottom: 50,
      },
      title: {
        text: config.showTitle === 'yes' ? config.chartTitle : null,
        // config.chartTitle || 'Coverage vs Actual'
      },
      tooltip: {
        style: {
          fontSize: config.tooltipFontSize || '12px',
        },
        formatter: function () {

          const timestamp = Number(this.point.x);
          let tooltipContent = `<b>${Highcharts.dateFormat('%A %H:%M', timestamp)}</b><br/>`;

          const coverageLabel = config.coverageLabel || 'Coverage';
          const actualLabel = config.actualLabel || 'Actuals';
          this.points && this.points.forEach(point => {
            if (point.series.name === coverageLabel || point.series.name === actualLabel) {
              tooltipContent += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.y}</b><br/>`;
            }
          });

          return tooltipContent;
        },
        shared: true
      },
      xAxis: {
        lineColor: config.xAxisLineColor || 'gray',
        type: "datetime",
        tickLength: 0,
        labels: {
          style: {
            fontSize: config.axisFontSize || '12px',
            color: config.axisFontColor || '#2C2D33'
          },
          y: 15,
          enabled: true,
          formatter: function () {
            return Highcharts.dateFormat('%H:%M', Number(this.value));
          }
        },
        // Make a plotband for each range measure
        plotBands: rangeData.map((range) => ({
          from: range.value,
          to: range.value.valueOf() + 3600000,
          color: range?.color,
        }))
      },
      yAxis: {
        visible: config.hideYAxis === 'yes' ? false : true,
        title: {
          text: null
        },
        tickLength: 0,
        labels: {
          style: {
            fontSize: config.axisFontSize || '12px',
            color: config.axisFontColor || '#2C2D33'
          },
        }
      },
      legend: {
        itemStyle: {
          fontSize: config.legendFontSize || '12px',
          color: config.legendFontColor || '#2C2D33'
        },
        y: 18,
        align: config.legendAlign || 'center', // Dynamic horizontal alignment
        verticalAlign: config.legendVerticalAlign || 'bottom', // Dynamic vertical alignment
        layout: (config.legendAlign === 'right' && config.legendVerticalAlign === 'middle') ? 'vertical' : 'horizontal', // Set layout to vertical if legend is center-right
      },
      series: [{
        name: config.coverageLabel || 'Coverage',
        showInLegend: !!config.coverageLabel,
        // Pull from the first measure with the _type of coverage
        data: sortedData.map((row) => {
          return {
            x: moment.tz(row[dimension]?.value, detectedFormat, 'GMT').valueOf(),
            y: row[coverageMeasure]?.value
          }
        }),
        type: 'line',
        color: config.coverageColor && config.coverageColor[0],
        zIndex: 1,
        step: 'left',
        marker: getMarkerOptions(coverageMarkerType, config.coverageColor[0], config.coverageMarkerSymbol),
        lineWidth: coverageLineWidth
      }, {
        name: config.actualLabel || 'Avg. Actual',
        showInLegend: !!config.actualLabel,
        data: sortedData.map((row) => {
          return {
            x: moment.tz(row[dimension]?.value, detectedFormat, 'GMT').valueOf(),
            y: row[actualMeasure]?.value
          }
        }),
        type: 'line',
        color: config.actualColor[0],
        step: 'left',
        zIndex: 1,
        marker: getMarkerOptions(actualMarkerType, config.actualColor[0], config.actualMarkerSymbol),
        lineWidth: actualLineWidth
      },
      // Make a series for each range measure
      // This is a floating area series that only exists to create the fill between the two lines
      // The two lines are the avg actual and coverage for the data values and the color
      // of the fill is determined by the range measure's overUnderColor
      ...rangeData.map((range) => {
        const overLabel = range.name === 'First Hour' ? config.firstRangeOverLabel : config.secondRangeOverLabel ;
        console.log('range', range);
        const newRange: Highcharts.SeriesOptionsType = {
          // use the configured name for the range
          name: overLabel,
          type: 'arearange',
          showInLegend: range.shiftChangeNumber === 0 && !!overLabel,
          color: range.overColor,
          data: range.overData,
          fillOpacity: 1,
          zIndex: 0,
          marker: { enabled: false },
          dataLabels: { enabled: false },
        }
        return newRange;
      }),
      ...rangeData.map((range) => {
        const underLabel = range.name === 'First Hour' ? config.firstRangeUnderLabel : config.secondRangeUnderLabel ;

        const newRange: Highcharts.SeriesOptionsType = {
          name: underLabel,
          type: 'arearange',
          color: range.underColor,
          data: range.underData,
          fillOpacity: 1,
          zIndex: 0,
          marker: { enabled: false },
          dataLabels: { enabled: false },
          showInLegend: range.shiftChangeNumber === 0 && !!underLabel,
        }
        return newRange;
      }),

      ]
    }
    if (options.series && options.series[1]) {
      options.series.forEach(series => {
        // @ts-ignore
        series.step = 'left';
      });
    }
    if (options.series && (detectedFormat === 'YYYY-MM-DD HH:mm' || detectedFormat === 'YYYY-MM-DD HH')) {
      options.series.forEach((series, i) => {
        // @ts-ignore
        if (i > 1) series.step = 'left';
      });
    }


    Highcharts.chart(element, options);
  },
};

looker.plugins.visualizations.add(vis);
