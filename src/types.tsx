interface heatMapConstructor {
    calendarInterval: calendarIntervalType;
    startDate: Date;
    endDate: Date;
    autoFetchData: boolean;
}

type shiftOpperation = '+' | '-';
type calendarIntervalType = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export type {heatMapConstructor, shiftOpperation, calendarIntervalType};