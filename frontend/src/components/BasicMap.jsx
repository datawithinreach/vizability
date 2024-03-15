import React, { useState, useEffect, useRef } from "react";
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


import spec from "../charts/map.json";

spec.width = 600;
spec.height = 400;

const formatter = (d) => d3.format(".2%")(d / 100);
function BasicMap(props) {
  // const [chartSpec, setChartSpec] = useState(spec);
  // const [chartData, setChartData] = useState({});
  const [tableData, setTableData] = useState([]);

  // const months = [
  //     "January",
  //     "February",
  //     "March",
  //     "April",
  //     "May",
  //     "June",
  //     "July",
  //     "August",
  //     "September",
  //     "October",
  //     "November",
  //     "December",
  // ];
  async function loadData() {
    // const usmap = await (await fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")).json();//vegaDatasets['us-10m.json']();
    // const usmap = await vegaDatasets["us-10m.json"]();
    // const unemployment = d3.tsvParse(await vegaDatasets["unemployment.tsv"]());

    const baseURL = process.env.PUBLIC_URL;
    // const counties = await d3.csv(baseURL+"/datasets/us-county-names.csv");

    // console.log('counties', baseURL+"/datasets/us-county-names.csv")
    // const mapping = counties.reduce((acc, d) => {
    //     acc[parseInt(d.fips)] = d;
    //     return acc;
    // }, {});
    console.log("spec", spec);
    const tableData = spec.data.values;
    // const tableData = unemployment
    //     .filter((d) => mapping[parseInt(d.id)])
    //     .map((d) => {
    //         return {
    //             id: d.id,
    //             county: mapping[d.id].name,
    //             state: mapping[d.id].state,
    //             rate: d.rate,
    //         };
    //     });
    // const chartData = { usmap, unemployment: tableData };
    // processing data to the view data format
    // chartData.forEach(d => {// get months
    //     d.month = months[d.date.getMonth()].slice(0,3);
    // });
    // const grouped = d3.flatRollup(chartData, v=>v.length, d=>d.weather, d=>d.month );
    // const tableData = grouped.map(([weather, month, count])=>({weather,month, count}));

    // setChartData(chartData);
    setTableData(tableData);
    tableData.sort((a, b) =>
      d3.descending(a.vaccination_rate, b.vaccination_rate)
    );
    // console.log('table', table);
    // console.log("chartData", chartData);
    console.log("tableData", tableData);

    // const newSpec = {
    //     ...spec,
    //     datasets: chartData,
    // };
    // console.log("spec", newSpec);
    // vegaEmbed(chartEl.current, newSpec, { renderer: "svg" });
    // console.log('parsed spec', parse(
  }

  useEffect(() => {
    // load dataset
    loadData();
  }, []);
  const comparators = {
    state: {
      asc: d3.ascending,
      desc: d3.descending,
    },
    vaccination_rate: {
      asc: d3.ascending,
      desc: d3.descending,
    },
  };
  const headCells = [
    {
      id: "state",
      numeric: false,
      disablePadding: false,
      label: "State",
    },
    {
      id: "vaccination_rate",
      numeric: true,
      disablePadding: false,
      label: "Vaccination Rate",
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
      {/* <div className="chart" ref={chartEl}></div> */}

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
                  <TableCell>{d.state}</TableCell>
                  <TableCell align="right">
                    {formatter(d.vaccination_rate)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BasicMap;
