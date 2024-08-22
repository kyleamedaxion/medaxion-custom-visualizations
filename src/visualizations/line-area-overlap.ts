import { Looker, VisualizationDefinition } from "../common/types";
import {
  handleErrors,
  getMinMaxDatetimes,
  processQueryResponse,
} from "../common/utils";
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import moment from 'moment-timezone';

more(Highcharts);

declare var looker: Looker;

declare var LookerCharts: {
  Utils: {
    htmlForCell: (cell: any) => string;
  };
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

    // For each measure with the _type of range, add four configurations for the before and after outer and over-under colors
    rangeMeasures.forEach((measure, i) => {
      updatedOptions[`${measure}_range_color_1`] = {
        section: "Colors",
        type: "array",
        label: `${measures1.find((m) => m.name === measure)?.label} First Hour Range Color`,
        display: "color",
        order: 5 * i + 1,
      };
      updatedOptions[`${measure}_over_under_color_1`] = {
        section: "Colors",
        type: "array",
        label: `${measures1.find((m) => m.name === measure)?.label} First Hour Over/Under Color`,
        display: "color",
        order: 5 * i + 2,
      };
      updatedOptions[`${measure}_range_color_2`] = {
        section: "Colors",
        type: "array",
        label: `${measures1.find((m) => m.name === measure)?.label} Second Hour Range Color`,
        display: "color",
        order: 5 * i + 1,
      };
      updatedOptions[`${measure}_over_under_color_2`] = {
        section: "Colors",
        type: "array",
        label: `${measures1.find((m) => m.name === measure)?.label} Second Hour Over/Under Color`,
        display: "color",
        order: 5 * i + 2,
      };
    })


    // const optionsArray: VisOption[] = Object.values(updatedOptions);
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

    const getHour = (datetimeString: string): number => {
      if (typeof datetimeString !== 'string') {
        console.error("datetimeString is not a string", datetimeString);
        return 0;
      }
      return moment.tz(datetimeString, 'YYYY-MM-DD HH:mm:ss', 'GMT').hour();
    }

    const getDatePart = (datetimeString: string): string => {
      return moment.tz(datetimeString, 'YYYY-MM-DD HH:mm:ss', 'GMT').format('YYYY-MM-DD');
    }

    const getTimestampFromHour = (datePart: string, hour: number): string => {
      return moment.tz(`${datePart} ${hour.toString().padStart(2, '0')}:00:00`, 'YYYY-MM-DD HH:mm:ss', 'GMT').format('YYYY-MM-DD HH:mm:ss');
    }

    // Extract the date part from the first row of data
    // This is necessary to properly assign the 'hour' shift changes as a datatime
    const datePart = getDatePart(data[0][dimension].value);


    const interpolate = (x: number, x0: number, y0: number, x1: number, y1: number): number => {
      return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
    };

    const addInterpolatedPoints = (transitionPoint: number) => {
      // Find the two nearest points
      let before = null;
      let after = null;
      for (let i = 0; i < data.length - 1; i++) {
        console.log("data[i]", data[i]);
        console.log('ts1', data[i][dimension].value, transitionPoint)
        if (moment.tz(data[i][dimension]?.value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf() <= transitionPoint && 
        moment.tz(data[i+1][dimension]?.value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf() >= transitionPoint) {
          before = data[i];
          after = data[i + 1];
          break;
        }
      }

      if (before && after) {
        const interpolatedCoverage = interpolate(transitionPoint, 
          moment.tz(before[dimension].value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(), before[coverageMeasure].value, 
          moment.tz(after[dimension].value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(), after[coverageMeasure].value);
        const interpolatedActual = interpolate(transitionPoint, 
          moment.tz(before[dimension].value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(), before[actualMeasure].value, 
          moment.tz(after[dimension].value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(), after[actualMeasure].value
        );
        return [[transitionPoint, interpolatedCoverage, interpolatedActual]];
      }
      return [];
    };
    // Create an array of range measures with color and value
    // This comes from the first row of data
    const rangeMeasuresData = measures1.filter((measure) => config[`${measure.name}_type`] === "range");
    // Range data for the first highlighted hour
    let rangeData = rangeMeasuresData.map((measure) => {
      const startTimestamp = moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value), 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf();
      const endTimestamp = moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value + 1), 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf();

      let dataPoints = data.map((row, rowIndex) => {
        const hour = getHour(row[dimension].value);
        const isInRange = hour === moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value), 'YYYY-MM-DD HH:mm:ss', 'GMT').hours();
        if (isInRange) {
          return [moment.tz(row[dimension]?.value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(), row[coverageMeasure].value, row[actualMeasure].value];
        } else {
          return null;
        }
      }).filter((point) => point !== null);

      // Add interpolated points at the start and end of the range
      const startInterpolatedPoints = addInterpolatedPoints(startTimestamp);
      const endInterpolatedPoints = addInterpolatedPoints(endTimestamp);

      dataPoints = [...startInterpolatedPoints, ...dataPoints, ...endInterpolatedPoints];
      return {
        name: measure.name + " hr1",
        color: config[`${measure.name}_range_color_1`][0],
        overUnderColor: config[`${measure.name}_over_under_color_1`][0],
        value: startTimestamp,
        data: dataPoints
      };
    })
    // Range data for the second highlighted hour
    rangeData = rangeData.concat(rangeMeasuresData.map((measure) => {
      const startTimestamp = moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value + 1), 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf();
      const endTimestamp = moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value + 2), 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf();

      let dataPoints = data.map((row, rowIndex) => {
        const hour = getHour(row[dimension].value);
        const isInRange = hour === moment.tz(getTimestampFromHour(datePart, data[0][measure.name].value + 1), 'YYYY-MM-DD HH:mm:ss', 'GMT').hours();
        if (isInRange) {
          return [moment.tz(row[dimension]?.value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(), row[coverageMeasure].value, row[actualMeasure].value];
        } else {
          return null;
        }
      }).filter((point) => point !== null);

      // Add interpolated points at the start and end of the range
      const startInterpolatedPoints = addInterpolatedPoints(startTimestamp);
      const endInterpolatedPoints = addInterpolatedPoints(endTimestamp);

      console.log("startInterpolatedPoints", startInterpolatedPoints);
      console.log("endInterpolatedPoints", endInterpolatedPoints);
      dataPoints = [...startInterpolatedPoints, ...dataPoints, ...endInterpolatedPoints];

      return {
        name: measure.name + " hr2",
        color: config[`${measure.name}_range_color_2`][0],
        overUnderColor: config[`${measure.name}_over_under_color_2`][0],
        value: startTimestamp,
        data: dataPoints
      };
    }));


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
            x: moment.tz(row[dimension]?.value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(),
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
            x: moment.tz(row[dimension]?.value, 'YYYY-MM-DD HH:mm:ss', 'GMT').valueOf(),
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

          name: range.name,
          type: 'arearange',
          data: range.data,
          fillOpacity: 1,
          color: range.overUnderColor,
          zIndex: 0,
          marker: { enabled: false },
          dataLabels: { enabled: false },
        }
        return newRange;
      }),

      ]
    }



    Highcharts.chart(element, options);
  },
};

looker.plugins.visualizations.add(vis);
