import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { VegaLite } from "react-vega";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";

import spec from "../charts/linechart.json";
// const spec = {
//     "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//     "description": "Stock prices of 5 Tech Companies over Time.",
//     "data": { "name": "table" },
//     "mark": { "type": "line", "point": { "filled": false, "fill": "white" } },
//     "encoding": {
//         "x": { "timeUnit": "year", "field": "date" },
//         "y": { "aggregate": "mean", "field": "price", "type": "quantitative" },
//         "color": { "field": "symbol", "type": "nominal" }
//     },
//     "config": {}
// };
spec.width = 600;
spec.height = 400;

const formatter = d3.format("$,");
// const formatter = d3.format(".2f");

function BasicLine(props) {
  // const [chartData, setChartData] = useState({});
  const [tableData, setTableData] = useState([]);

  // const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  async function loadData() {
    // const chartData = await vegaDatasets['stocks.csv']();

    // // processing data to the view data format
    // chartData.forEach(d => {// get months
    //     d.year = new Date(d.date).getFullYear();
    // });
    // function mean(data) {
    //     return parseFloat((data.reduce((p, c) => p + c.price, 0) / data.length).toFixed(2));
    // }
    // const grouped = d3.flatRollup(chartData, mean, d => d.symbol, d => d.year);
    // console.log("grouped", grouped);

    // const tableData = spec.data.values; //grouped.map(([symbol, year, mean]) => ({ symbol, year, mean }));
    // tableData.forEach(d => {// get months
    //     d.year = new Date(d.date).getFullYear();
    // });

    // const dataflow = parse(compile(spec).spec);
    // const view =
    // console.log('spec', compile(spec).spec);
    // // console.log('view', View(dataflow));
    // const runtime = parse(compile(spec).spec);
    // const view = new View(runtime);
    // await view.runAsync();
    // console.log('data_1', view.data("data_1"))
    // const tableData = view.data("data_1").map(d=>({
    //     symbol:d.symbol,
    //     year: new Date(d.year_date).getFullYear(),
    //     mean: d.mean_price.toFixed(2)
    // }));
    // window.view = new vega.View(runtime)
    // setChartData({ table: chartData });
    const tableData = spec.data.values;
    setTableData(tableData);

    // console.log('chartData', chartData);
    // console.log('vegaParser', parse);
    console.log("tableData", tableData);
  }

  useEffect(() => {
    // load dataset
    loadData();
  }, []);

  // Custom D3-based
  // useEffect(() => {
  //     if (data.length > 0) {
  //         // draw chart
  //         const svg = StackedBarChart(data, {
  //             x: d => d.month,
  //             y: d => d.count,
  //             z: d => d.weather,
  //             xDomain: months,
  //         })
  //         console.log("svg", svg);
  //         console.log("ele", chartEl.current);
  //         d3.select(chartEl.current).select("svg").remove();
  //         d3.select(chartEl.current).append(()=>svg);
  //     }
  // }, [data])
  const comparators = {
    Company: {
      asc: d3.ascending,
      desc: d3.descending,
    },
    Year: {
      asc: d3.ascending,
      desc: d3.descending,
    },
    Price: {
      asc: d3.ascending,
      desc: d3.descending,
    },
  };
  const headCells = [
    {
      id: "Company",
      numeric: false,
      disablePadding: false,
      label: "Company",
    },
    {
      id: "Year",
      numeric: false,
      disablePadding: false,
      label: "Year",
    },
    {
      id: "Price",
      numeric: true,
      disablePadding: false,
      label: "Stock Price",
    },
  ];
  const [order, setOrder] = useState("");
  const [orderBy, setOrderBy] = useState("");

  const handleSort = (property) => (event) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    if (props.onLog){
      props.onLog("sort",{property,order:isAsc ? "desc" : "asc" }, new Date().toISOString() );
    }
    setTableData((prevTableData) => {
      const order = isAsc ? "desc" : "asc";
      const comparator = comparators[property][order];
      console.log("comparator", comparator);
      const newTableData = prevTableData.slice().sort((a, b) => {
        return comparator(a[property], b[property]);
      });

      return newTableData;
    });
  };
  return (
    <Box mt={5}>
      {/* <div className="chart" ref={chartEl}></div>
       */}
      <VegaLite spec={spec} actions={false} />
      <TableContainer sx={{ marginTop: 5 }}>
        <Table aria-label="Data">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? "right" : "left"}
                  padding={headCell.disablePadding ? "none" : "normal"}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={handleSort(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData &&
              tableData.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{d.Company}</TableCell>
                  <TableCell>{d.Year}</TableCell>
                  <TableCell align="right">{formatter(d.Price)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BasicLine;
