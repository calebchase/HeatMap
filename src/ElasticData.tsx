import {format, add as addDate, sub as subDate, compareDesc} from 'date-fns' ;
import React from 'react';
import { getCommentRange } from 'typescript';
import getElasticData from './GetElasticData';
import {heatMapConstructor, shiftOpperation, calendarIntervalType} from './types';

function getIntervalObject(interval: calendarIntervalType, intervalCount: number = 1): {[k: string]: number} {
    let obj: {[k: string]: number} = {};
    let count: number = 1;

    if (interval === 'quarter') {
        interval = 'month';
        count = 3
    }

    obj[`${interval}s`] = count * intervalCount;

    return obj;
}

class heatMapData {
    elasticData: any;
    calendarInterval: calendarIntervalType;
    startDate: Date;
    endDate: Date;
    autoFetchData: boolean;
    intervalArray: Array<calendarIntervalType> = ['minute', 'hour', 'day', 'month', 'year'];
    intervalIndex: number;
    column: string;
    panUnit: number = Infinity;
    setStartDateHook?: React.Dispatch<React.SetStateAction<string>>;
    setEndDateHook?: React.Dispatch<React.SetStateAction<string>>;

    constructor(input: heatMapConstructor) {
        this.startDate = input.startDate;
        this.endDate = input.endDate;
        this.calendarInterval = input.calendarInterval;
        this.autoFetchData = input.autoFetchData;
        this.intervalIndex = this.intervalArray.indexOf(this.calendarInterval);
        this.column = input.column;
    }

    getIntervalObject(interval: calendarIntervalType, intervalCount: number = 1): {[k: string]: number} {
        let obj: {[k: string]: number} = {};
        let count: number = 1;
    
        if (interval === 'quarter') {
            interval = 'month';
            count = 3
        }
    
        obj[`${interval}s`] = count * intervalCount;
    
        return obj;
    }
    

    setCalendarInterval(newCalendarInterval: calendarIntervalType): heatMapData {
        this.calendarInterval = newCalendarInterval;
        if (this.autoFetchData) this.fetchData();

        return this;
    }

    shiftStartDate(shift: shiftOpperation): heatMapData {
        if (shift === '+')
            this.startDate = addDate(this.startDate, getIntervalObject(this.calendarInterval))
        else
            this.startDate = subDate(this.startDate, getIntervalObject(this.calendarInterval))
        
        return this;
    }

    shiftEndDate(shift: shiftOpperation): heatMapData {
        console.log(this.calendarInterval);
        if (shift === '+')
            this.endDate = addDate(this.endDate, getIntervalObject(this.calendarInterval))
        else
            this.endDate = subDate(this.endDate, getIntervalObject(this.calendarInterval))

        return this;
    }

    async fetchData() {
        this.elasticData = await getElasticData(this.calendarInterval, this.column);
    }

    getTimeDomain(): Array<string> {
        let timeDomain: Array<string> = [];
        let tempDate = this.startDate;

        while (compareDesc(tempDate, this.endDate) !== -1) {
            timeDomain.push(this.dateToKey(tempDate));            
            tempDate = addDate(tempDate, getIntervalObject(this.calendarInterval));
        }

        return timeDomain;
    }

    getRange(): Array<string> {
        let range: Array<string> = [];

        for (const ele of this.elasticData) {
            range.push(ele.key.target);
        }

        return range;
    }

    getColKeys(): Array<string> {
        return this.elasticData?.colKeys !== undefined ? this.elasticData.colKeys : ["EMPTY"];
    }

    dateToKey(date: Date): string {
        let key: string = `${date.getFullYear()}`;

        if (this.intervalIndex < 4)
            key += `/${date.getMonth()}`;
        if (this.intervalIndex < 3)
            key += `/${date.getDate()}`;
        if (this.intervalIndex < 2)
            key += `/${date.getHours()}`;
        if (this.intervalIndex < 1)
            key += `/${date.getMinutes()}`;

        return key;
    }

    shiftIntervalIndex(shift: shiftOpperation): heatMapData {
        if (shift === '+' && this.intervalIndex + 1 < this.intervalArray.length)
            this.intervalIndex++;
        else if (this.intervalIndex - 1 >= 0)
            this.intervalIndex--;

        this.calendarInterval = this.intervalArray[this.intervalIndex];

        return this;
    }
}

export default heatMapData;
