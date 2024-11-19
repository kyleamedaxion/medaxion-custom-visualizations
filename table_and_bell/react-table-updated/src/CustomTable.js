import React, { useMemo } from "react";
import styled from "styled-components";
import { useTable, useFlexLayout, useResizeColumns, useSortBy } from "react-table";

import "bootstrap/dist/css/bootstrap.min.css";
import { string } from "prop-types";


// Function to generate CSS for column borders
const generateColumnBordersCSS = (columnBorders) => {
  if (!columnBorders) return "";

  const columns = columnBorders.split(",").map(Number);

  return columns.map(col => `
  thead > tr:last-child > th:nth-child(${col}) {
    border-right: 3px solid #ddd; /* Adjust the border style and color as needed */
  }
      tbody td:nth-child(${col}) {
        border-right: 3px solid #ddd; /* Adjust the border style and color as needed */
      }
    `).join("\n");
};


// Function to generate CSS for row borders
const generateRowBordersCSS = (rowBorders, rowCount) => {
  if (!rowBorders) return "";

  const rows = rowBorders.split(",").map(Number);
  return rows.map(row => {
    const actualRow = row < 0 ? rowCount + row + 1 : row;
    return `
      tbody tr:nth-child(${actualRow}) {
        border-bottom: 3px solid #ddd; /* Adjust the border style and color as needed */
      }
    `;
  }).join("\n");
};



