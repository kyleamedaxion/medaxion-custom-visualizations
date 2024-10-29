import { arrayBuffer } from "stream/consumers";

export const ganttOptions = {

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
        order:3
    },
    alternateRowColor: {
        type: "array",
        label: "Alternate Row Color",
        display: "color",
        section: "Style",
        order:4
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
        order:10
    },

    toolOffY: {
      type: "boolean",
      label: "Turn off Y Axis",
      default: false,
      section: "Style",
      order:11
    },
    bodyStyle: {
      type: "string",
      label: "Choose Font",
      display: "select",
      values: [{ "Roboto": "'Roboto'" } , { "Open Sans": "'Open Sans'" }, {"Montserrat" : "'Montserrat'"}],
      section: "Style",
      default: "'Roboto', sans-serif;",
      order:12

    },
    weightTitle: {
      type: "string",
       label: "Font Weight Title",
       default: "300",
       display: "text",
       placeholder: "300",
       section: "Style",
       order:13

    },

    rotateY: {
      type: "boolean",
      label: "Rotate Y Axis Vertical",
      default: false,
      section: "Style",
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



}
