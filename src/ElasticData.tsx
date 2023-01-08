import {format, add as addDate, sub as subDate, compareDesc} from 'date-fns' ;
import React from 'react';
import { getCommentRange } from 'typescript';
import getElasticData from './GetElasticData';
import {heatMapConstructor, shiftOpperation, calendarIntervalType} from './types';

function getIntervalObject(interval: calendarIntervalType): {[k: string]: number} {
    let obj: {[k: string]: number} = {};
    let count: number = 1;

    if (interval === 'quarter') {
        interval = 'month';
        count = 3
    }

    obj[`${interval}s`] = count;

    return obj;
}

class heatMapData {
    elasticData: any;
    calendarInterval: calendarIntervalType;
    startDate: Date;
    endDate: Date;
    autoFetchData: boolean;
    
    constructor(input: heatMapConstructor) {
        this.startDate = input.startDate;
        this.endDate = input.endDate;
        this.calendarInterval = input.calendarInterval;
        this.autoFetchData = input.autoFetchData;
    }

    setStartDate(newStartDate: Date): heatMapData {
        this.startDate = newStartDate;
        return this;
    }

    setEndDate(newEndDate: Date): heatMapData {
        this.endDate = newEndDate;
        return this;
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
        if (shift === '+')
            this.endDate = addDate(this.endDate, getIntervalObject(this.calendarInterval))
        else
            this.endDate = subDate(this.endDate, getIntervalObject(this.calendarInterval))

        return this;
    }

    async fetchData() {
        this.elasticData = await getElasticData();
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

    dateToKey(date: Date): string {
        return (`${date.getFullYear()}/${date.getMonth()}`);
    }
}

export default heatMapData;
