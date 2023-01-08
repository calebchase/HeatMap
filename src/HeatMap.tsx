import React from 'react';
import './App.css';
import heatMapData from './ElasticData'
import {heatMapConstructor, d3Dimensions} from './types';
import {toDate} from 'date-fns' ;
import * as d3 from "d3";

let heatMapParams: heatMapConstructor = {
    calendarInterval: 'month',
    startDate: new Date(new Date(2020, 5, 0, 0, 0, 0)),
    endDate: new Date(2022, 5, 0, 0, 0, 0),
    autoFetchData: true
}

function initSVG(svgRef: React.MutableRefObject<null> , heatMapDim: d3Dimensions) {
    // Prevents cases of duplication 
    // d3.select(svgRef.current).selectAll("*").remove();

    return d3
            .select(svgRef.current)
            .attr("width", heatMapDim.width + heatMapDim.margin.left + heatMapDim.margin.right)
            .attr("height", heatMapDim.height + heatMapDim.margin.top + heatMapDim.margin.bottom)
            .append('g')
            .attr("transform", `translate(${heatMapDim.margin.left},${heatMapDim.margin.top})`);
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

function createX(svg: any, heatMap: heatMapData, heatMapDim: d3Dimensions): d3.ScaleBand<string> {
    const x: d3.ScaleBand<string> = d3.scaleBand().range([0, heatMapDim.width]).domain(heatMap.getTimeDomain());
    svg
        .append("g")
        .attr("transform", `translate(0, ${heatMapDim.height})`)
        .call(d3.axisBottom(x));

    return x;
}

function createY(svg: any, heatMap: heatMapData, heatMapDim: d3Dimensions): d3.ScaleBand<string> {
    const y: d3.ScaleBand<string> = d3.scaleBand().range([heatMapDim.height, 0]).domain(heatMap.getRange());
    svg.append("g").call(d3.axisLeft(y));

    return y;
}

function drawHeatMap(svg:any, heatMap: heatMapData, heatMapDim: d3Dimensions, d3x: d3.ScaleBand<string>, d3y: d3.ScaleBand<string>) {

    let color = d3.scaleLinear<string>().range(["white", "green"]).domain([1, 10000]);

    for (const ele of heatMap.elasticData) {
        for (const bucket of ele.dateHistogram.buckets) {
            let xKey: string = heatMap.dateToKey(toDate(bucket.key));
            let yKey: string = ele.key.target;

            svg
                .append("rect")
                .attr("x", () => d3x(xKey))
                .attr("y", () => d3y(yKey))
                .attr("width", d3x.bandwidth())
                .attr("height", d3y.bandwidth())
                .style("fill", () => color(bucket.doc_count));
        }
    }
}

function CreateHeatMap() {
    const heatMap: heatMapData = new heatMapData(heatMapParams);
    const svgRef: React.MutableRefObject<null> = React.useRef(null);
    const heatMapDim: d3Dimensions = createHeatMapDim();
    const svg = initSVG(svgRef, heatMapDim);

    const [num, setCount] = React.useState(0);

    React.useEffect(() => {
        heatMap.fetchData().then(() => {
            console.log(heatMap.elasticData);

            const d3x: d3.ScaleBand<string> = createX(svg, heatMap, heatMapDim);
            const d3y: d3.ScaleBand<string> = createY(svg, heatMap, heatMapDim);
            drawHeatMap(svg, heatMap, heatMapDim, d3x, d3y);
            
            setCount(1);
        });
        // svg.append("circle").attr("r", 25);
    }); 
    
    return <svg ref={svgRef}/>;;
}

function HeatMap() {
    return (
        CreateHeatMap()
    );
}

export default HeatMap;
