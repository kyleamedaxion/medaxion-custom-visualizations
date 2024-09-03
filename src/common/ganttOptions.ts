import { arrayBuffer } from "stream/consumers";

export const ganttOptions = {

    chartTitle: {
        type: "string",
        label: "Chart Title",
        display: "text",
        section: "Style",
    },
    alternateRowColor: {
        type: "array",
        label: "Alternate Row Color",
        display: "color",
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
}