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


import spec from "../charts/barchart.json";
// const spec = {
//     "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//     "data": { "name": "table" },
//     "mark": "bar",
//     "encoding": {
//         "x": {
//             "timeUnit": "month",
//             "field": "date",
//             "type": "ordinal",
//             "title": "Month of the year"
//         },
//         "y": { "aggregate": "count", "type": "quantitative" },
//         "color": {
//             "field": "weather",
//             "type": "nominal",
//             "scale": {
//                 "domain": ["sun", "fog", "drizzle", "rain", "snow"],
//                 "range": ["#e7ba52", "#c7c7c7", "#aec7e8", "#1f77b4", "#9467bd"]
//             },
//             "title": "Weather type"
//         }
//     },
//     "config": {}
// }
spec.width = 600;
spec.height = 400;

function BasicBar(props) {
  // const [chartData, setChartData] = useState({});
  const [tableData, setTableData] = useState([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weather = ["sun", "fog", "drizzle", "rain", "snow"];
  async function loadData() {
    // const chartData = await vegaDatasets['weather.csv']();

    // // processing data to the view data format
    // chartData.forEach(d => {// get months
    //     d.month = months[d.date.getMonth()].slice(0, 3);
    // });
    // const grouped = d3.flatRollup(chartData, v => v.length, d => d.weather, d => d.month);
    // const tableData = grouped.map(([weather, month, count]) => ({ weather, month, count }));

    // setChartData({ table: chartData });
    // setTableData(tableData);

    // console.log('chartData', chartData);
    // console.log('tableData', tableData);

    // console.log('spec', spec);

    // const dataflow = parse(compile(spec).spec);
    // const view =
    // console.log('spec', compile(spec).spec);
    // // console.log('view', View(dataflow));
    // const runtime = parse(compile(spec).spec);
    // const view = new View(runtime);
    // await view.runAsync();
    // console.log('data_1', view.data("source_0"))
    // const tableData = view.data("source_0").map(d=>({
    //     month: months[d.month_date.getMonth()],
    //     weather: d.weather,
    //     count: d.__count
    // }));
    // window.view = new vega.View(runtime)
    const tableData = spec.data.values;
    console.log("before", tableData);
    tableData.sort((a, b) => {
      console.log(
        a.month,
        b.month,
        months.indexOf(a.month),
        months.indexOf(b.month)
      );
      if (months.indexOf(a.month) > months.indexOf(b.month)) {
        return 1;
      }
      if (months.indexOf(a.month) < months.indexOf(b.month)) {
        return -1;
      }
      if (weather.indexOf(a.weather) > weather.indexOf(b.weather)) {
        return 1;
      }
      if (weather.indexOf(a.weather) < weather.indexOf(b.weather)) {
        return -1;
      }
      return 0;
    });
    console.log("after", tableData);

    setTableData(tableData);
  }

  useEffect(() => {
    // load dataset
    loadData();
  }, []);
  const comparators = {
    month: {
      asc: function (a, b) {
        if (months.indexOf(a) > months.indexOf(b)) {
          return 1;
        }
        if (months.indexOf(a) < months.indexOf(b)) {
          return -1;
        }
        return 0;
      },
      desc: function (a, b) {
        if (months.indexOf(a) > months.indexOf(b)) {
          return -1;
        }
        if (months.indexOf(a) < months.indexOf(b)) {
          return 1;
        }
        return 0;
      },
    },
    weather: {
      asc: d3.ascending,
      desc: d3.descending,
    },
    count: {
      asc: d3.ascending,
      desc: d3.descending,
    },
  };
  const headCells = [
    {
      id: "month",
      numeric: false,
      disablePadding: false,
      label: "Month of the Year",
    },
    {
      id: "weather",
      numeric: false,
      disablePadding: false,
      label: "Weather Type",
    },
    {
      id: "count",
      numeric: true,
      disablePadding: false,
      label: "Count of Days",
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
                  <TableCell>{d.month}</TableCell>
                  <TableCell>{d.weather}</TableCell>
                  <TableCell align="right">{d.count}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BasicBar;
