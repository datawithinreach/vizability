import React, {useEffect, useState} from "react";
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import "../styles/GraphTable.css"

const GraphTable = ({transformedData}) => { 
    const [headers, setHeaders] = useState([])

    useEffect(()=> {
        if (transformedData.length) {
            setHeaders(Object.keys(transformedData[0]))
        }
    }, [transformedData])

    return (
        <Container className="table-container">
            <Table responsive striped bordered hover size="md">
                <thead>
                    <tr>
                        {headers.map((header, i) => {
                            return <th key = {"header-" +i}>{header}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {transformedData.map((row, i) => {
                        return <tr key= {"row-" + i}>
                            {headers.map((header, i)=> {
                                if (typeof row[header] === 'string' || typeof row[header] === 'number') {
                                    return <td key={ "row-header" + i}>{row[header]}</td>
                                } else {
                                    return <td key={ "row-header" + i}>non-string</td>
                                }

                            })}
                        </tr>
                    })}
                </tbody>
            </Table>
        </Container>
    );
}

export default GraphTable;