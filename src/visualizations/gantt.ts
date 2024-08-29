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
    refBand1Name: {
      type: "string",
      label: "Reference Band 1 Name",
      display: "text",
      default: "Reference Band 1",
      section: "Style",
    },
    refBand2Name: {
      type: "string",
      label: "Reference Band 2 Name",
      display: "text",
      default: "Reference Band 2",
      section: "Style",
    },
    refBand1Color: {
      type: "string",
      label: "Reference Band 1 Color",
      display: "color",
      section: "Style",
      default: "rgba(68, 170, 213, 0.1)"
    },
    refBand2Color: {
      type: "string",
      label: "Reference Band 2 Color",
      display: "color",
      section: "Style",
      default: "rgba(68, 170, 213, 0.1)"
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
   
    const colorCategory = config.colorCategory || dimensions[7].name;
    // For each distinct data point value in the colorCategory, make an option for assigning a color.
    const colorCategoryValues = data.map(row => row[colorCategory].value).filter((value, index, self) => self.indexOf(value) === index);
    colorCategoryValues.forEach((value, index) => {
      this.options[`colorFor${value}`] = {
      
        type: "string",
        label: `Color for ${value}`,
        display: "color",
        section: "Style",
      }
    })

    // @ts-ignore
    this.trigger && this.trigger("registerOptions", this.options);

    const nameDim = config.nameDim || dimensions[0].name;
    const startDim = config.startDim || dimensions[1].name;
    const endDim = config.endDim || dimensions[2].name;
    const refBand1Start = config.ref1BandStart || dimensions[3].name;
    const refBand1End = config.ref1BandEnd || dimensions[4].name;
    const refBand2Start = config.ref2BandStart || dimensions[5].name;
    const refBand2End = config.ref2BandEnd || dimensions[6].name;



    const getColor = (category: string) => {
        return config[`colorFor${category}`] || 'black';
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
    console.log('refbands:',refBands);

    // @ts-ignore
    const series: Highcharts.SeriesOptionsType[] = Object.keys(groupedData).map((name) => ({
      name,
      data: groupedData[name],
      type: "gantt",
      showInLegend: false,
      marker: { enabled: false },
    }));

    // Add custom legend items for reference bands and color categories
    const legendItems = [
      {
        name: config.refBand1Name || 'Reference Band 1',
        color: config.refBand1Color,
        marker: {symbol: 'square'}
      },
      {
        name: config.refBand2Name || 'Reference Band 2',
        color: config.refBand2Color,
        marker: {symbol: 'square'},
      },
      ...colorCategoryValues.map(value => ({
        name: value,
        color: getColor(value),
        marker: {symbol: 'circle'}
      }))
    ];

    const options: Highcharts.Options = {
      chart: {
        type: 'gantt'
      },
      time: {
        useUTC: false,
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
                color: config.refBand1Color || 'rgba(68, 170, 213, 0.1)',  
            },
            {
                from: refBands.refBand2Start,
                to: refBands.refBand2End,
                color: config.refBand2Color || 'rgba(68, 170, 213, 0.1)', 
            }
        ]
      },
      legend: {
        enabled: true,
        useHTML: true,
        itemStyle: {
          display: 'flex',
          alignItems: 'center'
        },
        symbolRadius: 0,
        symbolHeight: 0,
        symbolWidth: 0,
        squareSymbol: false,
        labelFormatter: function () {
          const item = legendItems.find(i => i.name === this.name);
          
          
          return `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${item?.color}; margin-right: 5px; shape-outside: ${item?.marker?.symbol === 'square' ? 'square' : 'circle'};"></span>${this.name}`;
          // return `<span style="color:${item?.color}">${this.name}</span>`;
        }
      },
      tooltip: {
        enabled: true,
        formatter: function () {
          const point = this.point;
          const categoryIndex = point.y;
          const category = categories[Number(categoryIndex) || 0];
          console.log('point:',point);
          const colorCategory = point.color;
          const colorCategoryName = colorCategoryValues.find(value => getColor(value) === colorCategory);
          const x2 = point?.x2 as Highcharts.Point['x'];
          const start = Highcharts.dateFormat('%Y-%m-%d %H:%M', point?.x);
          const end = Highcharts.dateFormat('%Y-%m-%d %H:%M', x2);
          const durationMs = x2 - point?.x;
          const durationHours = Math.floor(durationMs / 3600000);
          const durationMinutes = Math.floor((durationMs % 3600000) / 60000);
          const duration = `${durationHours} hours ${durationMinutes} minutes`;

          return `
            <b>${config.yAxisCategories}: ${category}</b><br/>
            <b>Category:</b> <span style="color: ${colorCategory};">${colorCategoryName}</span><br/>
            <b>Start:</b> ${start}<br/>
            <b>End:</b> ${end}<br/>
            <b>Duration:</b> ${duration}`
          
          ;
        }
      },
      series: [
        ...series,
        ...legendItems.map(item => ({
          name: item.name,
          color: item.color,
          data: [],
          
        }) as unknown as Highcharts.SeriesOptionsType)
      ]
    };
    // @ts-ignore
console.log('options.x.plotbands:',options.xAxis?.plotBands);
    Highcharts.ganttChart(element, options);
  },
};

looker.plugins.visualizations.add(vis);