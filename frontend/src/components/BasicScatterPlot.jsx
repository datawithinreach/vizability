import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
// import vegaDatasets from 'vega-datasets'; // no types
import { VegaLite } from "react-vega";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";

import spec from "../charts/scatterplot.json";

spec.width = 600;
spec.height = 400;
const formatter = d3.format("$,");
function BasicScatterPlot(props) {
  // const [chartData, setChartData] = useState({});
  const [tableData, setTableData] = useState([]);

  const regions = ["America", "Asia", "Europe", "Middle East"];
  async function loadData() {
    // const chartData = await vegaDatasets['weather.csv']();

    // processing data to the view data format
    // chartData.forEach(d => {// get months
    //     d.month = months[d.date.getMonth()].slice(0, 3);
    // });
    // const grouped = d3.flatRollup(chartData, v => v.length, d => d.weather, d => d.month);
    const tableData = spec.data.values; //grouped.map(([weather, month, count]) => ({ weather, month, count }));
    tableData.sort((a, b) => {
      // console.log(a.month, b.month, months.indexOf(a.month), months.indexOf(b.month))
      if (regions.indexOf(a.region) > regions.indexOf(b.region)) {
        return 1;
      }
      if (regions.indexOf(a.region) < regions.indexOf(b.region)) {
        return -1;
      }
      if (a.income > b.income) {
        //descending by income
        return -1;
      }
      if (a.income < b.income) {
        return 1;
      }
      return 0;
    });
    // setChartData({ table: chartData });
    setTableData(tableData);

    // console.log('chartData', chartData);
    console.log("tableData", tableData);

    console.log("spec", spec);
  }

  useEffect(() => {
    // load dataset
    loadData();
  }, []);

  const headCells = [
    {
      id: "country",
      numeric: false,
      disablePadding: true,
      label: "Country",
    },
    {
      id: "region",
      numeric: false,
      disablePadding: false,
      label: "Region",
    },
    {
      id: "income",
      numeric: true,
      disablePadding: false,
      label: "Income",
    },
    {
      id: "life_expectancy",
      numeric: true,
      disablePadding: false,
      label: "Life Expectancy",
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
      const newTableData = prevTableData.slice().sort((a, b) => {
        return isAsc
          ? d3.descending(a[property], b[property])
          : d3.ascending(a[property], b[property]);
      });
     
      return newTableData;
    });
  };
  return (
    <Box mt={5}>
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
                  <TableCell>{d.country}</TableCell>
                  <TableCell>{d.region}</TableCell>
                  <TableCell align="right">{formatter(d.income)}</TableCell>
                  <TableCell align="right">{d.life_expectancy} years</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BasicScatterPlot;
