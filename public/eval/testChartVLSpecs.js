export const testVLSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "A simple bar chart with embedded data.",
    "data": {
        "values": [
            { "a": "A", "b": 28 }, { "a": "B", "b": 55 }, { "a": "C", "b": 43 },
            { "a": "D", "b": 91 }, { "a": "E", "b": 81 }, { "a": "F", "b": 53 },
            { "a": "G", "b": 19 }, { "a": "H", "b": 87 }, { "a": "I", "b": 52 }
        ]
    },
    "mark": "bar",
    "encoding": {
        "x": { "field": "a", "type": "nominal", "axis": { "labelAngle": 0 } },
        "y": { "field": "b", "type": "quantitative" }
    }
};

export const lineChartVLSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "A line chart that plots the aggregate number of homes for sale in the United States for the given years 2014-2021",
    "title": "The number of homes for sale nationally has plummeted",
    "width": 500,
    "data": {
        "url": "https://raw.githubusercontent.com/Joszek0723/excess_data/main/line_chart_data.csv"
    },
    "mark": "line",
    "encoding": {
        "x": { "title": "Date", "field": "date", "type": "temporal" },
        "y": { "title": "Number of Homes for Sale", "field": "inventory", "type": "quantitative", "axis": { "tickCount": 6 } }
    }
};

export const barChartVLSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 500,
    "title": "Global Land and Ocean January-December Temperature Anomalies",
    "data": {
        "url": "https://raw.githubusercontent.com/Joszek0723/excess_data/main/bar_chart_data.csv"
    },
    "mark": "bar",
    "config": { "scale": { "barBandPaddingInner": 0.3 } },
    "encoding": {
        "x": {
            "field": "Year",
            "type": "ordinal",
            "axis": { "labelExpr": "datum.value % 10 === 0 ? datum.value : ''" }
        },
        "y": {
            "title": "Temperature Anomaly",
            "field": "Value",
            "type": "quantitative",
            "axis": {
                "values": [-0.6, -0.2, 0.2, 0.6, 1, 1.4],
                "format": ".2f",
                "labelExpr": "datum.value + ' °C'"
            },
            "scale": { "domain": [-0.6, 1.4] }
        },
        "color": {
            "field": "Value",
            "type": "ordinal",
            "scale": null,
            "condition": [
                { "test": "datum.Value < 0", "value": "#226291" },
                { "test": "datum.Value >= 0", "value": "#E3242B" }
            ]
        }
    }
};

export const scatterPlotVLSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "A scatterplot showing life expectancy at birth and GDP per capita for countries around the world over a span of 68 years from 1950 to 2018",
    "width": 1000,
    "height": 500,
    "data": { "url": "https://raw.githubusercontent.com/Joszek0723/excess_data/main/scatter_plot_data.json" },
    "params": [{
        "name": "AnnualPeriod",
        "value": 1950,
        "bind": { "input": "range", "min": 1950, "max": 2018, "step": 1 }
    }],
    "transform": [
        { "filter": "datum.Year === AnnualPeriod" }
    ],
    "mark": { "type": "circle", "filled": true, "tooltip": true },
    "encoding": {
        "x": { "field": "GDP per capita", "type": "quantitative", "scale": { "type": "log" } },
        "y": { "field": "Life expectancy at birth (historical)", "type": "quantitative", "scale": { "zero": false } },
        "size": {
            "field": "Population (historical estimates)",
            "type": "quantitative",
            "scale": {
                "type": "sqrt"
            }
        },
        "fill": {
            "field": "Continent",
            "type": "nominal",
            "scale": {
                "range": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2"]
            }
        },
        "color": {
            "field": "Continent",
            "type": "nominal",
            "scale": {
                "range": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2"]
            }
        },
        "tooltip": [
            { "field": "Entity", "title": "Country" },
            {
                "field": "Life expectancy at birth (historical)",
                "type": "quantitative",
                "title": "Life Expectancy (years)"
            },
            {
                "field": "GDP per capita",
                "type": "quantitative",
                "title": "GDP per Capita (USD)",
                "format": "$,.2f"
            }
        ]
    }
};

export const mapVLSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 700,
    "height": 500,
    "title": {
        "text": "Share of Population Receiving at Least One Dose",
        "fontSize": 20
    },
    "data": {
        "url": "https://raw.githubusercontent.com/Cian2001/irs_datasets/main/world_map.json",
        "format": { "property": "features" }
    },
    "projection": { "type": "mercator" },
    "transform": [
        {
            "calculate": "datum.properties.name === 'United States of America' ? 'United States' : datum.properties.name",
            "as": "lookup_name"
        },
        {
            "calculate": "datum.lookup_name === 'Dem. Rep. Congo' ? 'Democratic Republic of Congo' : datum.lookup_name",
            "as": "lookup_name"
        },
        {
            "calculate": "datum.lookup_name === 'Central African Rep.' ? 'Central African Republic' : datum.lookup_name",
            "as": "lookup_name"
        },
        {
            "lookup": "lookup_name",
            "from": {
                "key": "location",
                "fields": ["people_fully_vaccinated_pct_of_pop_display"],
                "data": {
                    "url": "https://static01.nytimes.com/newsgraphics/2021-01-19-world-vaccinations-tracker/ee760ac1a3dac05529f965f514aa9704eea80e79/_assets/latest.json",
                    "format": { "type": "json", "parse": { "people_fully_vaccinated_pct_of_pop_display": "string" } }
                }
            }
        },
        {
            "calculate": "datum.people_fully_vaccinated_pct_of_pop_display ? toNumber(replace(datum.people_fully_vaccinated_pct_of_pop_display, /%\\*?$|\\*%$/, '')) : null",
            "as": "people_fully_vaccinated_pct_of_pop_display"
        }
    ],
    "mark": {
        "type": "geoshape",

        "stroke": "#141010",
        "strokeWidth": 0.5
    },
    "encoding": {
        "color": {
            "title": "% of Population",
            "field": "people_fully_vaccinated_pct_of_pop_display",
            "type": "quantitative",
            "scale": { "scheme": "redyellowgreen" }
        },
        "tooltip": [
            { "field": "properties.name", "title": "Country" },
            {
                "field": "people_fully_vaccinated_pct_of_pop_display",
                "type": "quantitative",
                "title": "% of Population Vaccinated"
            }
        ]
    },
    "config": { "mark": { "invalid": null } }
};
