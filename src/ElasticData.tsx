import {format, add as addDate, sub as subDate, compareDesc, differenceInDays} from 'date-fns' ;
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

        if (interval === 'week') {
            interval = 'day';
            count = 7
        }
    
        obj[`${interval}s`] = Math.round(count * intervalCount);
    
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

        console.log(timeDomain)

        return timeDomain;
    }

    // getBucketCount(): number {
    //     let bucketCount = 0;

    //     differenceInDays(this.startDate, this.endDate)
    // }


    autoInterval(): boolean {
        let bucketCount = 0;
        let change = false;

        if (Math.abs(differenceInDays(this.endDate, this.startDate)) > 125
            && this.calendarInterval === "day") {
            this.calendarInterval = 'month';
            change = true;
        }
        else if (Math.abs(differenceInDays(this.endDate, this.startDate)) <= 125
                 && this.calendarInterval === "month") {
            this.calendarInterval = 'day';
        }

        this.intervalIndex = this.intervalArray.indexOf(this.calendarInterval);

        console.log(this.startDate);
        console.log(this.endDate);

        console.log(Math.abs(differenceInDays(this.endDate, this.startDate)));
        
        return change;
    }

    getRange(order: string, maxShown: number): Array<string> {
        let range: Array<string> = [];
        let keySumPair: Array<{key: string, sum: number}> = [];
        for (const ele of this.elasticData) {
            range.push(ele.key.target);

            keySumPair.push({
                key: ele.key.target,
                sum: ele.dateHistogram.buckets.reduce(
                        (acc: number, val: any) => acc + val.doc_count, 0)
            });
        }

        if (order == "desc") keySumPair.sort((a, b) => a.sum - b.sum);
        if (order == "asc") keySumPair.sort((a, b) => b.sum - a.sum);
        let start = keySumPair.length - maxShown;
        start = start < 0 ? 0 : start;
        return keySumPair.map(ele => ele.key).slice(start, keySumPair.length);
    }

    getColKeys(): Array<string> {
        return this.elasticData?.colKeys !== undefined ? this.elasticData.colKeys : ["EMPTY"];
    }

    dateToKey(date: Date): string {
        let key: string = `${date.getFullYear()}`;

        if (this.intervalIndex < 4)
            key += `/${date.getMonth() + 1}`;
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
