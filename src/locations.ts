import * as datetime from "./datetime";
import * as moment from "moment";

const fno_base_url = "http://www.nseindia.com/content/historical/DERIVATIVES";
const volt_base_url = "http://nseindia.com/archives/nsccl/volt";
const ma_base_url = "http://www.nseindia.com/archives/equities/mkt";

function urlFromParts(parts: [string]): string {
    return parts.join("/");
}
/**
 * 
 * @param date 
 */
export function getMAUrl(date: moment.Moment): string {
    const dateString: string = datetime.toStringFormat(date, "DDMMYY");
    const fileName = `MA${dateString}.csv`;
    return urlFromParts([ma_base_url, fileName]);
}
/**
 * 
 * @param date 
 */
export function getFNOUrl(date: moment.Moment): string {
    const dateString: string = datetime.toStringFormat(date, "DDMMMYYYY")
        .toUpperCase();
    const fileName = `fo${dateString}bhav.csv.zip`;
    const year: string = datetime.toStringFormat(date, "YYYY");
    const month: string = datetime.toStringFormat(date, "MMM").toUpperCase();
    return urlFromParts([fno_base_url, year, month, fileName]);
}
/**
 * 
 * @param date 
 */
export function getVOLTUrl(date: moment.Moment): string {
    const dateString: string = datetime.toStringFormat(date, "DDMMYYYY");
    const fileName = `FOVOLT_${dateString}.csv`;
    return urlFromParts([volt_base_url, fileName]);
}
/**
 * 
 * @param symbol 
 * @param date 
 */
export function getBhavCopyURL(symbol: string, date: moment.Moment): string {
    if ("MA" === symbol) {
        return getMAUrl(date);
    }
    else if ("VOLT" === symbol) {
        return getVOLTUrl(date);
    }
    else if ("FNO" === symbol) {
        return getFNOUrl(date);
    }
    else {
        throw new Error("Un supported symbol " + symbol)
    };
}

export const workLocation = "./work";
export const tempLocation = workLocation + "/temp";
export const dbLocation = "./db/datafeed.db";