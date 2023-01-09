import React from 'react';
import './App.css';
import heatMapData from './ElasticData'
import {heatMapConstructor, d3Dimensions} from './types';
import {toDate} from 'date-fns' ;
import * as d3 from "d3";
import initUserNav from './userNav';

function initSVG(svgRef: React.MutableRefObject<null> , heatMapDim: d3Dimensions) {
    // Prevents cases of duplication 
     d3.select(svgRef.current).selectAll("*").remove();

    return d3
            .select(svgRef.current)
            .attr("width", heatMapDim.width + heatMapDim.margin.left + heatMapDim.margin.right)
            .attr("height", heatMapDim.height + heatMapDim.margin.top + heatMapDim.margin.bottom)
            .append('g')
            .attr("transform", `translate(${heatMapDim.margin.left},${heatMapDim.margin.top})`);
}

function createHeatMapDim(): d3Dimensions {
    const heatMapDim: d3Dimensions = {
        margin: {top: 30, right: 30, bottom: 30, left: 120},
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


// TODO: too many params!!!!
function drawHeatMapRect(svg: any, heatMap: heatMapData, heatMapDim: d3Dimensions, d3x: d3.ScaleBand<string>, d3y: d3.ScaleBand<string>, setSelectedDate: React.Dispatch<React.SetStateAction<string>>
    , setSelectedKey: React.Dispatch<React.SetStateAction<string>>,
setSelectedCount:  React.Dispatch<React.SetStateAction<string>>) {

    let color = d3.scaleLinear<string>().range(["white", "green"]).domain([1, 10000]);

    for (const ele of heatMap.elasticData) {
        for (const bucket of ele.dateHistogram.buckets) {
            let xKey: string = heatMap.dateToKey(toDate(bucket.key));
            let yKey: string = ele.key.target;

            if (d3x(xKey) === undefined || d3y(yKey) === undefined ) continue;

            svg
                .append("rect")
                .attr("x", () => d3x(xKey))
                .attr("y", () => d3y(yKey))
                .attr("width", d3x.bandwidth())
                .attr("height", d3y.bandwidth())
                .style("fill", () => color(bucket.doc_count))
                .on("mouseover", () => {
                    console.log(bucket);
                    setSelectedKey(ele.key.target);
                    setSelectedDate(heatMap.dateToKey(toDate(bucket.key)));
                    setSelectedCount(bucket.doc_count);
                })
        }
    }
}

let heatMapParams: heatMapConstructor = {
    calendarInterval: 'month',
    startDate: new Date(new Date(2021, 3, 1, 0, 0, 0)),
    endDate: new Date(2022, 5, 1, 0, 0, 0),
    autoFetchData: true,
    column: "NORMALIZED_TARGET"
}

const heatMap: heatMapData = new heatMapData(heatMapParams);


function CreateHeatMap() {
    const svgRef: React.MutableRefObject<null> = React.useRef(null);
    const heatMapDim: d3Dimensions = createHeatMapDim();

    const [colArray, setColArray] = React.useState(JSON.stringify(heatMap.getColKeys()));
    const [col, setCol] = React.useState(heatMap.column);
    const [startDate, setStartDate] = React.useState(heatMap.startDate.toISOString());
    const [endDate, setEndDate] = React.useState(heatMap.endDate.toISOString());
    const [selectedDate, setSelectedDate] = React.useState("NONE");
    const [selectedKey, setSelectedKey] = React.useState("NONE");
    const [selectedCount, setSelectedCount] = React.useState("NONE");

    heatMap.setStartDateHook = setStartDate;
    heatMap.setEndDateHook = setEndDate;

    initUserNav(0, heatMap, setStartDate, setEndDate);

    React.useEffect(() => {
        heatMap.column = col;

        heatMap.fetchData().then(() => {
            let svg = initSVG(svgRef, heatMapDim);
            const d3x: d3.ScaleBand<string> = createX(svg, heatMap, heatMapDim);
            const d3y: d3.ScaleBand<string> = createY(svg, heatMap, heatMapDim);
            
            setColArray(JSON.stringify(heatMap.getColKeys()));
            setEndDate(heatMap.endDate.toISOString())
            heatMap.panUnit = d3x.bandwidth();
             
            drawHeatMapRect(svg, heatMap, heatMapDim, d3x, d3y,
                            setSelectedDate, setSelectedKey, setSelectedCount);   
        });
    }); 
    
    return  <div className="padLeft padTop">
                <select value={col} onChange={e => setCol(e.currentTarget.value)}> 
                    {JSON.parse(colArray).map((option: any) => (
                        <option value={option} key={option}>{option}</option>
                    ))}
                </select>
                <div className="padTop">
                    KEY: {selectedKey}
                </div>
                <div>
                    DATE: {selectedDate}
                </div>
                <div>
                    COUNT: {selectedCount}
                </div>
                <div>
                    <svg id="heatMapSVG" ref={svgRef}/>
                </div>
                
            </div>;
}

function HeatMap() {
    return (
        CreateHeatMap()
    );
}

export default HeatMap;
