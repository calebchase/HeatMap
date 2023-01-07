import React from 'react';
import './App.css';
import heatMapData from './ElasticData'
import {heatMapConstructor, shiftOpperation, calendarIntervalType} from './types';
import * as d3 from "d3";

let heatMapParams: heatMapConstructor = {
    calendarInterval: 'day',
    startDate: new Date(new Date(2017, 5, 15, 15, 29, 20)),
    endDate: new Date(2022, 5, 15, 15, 29, 20),
    autoFetchData:true
}

let heatMap = new heatMapData(heatMapParams);
heatMap.fetchData();
console.log(heatMap.startDate)

function CreateHeatMap() {
    const svgRef = React.useRef(null);
    let dimensions = {
        width: 1000,
        height: 500,
        margins: 50,
        containerWidth: -1,
        containerHeight: -1
    };

    dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
    dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

    React.useEffect(() => {
        const svg = d3
            .select(svgRef.current)
            .classed("line-chart", true)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

        const container = svg
            .append("g")
            .classed("container", true)
            .attr("transform", `translate(${dimensions.margins}, ${dimensions.margins})`);

        container.append("circle").attr("r", 25);
    }) 
    
    return <svg ref={svgRef}/>;;
}

function HeatMap() {
  return (
    CreateHeatMap()
  );
}

export default HeatMap;
