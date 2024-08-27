import { Looker, VisualizationDefinition } from "../common/types";
import {
  handleErrors,
  processQueryResponse,
} from "../common/utils";
import Highcharts from 'highcharts';
// import More from 'highcharts/highcharts-more';
import Gantt from 'highcharts/modules/gantt';

// More(Highcharts);
Gantt(Highcharts);

declare var looker: Looker;

interface GanttViz extends VisualizationDefinition {
  elementRef?: HTMLDivElement;
}

const vis: GanttViz = {
  id: "gantt-chart",
  label: "Gantt Chart",
  options: {
    colorForCategories: {
        type: "array",
        label: "Color Categories",
        display: "colors",
        section: "Style",
    },
    chartTitle: {
      type: "string",
      label: "Chart Title",
      display: "text",
      section: "Style",
    },
    yAxisCategories: {
      type: "array",
      label: "Y-Axis Categories",
      display: "text",
      section: "Style",
    },
    nameDim: {
      type: "string",
      label: "Name Dimension",
      display: "select",
      values: [],
      section: "Data",
    },
    startDim: {
      type: "string",
      label: "Start Dimension",
      display: "select",
      values: [],
      section: "Data",
    },
    endDim: {
      type: "string",
      label: "End Dimension",
      display: "select",
      values: [],
      section: "Data",
    },
    ref1BandStart: {
      type: "string",
      label: "Reference Band 1 Start",
      display: "select",
      values: [],
      section: "Data",
    },
    ref1BandEnd: {
      type: "string",
      label: "Reference Band 1 End",
      display: "select",
      values: [],
      section: "Data",
    },
    ref2BandStart: {
      type: "string",
      label: "Reference Band 2 Start",
      display: "select",
      values: [],
      section: "Data",
    },
    ref2BandEnd: {
      type: "string",
      label: "Reference Band 2 End",
      display: "select",
      values: [],
      section: "Data",
    },
    colorCategory: {
        type: "string",
        label: "Color By Category",
        display: "select",
        values: [],
        section: "Data",
      },
  },
  create(element, config) {
    element.className = "highcharts-gantt-vis";
  },
  update(data, element, config, queryResponse) {
    handleErrors(this, queryResponse, {
      min_pivots: 0,
      max_pivots: 0,
      min_dimensions: 1,
      max_dimensions: 10,
      min_measures: 0,
      max_measures: 1,
    });

    const { dimension_like: dimensions } = queryResponse.fields;

    // Populate the select options for dimensions
    
    const dimensionOptions = dimensions.map(dim => ({ [dim.label]: dim.name }));

    const optionsToSet = ['nameDim', 'startDim', 'endDim', 'ref1BandStart', 'ref1BandEnd', 'ref2BandStart', 'ref2BandEnd', 'colorCategory'];

    optionsToSet.forEach(option => {
        this.options[option].values = dimensionOptions;
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
    const colorCategory = config.colorCategory || dimensions[7].name;

    const getColor = (category: string) => {
        const colornum = Number(category);
        if (isNaN(colornum)) {
            return category;
        }
        return config.colorForCategories[colornum];
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
    }

    // Create series with correct yAxis index
    // @ts-ignore
    const series: Highcharts.SeriesOptionsType[] = Object.keys(groupedData).map((name) => ({
      name,
      data: groupedData[name],
      type: "gantt",
    }));

    const options: Highcharts.Options = {
      chart: {
        type: 'gantt'
      },
      title: {
        text: config.chartTitle || 'Gantt Chart'
      },
      yAxis: {
        uniqueNames: true,
        categories: categories,
        title: {
          text: config.yAxisCategories || 'Categories'
        }
      },
      xAxis: {
        type: 'datetime',
        labels: {
            format: '{value:%H:%M}', 
            align: 'right'
        },
        plotBands: [
            {
                from: refBands.refBand1Start,
                to: refBands.refBand1End,
                color: 'rgba(68, 170, 213, 0.1)', // Customize the color as needed
                label: {
                    text: 'Reference Band 1',
                    align: 'center'
                }
            },
            {
                from: refBands.refBand2Start,
                to: refBands.refBand2End,
                color: 'rgba(0, 0, 0, 0.1)', // Customize the color as needed
                label: {
                    text: 'Reference Band 2',
                    align: 'center'
                }
            }
        ]
      },
      series: series
    };

    Highcharts.ganttChart(element, options);
  },
};

looker.plugins.visualizations.add(vis);