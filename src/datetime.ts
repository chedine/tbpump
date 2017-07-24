import * as moment from "moment";

const defaultFormat = "YYYYMMDD";
/**
* Returns today as a Moment instance
*/
export const today = (): moment.Moment => moment().utc();
/**
* Returns the given date as a string using the given format.
*/
export const toStringFormat = (adate: moment.Moment, format: string): string => adate.format(format);
/**
* Returns the given date as a string in yyyyMMdd format
*/
export const toString = (adate: moment.Moment): string => toStringFormat(adate, defaultFormat);
/**
* Converts the given string representing a date in yyyyMMdd format
* to a moment (date) instance.
*/
export const toDate =  (datestr: string): moment.Moment => moment.utc(datestr, defaultFormat);
/**
* Given two moment instances start and end,
* returns a set of all dates between start and end (inclusive of both)
*/
export function range (start: moment.Moment, end: moment.Moment = start): Set<moment.Moment>{
  const daysInBetween: Set<moment.Moment> = new Set();
  const diff = (end.diff(start, "days"));
  for (let i = 0; i <= diff; i++) {
    const m: moment.Moment = moment(start).add(i, "d");
    daysInBetween.add(m);
  }
  return daysInBetween;
}

export const tsToDate = (ts: number): moment.Moment => moment(ts).utc();

export const tsToDateStr = (ts: number): string => toString(tsToDate(ts));

export const dateStrToTs = (date: string): number => toDate(date).valueOf();

export const diff = (ts1: number, ts2: number) => moment(ts1).utc().diff(moment(ts2).utc(), "days");

export const thirtyDaysBefore = (ts: number): number => tsToDate(ts).subtract(30, "days").valueOf();