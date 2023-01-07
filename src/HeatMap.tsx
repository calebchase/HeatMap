import React from 'react';
import './App.css';
import heatMapData from './ElasticData'
import {heatMapConstructor, d3Dimensions} from './types';
import * as d3 from "d3";

let heatMapParams: heatMapConstructor = {
    calendarInterval: 'month',
    startDate: new Date(new Date(2020, 5, 15, 15, 29, 20)),
    endDate: new Date(2022, 5, 15, 15, 29, 20),
    autoFetchData: true
}

function initSVG(svgRef: React.MutableRefObject<null> , heatMapDim: d3Dimensions) {
    // Prevents cases of duplication 
    d3.select(svgRef.current).selectAll("*").remove();

    return d3
            .select(svgRef.current)
            .attr("width", heatMapDim.width + heatMapDim.margin.left + heatMapDim.margin.right)
            .attr("height", heatMapDim.height + heatMapDim.margin.top + heatMapDim.margin.bottom)
            .append('g')
            .attr("transfrom", `translate(${heatMapDim.margin.right},${heatMapDim.margin.left})`);
}

function createHeatMapDim(): d3Dimensions {
    const heatMapDim: d3Dimensions = {
        margin: {top: 120, right: 30, bottom: 30, left: 120},
        width: 0,
        height: 0,
    }

    heatMapDim.width = 1400 - heatMapDim.margin.left - heatMapDim.margin.right;
    heatMapDim.height = 650 - heatMapDim.margin.top - heatMapDim.margin.bottom;

    return heatMapDim;
}

let heatMap = new heatMapData(heatMapParams);
heatMap.fetchData();
console.log(heatMap.getTimeDomain())

function CreateHeatMap() {
    const svgRef: React.MutableRefObject<null> = React.useRef(null);
    const heatMapDim: d3Dimensions = createHeatMapDim();
    
    React.useEffect(() => {
        const svg = initSVG(svgRef, heatMapDim);

        const container = svg
            .append("circle").attr("r", 25);
    }) 
    
    return <svg ref={svgRef}/>;;
}

function HeatMap() {
    return (
        CreateHeatMap()
    );
}

export default HeatMap;
