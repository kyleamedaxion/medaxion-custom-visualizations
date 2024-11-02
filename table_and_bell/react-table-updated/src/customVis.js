// To allow invalid https certificates from localhost in Chrome: chrome://flags/#allow-insecure-localhost

import * as React from "react";
import * as ReactDOM from "react-dom";
import { CustomTable } from "./CustomTable";

looker.plugins.visualizations.add({
  options: {
    headerStyles: {
      type: "string",
      label: "Header CSS Styles",
      order: 1,
      section: "Styles",
    },
    rowStyles: {
      type: "string",
      label: "Row CSS Styles",
      order: 2,
      section: "Styles",
    },
    generalCSS: {
      type: "string",
      label: "Genral CSS Overrides",
      order: 3,
      section: "Styles",
    },
    borderBetweenColumns: {
      type: "string",
      label: "What columns need thick borders?",
      order: 4,
      section: "Styles",
    },
    borderBetweenRows: {
      type: "string",
      label: "What rows need thick borders?",
      order: 5,
      section: "Styles",
    },
    groupByMeasure: {
      type: "boolean",
      label: "Group by Measure then Pivot",
      default: false,
      order: 6,
      section: "Styles",
    },
    conditionalHighlightStyle: {
      type: "string",
      label: "Conditional Highlight Style",
      section: "Conditional",
      order: 1,
    },
    hideTopHeaderRow: {
      type: "boolean",
      label: "Hide Top Header Row",
      default: false,
      section: "Styles",
      order: 7,
    },
    hideDimensionHeader: {
      type: "boolean",
      label: "Hide Dimension Header",
      default: false,
      section: "Styles",
      order: 8,
    },

    bodyStyle: {
      type: "string",
      label: "Choose Font",
      display: "select",
      values: [
        { Roboto: "'Roboto'" },
        { "Open Sans": "'Open Sans'" },
        { Montserrat: "'Montserrat'" },
      ],
      section: "Styles",
      default: "'Roboto', sans-serif",
      order: 9,
    },

    headerColor: {
      type: "array",
      label: "Header Background Color",
      display: "colors",
      default: [
        "#ffffff",
        "#efefef",
        "#00363d",
        "#17494d",
        "#498283",
        "#bdd9d7",
        "#aecfc2",
        "#d1e8df",
        "#edf8f4",
        "#f5fcfc",
      ],
      section: "Styles",
      order: 10,
    },

    headerFontColor: {
      type: "string",
      label: "Change Header Font Color",
      default: "#212529",
      display: "text",
      placeholder: "#212529",
      section: "Styles",
      order: 11,
    },

    fixedHeight: {
      type: "boolean",
      label: "Table Fixed Height",
      default: false,
      section: "Styles",
      order: 12,
    },
    unsetTable: {
      type: "boolean",
      label: "Make Table Column Width Unset",
      default: false,
      section: "Styles",
      order: 13,
    },
    stripe: {
      type: "boolean",
      label: "Turn off Row Borders",
      default: false,
      section: "Styles",
      order: 14,
    },
    verticalStripe: {
      type: "boolean",
      label: "Turn on Vertical Borders",
      default: false,
      section: "Styles",
      order: 15,
    },
    odd: {
      type: "string",
      label: "td Odd Background Color",
      default: "",
      display: "text",
      placeholder: "#FCFBFA",
      section: "Styles",
      order: 16,
    },
    weightHeader: {
      type: "string",
      label: "Font Weight Header (thead)",
      default: "500",
      display: "text",
      placeholder: "500",
      section: "Styles",
      order: 17,
    },

    weightTable: {
      type: "string",
      label: "Font Weight Table",
      default: "300",
      display: "text",
      placeholder: "300",
      section: "Styles",
      order: 18,
    },

    fontColor: {
      type: "string",
      label: "Change Table Font Color",
      default: "#212529",
      display: "text",
      placeholder: "#212529",
      section: "Styles",
      order: 19,
    },
    wrapText: {
      type: "boolean",
      label: "Wrap Text",
      default: false,
      section: "Styles",
      order: 20,
    },
    tableFontSize: {
      type: "string",
      label: "Font Size Table",
      default: "12px",
      display: "text",
      placeholder: "12px",
      section: "Styles",
      order: 21,
    },
    headFontSize: {
      type: "string",
      label: "Font Size Header (thead)",
      default: "14px",
      display: "text",
      placeholder: "14px",
      section: "Styles",
      order: 22,
    },

    headBorder: {
      type: "boolean",
      label: "Border Header (thead)",
      default: false,
      section: "Styles",
      order: 23,
    },

    // freeze: {
    //   type: "boolean",
    //   label: "Freeze First 2 Columns",
    //   default: false,
    //   order: 1,
    //   section: "Table",
    // },
  },

  create: function (element, config) {
    // console.log("create-config", config);
  },

  // The updateAsync method gets called any time the visualization rerenders due to any kind of change,
  // such as updated data, configuration options, etc.
  updateAsync: function (data, element, config, queryResponse, details, done) {
    let options = this.options;

    // Extract column names from the data
    const columnNames = queryResponse.fields.dimension_like
      .map((dim) => dim.name)
      .concat(queryResponse.fields.measure_like.map((measure) => measure.name));


  if (queryResponse.pivots && queryResponse.pivots.length > 0) {
    columnNames.forEach(function (field, index) {
      const indexWidth = `resize_${index}`;

    if (!options[indexWidth] && index < 1) {
        options[indexWidth] = {
          label: `Column width for:   ${field}`,
          default: "140px",
          placeholder: "140px",
          section: "Table",
          type: "string",
          display: "text",
          order: 10 + index,
        };
      }

    });

  }

  else {

    columnNames.forEach(function (field, index) {
      const indexWidth = `resize_${index}`;

    if (!options[indexWidth]) {
        options[indexWidth] = {
          label: `Column width for:   ${field}`,
          default: "140px",
          placeholder: "140px",
          section: "Table",
          type: "string",
          display: "text",
          order: 10 + index,
        };
      }

    });

  }

    columnNames.forEach((colName, index) => {
      const configKey = `rename_${colName}`;

      if (!options[configKey]) {
        options[configKey] = {
          type: "string",
          label: `Rename column: ${colName}`,
          default: colName,
          order: 10 + index,
          section: "Labels",
        };
      }
    });

    columnNames.forEach((colName, index) => {
      const configKey = `conditional_styles_${colName}`;
      if (!options[configKey]) {
        options[configKey] = {
          type: "string",
          label: `${colName} formats this column:`,
          default: colName,
          display: "select",
          values: [{ none: "None" }, ...columnNames.map((col) => ({ [col]: col }))],
          order: 10 + index,
          section: "Conditional",
          default: "none",
        };
      }
    });

    // If there are pivots, I want to also add rename options for the pivot values
    if (queryResponse.pivots && queryResponse.pivots.length > 0) {
      queryResponse.pivots.forEach((pivot, index) => {
        const configKey = `rename_${pivot.key}`;

        if (!options[configKey]) {
          options[configKey] = {
            type: "string",
            label: `Rename Pivot Value: ${pivot.key}`,
            default: pivot.key,
            order: 20 + index + columnNames.length,
            section: "Labels",
          };
        }
      });

      let lastIndex = queryResponse.pivots.length - 1;

      queryResponse.pivots.forEach((pivot, index) => {
        const indexWidth = `resize_${index}`;
        console.log(indexWidth, "indexWidth 1");

        const pivotWidth = `resize_${lastIndex + index + 2}`;

        console.log(pivotWidth, "pivotWodth", pivot.key);

        if (!options[pivotWidth]) {
          options[pivotWidth] = {
            label: `Column width for:  ${pivot.key}`,
            default: "140px",
            placeholder: "140px",
            section: "Table",
            type: "string",
            display: "text",
            order: 20 + index + columnNames.length,
          };
        }
      });
    }

    // register the options with the visualization
    this.trigger("registerOptions", options);

    ReactDOM.render(
      <CustomTable
        data={data}
        config={config}
        queryResponse={queryResponse}
        details={details}
        done={done}
      />,

      element
    );
    done();
  },
});
