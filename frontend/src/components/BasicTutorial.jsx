import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
// import vegaDatasets from "vega-datasets"; // no types
import { VegaLite } from "react-vega";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// import { Typography } from "@mui/material";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
// import spec from 'charts/stacked-barchart.json';
import spec from "../charts/tutorial.json";

const formatter = d3.format(",");

function BasicTutorial(props) {
  const [tableData, setTableData] = useState([]);


  async function loadData() {
    const tableData = spec.data.values; 
    setTableData(tableData);
    console.log("spec", spec);
  }

  useEffect(() => {
    // load dataset
    loadData();
  }, []);
  const comparators = {
    country: {
      asc: d3.ascending,
      desc: d3.descending,
    },
    continent: {
      asc: d3.ascending,
      desc: d3.descending,
    },
    cases: {
      asc: d3.ascending,
      desc: d3.descending,
    },
  };
  const headCells = [
    {
      id: "country",
      numeric: false,
      disablePadding: false,
      label: "Country",
    },
    {
      id: "continent",
      numeric: false,
      disablePadding: false,
      label: "Continent",
    },
    {
      id: "cases",
      numeric: true,
      disablePadding: false,
      label: "Total Cases",
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
      // console.log("comparator", comparator);
      const newTableData = prevTableData.slice().sort((a, b) => {
        return comparator(a[property], b[property]);
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
                  <TableCell>{d.continent}</TableCell>
                  <TableCell align="right">{formatter(d.cases)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BasicTutorial;
