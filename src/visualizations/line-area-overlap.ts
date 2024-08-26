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
    chartTitle: {
      type: "string",
      label: "Chart Title",
      display: "text",
      section: "Style",
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
    actualsCurveType: {
      type: "string",
      label: "Actuals Curve Type",
      display: "select",
      values: [
        { "Step": "step" },
        { "Linear": "linear" },
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

  },
  // Set up the initial state of the visualization
  create(element, config) {
    element.className = "highcharts-custom-vis";

  },
  // Render in response to the data or settings changing
  update(data, element, config, queryResponse) {
    // console.log("data", data);
    // console.log("element", element);
    // console.log("config", config);
    // console.log("queryResponse", queryResponse);

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
    const getHour = (datetimeString: string): number => {
      if (typeof datetimeString !== 'string') {
        console.error("datetimeString is not a string", datetimeString);
        return 0;
      }
      return moment.tz(datetimeString, detectedFormat, 'GMT').hour();
    }

    const getDatePart = (datetimeString: string): string => {
      return moment.tz(datetimeString, detectedFormat, 'GMT').format('YYYY-MM-DD');
    }

    const getTimestampFromHour = (datePart: string, hour: number): string => {
      return moment.tz(`${datePart} ${hour.toString().padStart(2, '0')}:00:00`, 'YYYY-MM-DD HH:mm:ss', 'GMT').format(detectedFormat);
    }

    // Extract the date part from the first row of data
    // This is necessary to properly assign the 'hour' shift changes as a datatime
    const datePart = getDatePart(data[0][dimension].value);

    const addInterpolatedPoints = (
      data: any[],
      dimension: string,
      actualMeasure: string,
      coverageMeasure: string,
      startTimestamp: number,
      endTimestamp: number
    ) => {
      let overDataPoints: any[] = [];
      let underDataPoints: any[] = [];

      for (let i = 0; i < data.length - 1; i++) {
        const currentPoint = data[i];
        const nextPoint = data[i + 1];

        const currentTime = moment.tz(currentPoint[dimension].value, detectedFormat, 'GMT').valueOf();
        const nextTime = moment.tz(nextPoint[dimension].value, detectedFormat, 'GMT').valueOf();
        const currentActual = currentPoint[actualMeasure]?.value;
        const currentCoverage = currentPoint[coverageMeasure]?.value;
        const nextActual = nextPoint[actualMeasure]?.value;
        const nextCoverage = nextPoint[coverageMeasure]?.value;
        if (currentTime > startTimestamp && nextTime < endTimestamp) {


          const isCrossing = (currentActual > currentCoverage && nextActual < nextCoverage) || (currentActual < currentCoverage && nextActual > nextCoverage);
          if (isCrossing) {
            // Add the crossing point to the overDataPoints and underDataPoints
            //switch the y values if the curve type is step 
            if (config.actualsCurveType === 'step') {
              if (currentActual > currentCoverage) {
                overDataPoints.push([currentTime, currentCoverage, currentActual]);
                underDataPoints.push([currentTime, currentCoverage, currentCoverage]);
              } else {
                overDataPoints.push([currentTime, currentCoverage, currentCoverage]);
                underDataPoints.push([currentTime, currentCoverage, currentActual]);
              }
            } else {
              const crossingTime = currentTime + (((nextTime - currentTime) * (currentCoverage - currentActual)) / (nextActual - currentActual));
              overDataPoints.push([crossingTime, currentCoverage, currentCoverage]);
              underDataPoints.push([crossingTime, currentCoverage, currentCoverage]);
            }
          }
        }
        // add in interpolated points for the start of the series
        if (currentTime < startTimestamp && nextTime > startTimestamp) {
          // The time is the startTimestamp
          // The value is the interpolated value between the current and next point
          const crossingTime = startTimestamp;
          const crossingValue = currentActual + (((nextActual - currentActual) * (crossingTime - currentTime)) / (nextTime - currentTime));
          if (crossingValue >= nextCoverage) {
            overDataPoints.push([startTimestamp, nextCoverage, crossingValue]);

          } else {
            underDataPoints.push([startTimestamp, nextCoverage, crossingValue]);
          }
        }
        // // add in interpolated points for the end of the series
        if (currentTime < endTimestamp && nextTime > endTimestamp) {
          // The time is the endTimestamp
          // The value is the interpolated value between the current and next point
          const crossingTime = endTimestamp;
          const crossingValue = currentActual + (((nextActual - currentActual) * (crossingTime - currentTime)) / (nextTime - currentTime));
          if (config.actualsCurveType === 'step') {
            if (crossingValue >= nextCoverage) {
              overDataPoints.push([endTimestamp, nextCoverage, nextActual]);
            } else {
              underDataPoints.push([endTimestamp, nextCoverage, nextActual]);
            }
          } else if (crossingValue >= nextCoverage) {
            overDataPoints.push([endTimestamp, nextCoverage, crossingValue]);
          } else {
            underDataPoints.push([endTimestamp, nextCoverage, crossingValue]);
          }
        }
      }


      console.log("overDataPoints", overDataPoints);
      console.log("underDataPoints", underDataPoints);
      return { interpolatedOverDataPoints: overDataPoints, interpolatedUnderDataPoints: underDataPoints };
    };
    // Create an array of range measures with color and value
    // This comes from the first row of data
    const rangeMeasuresData = measures1.filter((measure) => config[`${measure.name}_type`] === "range");
    // Range data for the first highlighted hour

    const rangeData: any[] = [];

    rangeMeasuresData.forEach((measure, rangeDataIndex) => {
      const calculateDataPoints = (hourOffset: number) => {
        const startTimestamp = moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value + hourOffset), detectedFormat, 'GMT').valueOf();
        const endTimestamp = moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value + hourOffset + 1), detectedFormat, 'GMT').valueOf();

        const overDataPoints = data.map((row) => {
          const timestamp = moment.tz(row[dimension].value, detectedFormat, 'GMT').valueOf();
          const isInRange = timestamp >= startTimestamp && timestamp <= endTimestamp;
          // const timestampDiffs = [startTimestamp, endTimestamp, timestamp].map(t => moment(t).format('YYYY-MM-DD HH:mm:ss'));
          // console.log('timestampDiffs', timestampDiffs, isInRange);
          if (isInRange && row[coverageMeasure].value <= row[actualMeasure].value) {
            return [timestamp, row[coverageMeasure].value, row[actualMeasure].value];
          } else {
            return null;
          }
        }).filter((point) => point !== null);

        const underDataPoints = data.map((row) => {
          const timestamp = moment.tz(row[dimension].value, detectedFormat, 'GMT').valueOf();
          const isInRange = timestamp >= startTimestamp && timestamp <= endTimestamp;
          if (isInRange && row[coverageMeasure].value > row[actualMeasure].value) {
            return [timestamp, row[coverageMeasure].value, row[actualMeasure].value];
          } else {
            return null;
          }
        }).filter((point) => point !== null);

        const { interpolatedOverDataPoints, interpolatedUnderDataPoints } = addInterpolatedPoints(data, dimension, actualMeasure, coverageMeasure, startTimestamp, endTimestamp);
        const combinedOverDataPoints = [...overDataPoints, ...interpolatedOverDataPoints].sort((a, b) => a[0] - b[0]);
        const combinedUnderDataPoints = [...underDataPoints, ...interpolatedUnderDataPoints].sort((a, b) => a[0] - b[0]);

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
        showInLegend: rangeDataIndex === 0 ? true : false,
      });

      rangeData.push({
        name: "Second Hour",
        color: config.rangeColor2[0],
        underColor: config.underColor2[0],
        overColor: config.overColor2[0],
        value: secondHourData.startTimestamp,
        overData: secondHourData.overDataPoints,
        underData: secondHourData.underDataPoints,
        showInLegend: rangeDataIndex === 0 ? true : false,
      });

    });

    console.log("rangeData", rangeData);
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
      chart: {
        type: 'area'
      },
      title: {
        text: config.chartTitle || 'Coverage vs Actual'
      },
      tooltip: {
        formatter: function () {

          const timestamp = Number(this.point.x);
          let tooltipContent = `<b>${Highcharts.dateFormat('%A %H:%M', timestamp)}</b><br/>`;

          this.points && this.points.forEach(point => {
            if (point.series.name === "Coverage" || point.series.name === "Avg. Actual") {
              tooltipContent += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.y}</b><br/>`;
            }
          });

          return tooltipContent;
        },
        shared: true
      },
      xAxis: {
        type: "datetime",
        labels: {
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
        title: {
          text: 'Values'
        }
      },
      legend: {
        align: config.legendAlign || 'center', // Dynamic horizontal alignment
        verticalAlign: config.legendVerticalAlign || 'bottom', // Dynamic vertical alignment
        layout: (config.legendAlign === 'right' && config.legendVerticalAlign === 'middle') ? 'vertical' : 'horizontal', // Set layout to vertical if legend is center-right
      },
      series: [{
        name: 'Coverage',
        // Pull from the first measure with the _type of coverage
        data: data.map((row) => {
          return {
            x: moment.tz(row[dimension]?.value, detectedFormat, 'GMT').valueOf(),
            y: row[coverageMeasure]?.value
          }
        }),
        type: 'line',
        color: config.coverageColor && config.coverageColor[0],
        zIndex: 1,
        step: 'right',
        marker: getMarkerOptions(coverageMarkerType, config.coverageColor[0], config.coverageMarkerSymbol),
        lineWidth: coverageLineWidth
      }, {
        name: 'Avg. Actual',
        data: data.map((row) => {
          return {
            x: moment.tz(row[dimension]?.value, detectedFormat, 'GMT').valueOf(),
            y: row[actualMeasure]?.value
          }
        }),
        type: 'line',
        color: config.actualColor[0],
        zIndex: 1,
        marker: getMarkerOptions(actualMarkerType, config.actualColor[0], config.actualMarkerSymbol),
        lineWidth: actualLineWidth
      },
      // Make a series for each range measure
      // This is a floating area series that only exists to create the fill between the two lines
      // The two lines are the avg actual and coverage for the data values and the color
      // of the fill is determined by the range measure's overUnderColor
      ...rangeData.map((range) => {
        const newRange: Highcharts.SeriesOptionsType = {

          name: `${range.name} Over`,
          type: 'arearange',
          color: range.overColor,
          data: range.overData,
          fillOpacity: 1,
          zIndex: 0,
          marker: { enabled: false },
          dataLabels: { enabled: false },
          showInLegend: range.showInLegend
        }
        return newRange;
      }),
      ...rangeData.map((range) => {
        const newRange: Highcharts.SeriesOptionsType = {

          name: `${range.name} Under`,
          type: 'arearange',
          color: range.underColor,
          data: range.underData,
          fillOpacity: 1,
          zIndex: 0,
          marker: { enabled: false },
          dataLabels: { enabled: false },
          showInLegend: range.showInLegend
        }
        return newRange;
      }),

      ]
    }
    if (config.actualsCurveType === 'step' && options.series && options.series[1]) {
      options.series.forEach(series => {
        // @ts-ignore
        series.step = 'right';
      });
    }
    if (config.actualsCurveType === 'step' && options.series && (detectedFormat === 'YYYY-MM-DD HH:mm' || detectedFormat === 'YYYY-MM-DD HH')) {
      options.series.forEach((series,i) => {
        // @ts-ignore
        if (i>1) series.step = 'left';
      });
    }


    Highcharts.chart(element, options);
  },
};

looker.plugins.visualizations.add(vis);
