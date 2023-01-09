type shiftOpperation = '+' | '-';
type calendarIntervalType = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

interface heatMapConstructor {
    calendarInterval: calendarIntervalType;
    startDate: Date;
    endDate: Date;
    autoFetchData: boolean;
    column: string
}

interface margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface d3Dimensions {
    margin: margin;
    height: number;
    width: number;
}

export type {heatMapConstructor, shiftOpperation, calendarIntervalType, d3Dimensions};