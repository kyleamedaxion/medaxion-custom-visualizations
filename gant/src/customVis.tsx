import "./style.scss";
import { createRoot } from "react-dom/client";
import React from "react";
import "bootstrap/scss/bootstrap.scss";
import { Fields, Looker, LookerChartUtils } from "./types";
import BarLineVis from "./components/BarLineVis";

// Global values provided via the Looker custom visualization API
declare var looker: Looker;
declare var LookerCharts: LookerChartUtils;

interface ConfigOptions {
  [key: string]: {
    [key: string]: any;
    default: any;
  };
}

looker.plugins.visualizations.add({
  // The create method gets called once on initial load of the visualization.
  // It's just a convenient place to do any setup that only needs to happen once.
  create: function (element, config) {},

  // The updateAsync method gets called any time the visualization rerenders due to any kind of change,
  // such as updated data, configuration options, etc.
  updateAsync: function (data, element, config, queryResponse, details, done) {




    const { measure_like: measureLike } = queryResponse.fields;
    const { dimension_like: dimensionLike } = queryResponse.fields;

    const dimensions1 = dimensionLike.map((dimension) => ({
      label: dimension.label_short ?? dimension.label,
      name: dimension.name

    }));


    const measures1 = measureLike.map((measure) => ({
      label: measure.label_short ?? measure.label,
      name: measure.name,
    }));


    const fieldOptions = [...dimensions1, ...measures1].map((dim) => ({
      [dim.label]: queryResponse.data.map(row => row[dim.name].value).join(",")
    }));


    const fieldOptions2: FieldOptions2[] = [...dimensions1, ...measures1].map((dim) => ({
      [dim.label]: dim.label
    }));



    const { measure_like: measureLike } = queryResponse.fields;
    interface Measure {
      label: string;
      name: string;
    }

    interface Dimension {
      label: string;
      name: string;
    }

    const measures: Measure[] = measureLike.map((measure) => ({
      label: measure.label_short ?? measure.label,
      name: measure.name,
    }));

    const dimensions: Dimensions[] = dimensionLike.map((dimension) => ({
      label: dimension.label_short ?? dimension.label,
      name: dimension.name,
    }));

    interface FieldOption {
      [key: string]: string;
    }
    const fieldOptions0: FieldOption[] = [...dimensions, ...measures].map((all) => ({
      [all.label]: all.name,
    }));



    const lookerVis = this;
    const configOptions: ConfigOptions = {


      yAxisLeftValues: {
        label: "Choose Measure for Chart",
        type: "string",
        display: "select",
        default: "",
        values: fieldOptions0,
        section: "Chart",
        order: 0,
      },

      hideBox: {
        type: "boolean",
        label: "Hide KPI Box and Only Show Chart",
        default: false,
        order: 1,
        section: "Style",
      },
      textTitle: {
        type: "string",
        label: "Choose Title from Dropdown",
        display: "select",
        placeholder: "Please Select",
        values: fieldOptions,
        order: 3,
        default:"Please Select",
        section: "Style",
      },

      color_title: {
        type: 'array',
        label: 'Title Background Color',
        display: 'colors',
        default: ['#00363d', '#17494d', '#498283', '#bdd9d7', '#aecfc2', '#d1e8df', '#edf8f4', '#f5fcfc'],
        order: 4,
        section: "Style",
      },

      writeTitle: {
        type: "string",
        label: "Title Override",
        default: "",
        order: 5,
        section: "Style",
      },


      titleColor: {
        type: "string",
        label: "Title Color",
        default: "#ffffff",
        display: "text",
        placeholder: "#ffffff",

        order: 6,
        section: "Style",
      },

      yAxisDropdown: {
        type: "string",
        label: "Choose Percentage Change Value",
        display: "select",
        default: "",
        values: fieldOptions0,
        order: 6,
        default:"Please Select",
        section: "KPI",
      },
      showDifference: {
         type: "boolean",
         label: "Show % Difference Instead of Value",
         default: false,
         order: 7,
         section: "KPI",
       },


      hideTarget: {
        type: "boolean",
        label: "Hide Target",
        default: false,
        order: 8,
        section: "KPI",
      },




      toolOn: {
        type: "boolean",
        label: "Turn on Tooltip for KPI Tile",
        default: false,
        order: 9,
        section: "KPI",
      },

      writeTooltip: {
        type: "string",
        label: "Write Tooltip Text",
        default: "",
        order: 10,
        section: "KPI",
      },


      hideColors: {
        type: "boolean",
        label: "Hide Variance Colors",
        default: false,
        order: 11,
        section: "KPI",
      },


      symbol: {
        type: "string",
        label: "Select Target Value",
        display: "select",

        default:"",
        values: fieldOptions0,
        order: 26,

        section: "KPI",
      },


      writeTarget: {
        type: "string",
        label: "Override Target",
        default: "",
        order: 27,
        section: "KPI",
      },


      showXGridLines: {
        type: "boolean",
        label: "Show Legend",
        default: false,
        order: 21,
        section: "X-Axis",
      },
      showYGridLines: {
        type: "boolean",
        label: "Show Y Axis Tick Values",
        default: false,
        order: 22,
        section: "Y-Axis",
      },
      minYValues: {
        type: "string",
        label: "Minimum y values",
        default: "0",
        order: 23,
        section: "Y-Axis",
      },
      maxYValues: {
        type: "string",
        label: "Maximum y values",
        default: "1000000",
        order: 24,
        section: "Y-Axis",
      },
      showDatalabels: {
        type: "boolean",
        label: "Show Data Labels",
        default: false,
        order: 23,
        section: "Chart",
      },


      autoData: {
        type: "boolean",
        label: "Turn Off Auto Data Labels",
        default: false,
        order: 24,
        section: "Chart",
      },


      showX: {
        type: "boolean",
        label: "Show X Axis Tick Values",
        default: false,
        order: 24,
        section: "X-Axis",
      },

      showTwo: {
        type: "boolean",
        label: "Show First and Last X Axis Values",
        default: true,
        order: 25,
        section: "Chart",
      },

      color_range: {
        type: 'array',
        label: 'Color Range',
        display: 'colors',
        default: ['#a2c4c9', '#00363d', '#dd3333', '#80ce5d', '#f78131', '#369dc1', '#c572d3', '#36c1b3', '#b57052', '#ed69af'],
        order: 24,
        section: "Style",
      },
      lastBar: {
        type: "boolean",
        label: "Remove Dark Color from Last Column",
        default: false,
        order: 25,
        section: "Style",
      },
      // yAxisLeftValues: {
      //   type: "string",
      //   label: "Choose Measure Value for Chart",
      //   display: "select",
      //   default: kpiFieldDefault,
      //   values: fieldOptions0,
      //   order: 0,
      //
      //   section: "Chart",
      // },

      borderLine: {
        type: "boolean",
        label: "Remove Border",
        default: false,
        order: 26,
        section: "Style",
      },

      hideBottom: {
        type: "boolean",
        label: "Hide Bottom Section",
        default: false,
        order: 27,
        section: "Style",
      },



      xFontSize: {
        type: "string",
        label: "X Axis Tick Size",
        default: 10,
        display: "text",
        placeholder: 10,

        order: 30,
        section: "X-Axis",
      },


      yFontSize: {
        type: "string",
        label: "Y Axis Tick Size",
        default: 10,
        display: "text",
        placeholder: 10,

        order: 31,
        section: "Y-Axis",
      },
      legendSize: {
        type: "string",
        label: "Legend Size",
        default: 10,
        display: "text",
        placeholder: 10,

        order: 32,
        section: "X-Axis",
      },

      diagonal: {
        type: "boolean",
        label: "X Axis Ticks Diagonal",
        default: true,
        order: 28,
        section: "Chart",
      },

      changeLegend: {
        type: "string",
        label: "Override Legend",
        default: "",

        order: 29,
        section: "Chart",
      },

      secondLegend: {
        type: "boolean",
        label: "Turn on Second Legend",
        default: false,

        order: 32,
        section: "Chart",
      },

      secondMeasure: {
        type: "string",
        label: "Choose second measure to display in tooltip",
        display: "select",
        values: fieldOptions0,
        order: 33,
        default:"",
        section: "Chart",
      },

      hideTitle: {
        type: "boolean",
        label: "Hide Title",
        default: false,
        order: 28,
        section: "Style",
      },


  bodyStyle: {
      type: "string",
      label: "Choose Font",
      display: "select",
      values: [{ "Roboto": "'Roboto'" } , { "Open Sans": "'Open Sans'" }, {"Montserrat" : "'Montserrat'"}, {"IBM Plex Sans" :  "'IBM Plex Sans'"},{"DM Serif Text": "DM Serif Text"}],
      section: "Style",
      default: "'Roboto', sans-serif;",
      order: 29,
    },

      lineChart: {
        type: "boolean",
        label: "Switch to Line Chart",
        default: false,
        order: 30,
        section: "Style",
      },


      hideChart: {
        type: "boolean",
        label: "Hide Chart",
        default: false,
        order: 31,
        section: "Style",
      },

      decimalPlace: {
        type: "string",
        label: "# of Decimal",
        default: "1",
        order: 32,
        section: "Style",
      },

      targetLabel: {
        type: "string",
        label: "Select Target Label",
        display: "select",

        default:"",
        values: fieldOptions2,
        order: 28,

        section: "KPI",
      },


      writeTargetLabel: {
        type: "string",
        label: "Override Target Label",
        default: "",
        order: 29,
        section: "KPI",
      },

      showAverage: {
        type: "boolean",
        label: "Show Average Instead",
        default: false,
        order: 30,
        section: "KPI",
      },

      dollar: {
        type: "boolean",
        label: "Add Dollar Sign",
        default: false,
        order: 31,
        section: "KPI",
      },
      percentSign: {
        type: "boolean",
        label: "Add Percentage Sign",
        default: false,
        order: 32,
        section: "KPI",
      },

      hideCaret: {
        type: "boolean",
        label: "Hide Caret",
        default: false,
        order: 33,
        section: "KPI",
      },

      showDifferenceBottom: {
         type: "boolean",
         label: "Show % Difference Next to Target",
         default: false,
         order: 34,
         section: "KPI",
       },

       fullWidth: {
         type: "boolean",
         label: "Full Width Title",
         default: false,
         order: 35,
         section: "Style",
       },

       writeLabel: {
        type: "string",
        label: "Override Second Legend",
        default: "",
        order: 30,
        section: "Chart",
      },

      writeAggregateLabel: {
        type: "string",
        label: "Override Aggregate Label",
        default: "",
        order: 31,
        section: "Chart",
      },



    };




    lookerVis.trigger("registerOptions", configOptions);

    // assign defaults to config values, which first render as undefined until configOptions is registered
    const validatedConfig = { ...config };
    const configKeys = Object.keys(validatedConfig);
    for (let i = 0; i < configKeys.length; i++) {
      if (validatedConfig[configKeys[i]] === undefined) {
        const configKey = configKeys[i] as keyof typeof configOptions;
        validatedConfig[configKey] = configOptions[configKey].default;
      }
    }


    // get dimensions and measures
    const { dimension_like, measure_like, pivots } = queryResponse.fields;
    const fields: Fields = {
      dimensions: dimension_like.map((d) => d.name),
      dimensionsLabel: dimension_like.map((d) => d.label_short),
      measures: measure_like.map((m) => m.name),
      measuresLabel: measure_like.map((m) => m.label_short),
      pivots: pivots?.map((p) => p.name),
    };

    console.log(fields, "fields")

    // console.log(fields)

    // create react root
    element.innerHTML = '<div id="app"></div>';

    const root = createRoot(document.getElementById("app"));
    root.render(
      <BarLineVis
      data={data}
      fields={fields}
      config={validatedConfig}
      lookerCharts={LookerCharts}
      lookerVis={lookerVis}
      />
    );

    done();
  },
});
