import { arrayBuffer } from "stream/consumers";

export const ganttOptions = {
    xAxisLineColor: {
        type: "string",
        label: "X Axis Line Color",
        display: "color",
        default: "lightgray",
        section: "Axes",
    },
    xAxisTickCount: {
        type: "number",
        label: "X Axis Tick Count",
        display: "range",
        min: 1,
        max: 20,
        step: 1,
        default: 10,
        section: "Axes",
    },
    yAxisLabelColor: {
        type: "string",
        label: "Y Axis Label Color",
        display: "color",
        default: "lightgray",
        section: "Axes",
    },

    rowPaddingPercentage: {
        type: "number",
        label: "Row Padding Percentage",
        display: "range",
        min: 0,
        max: 100,
        step: 1,
        default: 10,
        section: "Style",
    },
    titleColumn: {
        type: "string",
        label: "Title Column",
        display: "select",
        values: [],
        section: "Style",
        order:1
    },
    chartTitle: {
        type: "string",
        label: "Chart Title",
        display: "text",
        section: "Style",
        order:2
    },
    titleSize: {
        type: "string",
        label: "Title Size",
        display: "text",
        section: "Style",
        default: "18",
        placeholder:"18",
        order:3
    },

    yAxisCategories: {
        type: "array",
        label: "Y-Axis Categories",
        display: "text",
        section: "Style",
        order:5
    },
    refBand1Name: {
        type: "string",
        label: "Reference Band 1 Name",
        display: "text",
        default: "Reference Band 1",
        section: "Style",
        order:6
    },
    refBand2Name: {
        type: "string",
        label: "Reference Band 2 Name",
        display: "text",
        default: "Reference Band 2",
        section: "Style",
        order:7
    },
    refBand1Color: {
        type: "string",
        label: "Reference Band 1 Color",
        display: "color",
        section: "Style",
        default: "rgba(68, 170, 213, 0.1)",
        order:8
    },
    refBand2Color: {
        type: "string",
        label: "Reference Band 2 Color",
        display: "color",
        section: "Style",
        default: "rgba(68, 170, 213, 0.1)",
        order:9
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
    legendFontSize: {
        type: "string",
        label: "Legend Font Size",
        display: "text",
        section: "Style",
        default: "12",
        placeholder: "12",
        order:10
    },

    toolOffY: {
      type: "boolean",
      label: "Turn off Y Axis",
      default: false,
      section: "Axes",
      order:11
    },
    bodyStyle: {
      type: "string",
      label: "Choose Font for Viz",
      display: "select",
      values: [{"Noto Sans" :"'Noto Sans'"},{ "Roboto": "'Roboto'" } , { "Open Sans": "'Open Sans'" }, {"Montserrat" : "'Montserrat'"}],
      section: "Style",
      default: "'Noto Sans', sans-serif",
      order:12

    },
    weightTitle: {
      type: "string",
       label: "Font Weight Title",
       default: "400",
       display: "text",
       placeholder: "400",
       section: "Style",
       order:13

    },

    rotateY: {
      type: "boolean",
      label: "Rotate Y Axis Vertical",
      default: false,
      section: "Axes",
      order:14
    },

    legendPosition: {
      type: "string",
      label: "Legend Position",
      display: "select",
      values: [{ "Center": "legendCenter"} ,
      { "Left": "legendLeft" },
      {"Right" : "legendRight"}],
      section: "Style",
      default: "legendCenter",
      order:15

    },
    square: {
      type: "boolean",
      label: "Change Legend to Squares",
      default: false,
      section: "Style",
      order:16
    },

    changeCircleSize: {
      type: "string",
       label: "Change Legend Circle Size",
       default: "12",
       display: "text",
       placeholder: "12",
       section: "Style",
       order:17

    },

   moveLegendCircle: {
      type: "string",
       label: "Move Legend Circle Up",
       default: "0",
       display: "text",
       placeholder: "0",
       section: "Style",
       order:18

    },

    moveLegend: {
       type: "string",
        label: "Legend Padding",

        display: "select",
        values: [{ "More": "48"} ,
        { "Normal": "38" },
        {"Less" : "30"}],
       default: "Normal",
        section: "Style",
        order:19

     },

     axesFontSize: {
        type: "string",
         label: "Axes Font Size",
         default: "10px",
         display: "text",
         placeholder: "10px",
         section: "Style",
         order:20

       },
       titleColor: {
         type: "string",
         label: "Title Color",
         default: "#00000",
         display: "text",
         placeholder: "#00000",

         order: 21,
         section: "Style",
       },






}