const Styles = ({ children, config, rowCount }) => {
  const {
    headerStyles,
    rowStyles,
    generalCSS,
    borderBetweenColumns,
    borderBetweenRows,
    hideTopHeaderRow,
    hideDimensionHeader,
    bodyStyle,
    headerColor,
    fixedHeight,
    unsetTable,
    odd,
    weightHeader,
    weightTable,
    fontColor,
    tableFontSize,
    headFontSize,
    headBorder,
    stripe,
    headerFontColor,
    verticalStripe
  } = config;

  const columnBordersCSS = useMemo(() => generateColumnBordersCSS(borderBetweenColumns), [borderBetweenColumns]);
  const rowBordersCSS = useMemo(() => generateRowBordersCSS(borderBetweenRows, rowCount), [borderBetweenRows, rowCount]);


  const StyledWrapper = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

    #vis-container {
      height: 100%;
      max-height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      font-weight: 300;
    }

    body {
      font-family: ${bodyStyle};
    }


    tr:nth-child(odd) td {
      background: ${odd ? `${odd} !important` : "#fff !important"};
    }
    .th {
      color: ${headerFontColor ? `${headerFontColor} !important` : "#212529"};
      font-weight: ${weightHeader ? `${weightHeader} !important` : "500 !important"};
      font-size: ${headFontSize ? `${headFontSize} !important` : "14px"};

    }
    .td {
      color: ${fontColor ? `${fontColor}` : "#212529"};
      font-weight: ${weightTable ? `${weightTable} !important` : "300"};
      font-size: ${tableFontSize ? `${tableFontSize} !important` : "12px"};
    }
    .fixedHeight {
      overflow: auto;
      height: 500px;
    }
    .unsetTable .td,
    .unsetTable td,
    .unsetTable tr,
    .unsetTable th {
      width: 100% !important;
    }
    .unsetTable .table {
      display: table;
    }
    .unsetTable {
      overflow: auto;
    }

    thead {
      border-bottom: ${headBorder ? "1px solid black" : ""};
      font-family: ${bodyStyle ? bodyStyle : "'Roboto'"};
    }
    .table > :not(caption) > * > * {
      border-color: ${stripe ? "transparent" : ""};
    }
    .wrapText td,
    .wrapText .td {
      word-break: break-all !important;
    }

    .td {
    border-right: ${verticalStripe ? "1px solid #dedede" : ""}
   }

    .measure-header {
      text-align: center;
      pointer-events: none;
      cursor: default;
    }

    .hide-dimension-header {
      visibility: hidden;
    }
    thead > tr > th {
      ${(props) => props.headerStyles}
      display: flex;
      padding-top: 0em!important;
      padding-bottom: 0em!important
    }
    thead {
      padding-top: 0em !important;
    }
    #vis > div > div > table > thead > tr > th:nth-child(1),
    #vis > div > div > table > thead > tr > th {
      ${(props) => props.headerStyles}
      display: flex;
    }
    .table > thead {
      ${(props) => props.headerStyles}
    }
    tbody > tr > td {
      ${(props) => props.rowStyles}
      vertical-align: middle;
    }
    thead th{
    background: ${config.headerColor ? config.headerColor : "#fff"}
    }

    tbody tr td, thead tr th {
      max-width: 400px;
    }

    table {
      width: auto !important;
    }

    ${(props) => props.columnBordersCSS}
    ${(props) => props.rowBordersCSS}
    ${(props) => props.generalCSS}
  `;

  return (
    <StyledWrapper
      config={config}
      headerStyles={headerStyles}
      rowStyles={rowStyles}
      generalCSS={generalCSS}
      columnBordersCSS={columnBordersCSS}
      rowBordersCSS={rowBordersCSS}
      hideTopHeaderRow={hideTopHeaderRow}
      hideDimensionHeader={hideDimensionHeader}
    >
      {children}
    </StyledWrapper>
  );
};


function Table({ columns, data, config }) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 50,
      maxWidth: 400,
      width: 50,
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state, resetResizing } =
    useTable(
      {
        columns,
        data,
        defaultColumn,
        disableSortRemove: true,
        defaultCanSort: true,
      },
      useSortBy,
      useFlexLayout,
      useResizeColumns
    );
        // Destructure and copy the headerGroups
        const [firstHeaderGroup, ...restHeaderGroups] = headerGroups;
        let newHeaderGroups = headerGroups;
        console.log(newHeaderGroups)
        // debugger
        // Check config to determine if the first header should be hidden
        if (config.hideTopHeaderRow) {
         newHeaderGroups = restHeaderGroups;
        } else {
          newHeaderGroups = headerGroups
        }

  for (let i = 0; i < newHeaderGroups.length; i++) {
  const newHeaderGroup = newHeaderGroups[i];
  for (let j = 0; j < newHeaderGroup.headers.length; j++) {
    for (let k = j; k < newHeaderGroup.headers.length; k++) {
      if (newHeaderGroup.headers[j].Header === newHeaderGroup.headers[k].Header) {
        if (!config[`resize_${j}`]) {
          config[`resize_${j}`] = config[`resize_${k}`];
        } else {
          config[`resize_${k}`] = config[`resize_${j}`];
        }
      }
    }
  }
}

  return (
    <>
       <div
         className={`
         ${config.fixedHeight ? "fixedHeight" : ""}
         ${config.unsetTable ? "unsetTable" : ""}
          ${config.wrapText ? "wrapText" : ""}
         `}
         style={{ fontFamily: config.bodyStyle ? config.bodyStyle : "'Roboto'" }}
       >
         <table
           {...getTableProps()}
           className={`table ${
             config.tableBordered
               ? "bordered"
               : config.unsetTable
               ? "unsetTable"
               : config.fixedHeight
               ? "fixedHeight"
               : ""
           }`}
         >
          <thead>
            {newHeaderGroups.map((headerGroup, headerGroupIndex) => {
              let count = 0
              return(
              <tr {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map((column, columnIndex) => {
                const content_th = {...column.getHeaderProps(
                  headerGroupIndex === 1 || headerGroup.length === 1
                    ? column.getSortByToggleProps()
                    : undefined,
                )}
                let width = 0
                if(column.headers !== undefined && content_th.colSpan) {
                  width = 0
                  for(let i = 0; i< content_th.colSpan; i ++) {
                    if(config[`resize_${count + i}`] !== undefined && config[`resize_${count + i}`] !== "") {
                      let resize = parseInt(config[`resize_${count + i}`])
                      if(resize < 50) width += 50
                      else if(resize <= 400) width += resize
                      else width += 400
                    }
                    else width += 50
                  }
                  width += 'px'
                  count += content_th.colSpan
                  content_th.style = {...content_th.style, width: width, maxWidth: width}
                }
                else {
                  width = config[`resize_${columnIndex}`] ? `${config[`resize_${columnIndex}`]}` : "50px"
                  content_th.style = {...content_th.style, width: width}
                }
                return(
                <th
                  {...content_th}
                  className={`th ${column.headerClassName || ''} ${headerGroupIndex === 0 && headerGroups.length === 2 && columnIndex === 0 ? 'top-header' : ''} ${config.hideDimensionHeader && columnIndex === 0 ? 'hide-dimension-header' : ''}`}
                  >



                  {column.render("Header")}
                  {(headerGroupIndex === 1 || headerGroup.length === 1) && (
                    <span>{column.isSorted ? "⇅" : " "}</span>
                  )}
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                  />
                </th>
                )
              })}
            </tr>
            )})}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="tr">
                  {row.cells.map((cell,i) => {

                    const cellProps = cell.getCellProps();
                    const customProps = cell.column?.getCellProps ? cell.column?.getCellProps(cell) : null;

                    if (customProps ) {
                      const mergedStyles = {
                        ...cellProps.style,
                        ...customProps.style,
                        width : config[`resize_${i}`] ? config[`resize_${i}`] : "50px"
                      };
                      cellProps.style = mergedStyles;
                      return (
                        <td {...cellProps}
                        className="td"
                        >
                          {cell.render("Cell")}
                        </td>
                      );
                    } else {
                      cellProps.style = {...cellProps.style, width : config[`resize_${i}`] ? config[`resize_${i}`] : "50px" }
                      return (
                        <td {...cellProps}
                        className="td"
                        >
                          {cell.render("Cell")}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

const keyHeaderMapFunction = (key, config, measureKeys) => {
  const configKey = `rename_${key}`;
  const headerName = config[configKey] || key;


  return {
    Header: headerName,
    accessor: (d) => d[key]?.value,
    sortable: true,
    sortType: "basic",
    getCellProps: (cellInfo) => {
      const row = cellInfo.row.original;
      let style = {};
      measureKeys.forEach((measureKey) => {
        const conditionalKey = `conditional_styles_${measureKey}`;
        const isThisMeasureConditional = config[conditionalKey] === key;
        if (isThisMeasureConditional) {
          const conditionalValue = row[measureKey]?.value;
          if (['Yes', 'true', '1'].includes(conditionalValue)) {
            const conditionalHighlightStyle = parseCSSString(config.conditionalHighlightStyle);
            style = { ...style, ...conditionalHighlightStyle };
          }
        }
      });
      return { style };
    },
    Cell: ({ cell }) => {
      const row = cell.row.original;
      return row[key]?.html ? (
            <span dangerouslySetInnerHTML={{ __html: row[key].html }} />
          ) : (
            row[key]?.rendered || row[key]?.value
          )
    },
  };
}

// Function to parse CSS string into an object
const parseCSSString = (cssString) => {
  return cssString.split(';').reduce((acc, style) => {
    if (style.trim()) {
      const [key, value] = style.split(':');
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});
};

export const CustomTable = ({ data, config, queryResponse, details, done }) => {

  const [firstData = {}] = data;
  const dimensionKeys = queryResponse.fields.dimension_like ? queryResponse.fields.dimension_like.map((dim) => dim.name) : [];
  const measureKeys = queryResponse.fields.measure_like ? queryResponse.fields.measure_like.map((measure) => measure.name) : [];
  const pivotKeys = queryResponse.pivots ? queryResponse.pivots.map((pivot) => pivot.key) : [];
  const validFieldKeys = [...dimensionKeys, ...measureKeys]
    // Filter out the keys that have are conditional configuration indicator booleans
    .filter((key) => {
      const conditionalKey = `conditional_styles_${key}`;
      const isAConditionalKey = config[conditionalKey] && config[conditionalKey] != 'none' && config[conditionalKey] != ''
      return !isAConditionalKey;
    })

  const columns = useMemo(
    () => {
      if (pivotKeys.length > 0) {
        const dimensionHeaders = dimensionKeys.map((key) => {
          return keyHeaderMapFunction(key, config, measureKeys)
        })
        if (config.groupByMeasure) {
          const pivotColumnHeaders = measureKeys.filter((measureKey) => {
            const conditionalKey = `conditional_styles_${measureKey}`;
            const conditionalColumn = config[conditionalKey];
            const hasConditionalStyle = conditionalColumn && conditionalColumn !== 'none';
            return !hasConditionalStyle;
          }).map((measureKey) => {
            const measure = queryResponse.fields.measure_like.find(
              (measure) => measure.name === measureKey
            );

            const measureLabel = config[`rename_${measureKey}`] || measure.label;
            const subColumns = pivotKeys.map((pivotKey) => {
              const isTotal = pivotKey === "$$$_row_total_$$$";
              const pivotValue = pivotKeys.length > 1 ? pivotKey : "";
              const accessor = (d) => d[measureKey]?.[pivotValue]?.value;
              const pivotName = config[`rename_${pivotKey}`] || pivotKey;
              const header = isTotal ? 'Total' : `${pivotName}`;
              const id = `${measureKey}_${pivotKey}`; // Ensure unique ID

              return {
                Header: header,
                accessor,
                id,
                sortable: true,
                sortType: "basic",
                getCellProps: (cellInfo) => {
                  const row = cellInfo.row.original;
                  const cellValue = row[measureKey]?.[pivotValue]?.rendered ?? row[measureKey]?.[pivotValue]?.value;
                  let style = {};
                  measureKeys.forEach((otherMeasureKey) => {
                    if (otherMeasureKey === measureKey) return;
                    const conditionalKey = `conditional_styles_${otherMeasureKey}`;
                    const isThisMeasureConditional = config[conditionalKey] === measureKey;
                    if (isThisMeasureConditional) {
                      const conditionalValue = row[otherMeasureKey]?.[pivotValue]?.value;
                      if (['Yes', 'true', '1'].includes(conditionalValue)) {
                        const conditionalHighlightStyle = parseCSSString(config.conditionalHighlightStyle);
                        style = { ...style, ...conditionalHighlightStyle };
                      }
                    }
                  });
                  // return null if no style
                  if (Object.keys(style).length === 0) return null;
                  return { style };
                },
                Cell: ({ cell }) => {
                  const row = cell.row.original;
                  return row[measureKey]?.[pivotValue]?.html ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: row[measureKey][pivotValue].html,
                      }}
                    />
                  ) : (row[measureKey]?.[pivotValue]?.rendered ?? row[measureKey]?.[pivotValue]?.value);
                },
              };
            });

            return {
              Header: measureLabel,
              columns: subColumns,
              sortable: false,
              headerClassName: "measure-header",
              className: "measure-header",
            };
          });

          return [...dimensionHeaders, ...pivotColumnHeaders];
        } else {
          const pivotColumnHeaders = pivotKeys.map((pivotKey) => {
            return measureKeys.filter((measureKey) => {
              const conditionalKey = `conditional_styles_${measureKey}`;
              const conditionalColumn = config[conditionalKey];
              const hasConditionalStyle = conditionalColumn && conditionalColumn !== 'none';
              return !hasConditionalStyle;
            }).map((measureKey) => {
              const measure = queryResponse.fields.measure_like.find(
                (measure) => measure.name === measureKey
              );
              const measureLabel = config[`rename_${measureKey}`] || measure.label;
              const pivotValue = pivotKeys.length > 1 ? pivotKey : "";
              const pivotName = config[`rename_${pivotKey}`] || pivotKey;

              const accessor = (d) => d[measureKey]?.[pivotValue]?.value;
              const header = `${measureLabel} (${pivotName})`;
              const id = `${measureKey}_${pivotKey}`; // Ensure unique ID

              return {
                Header: header,
                accessor,
                id,
                sortable: true,
                sortType: "basic",
                getCellProps: (cellInfo) => {
                  const row = cellInfo.row.original;
                  const cellValue = row[measureKey]?.[pivotValue]?.rendered ?? row[measureKey]?.[pivotValue]?.value;
                  let style = {};
                  measureKeys.forEach((otherMeasureKey) => {
                    if (otherMeasureKey === measureKey) return;
                    const conditionalKey = `conditional_styles_${otherMeasureKey}`;
                    const isThisMeasureConditional = config[conditionalKey] === measureKey;
                    if (isThisMeasureConditional) {
                      const conditionalValue = row[otherMeasureKey]?.[pivotValue]?.value;
                      if (['Yes', 'true', '1'].includes(conditionalValue)) {
                        const conditionalHighlightStyle = parseCSSString(config.conditionalHighlightStyle);
                        style = { ...style, ...conditionalHighlightStyle };
                      }
                    }
                  });
                  return { style };
                },
                Cell: ({ cell }) => {
                  const row = cell.row.original;
                  return row[measureKey]?.[pivotValue]?.html ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: row[measureKey][pivotValue].html,
                      }}
                    />
                  ) : (row[measureKey]?.[pivotValue]?.rendered ?? row[measureKey]?.[pivotValue]?.value);
                },
              };
            });
          });
          return [...dimensionHeaders, ...pivotColumnHeaders.flat()];
        }
      } else {
        return validFieldKeys.map((key) => {
          return keyHeaderMapFunction(key, config, measureKeys)
        })
      }
    },
    [firstData, config]
  );

  return (
    <Styles config={config} rowCount={data.length}>

      <Table
        config={config}
        columns={columns}
        data={data}

      />


    </Styles>
  );

}
