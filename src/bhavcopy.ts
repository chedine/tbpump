const { Identity, Maybe, Either, Future, IO } = require("ramda-fantasy");
import * as R from "ramda";
import * as moment from "moment";
const fs = require("fs");
const limit = require("simple-rate-limiter");
const path = require("path");
const decompress = require("decompress");
import * as parser from "./parser";
const request = limit(require("request")).to(1).per(500);

export const dateStrToMoment = R.curry((format: string, dateStr: string) =>
    moment(dateStr, format));

export const isoDateToMoment = R.partial(dateStrToMoment, ["YYYYMMDD"]);

export const momentToDateString = R.curry((format: string, date: moment.Moment) =>
    date.format(format));

export const momentToISODateStr = R.partial(momentToDateString, ["YYYYMMDD"]);

const momentToMATypeDate = R.partial(momentToDateString, ["DDMMYY"]);
const momentToFNOTypeDate = R.partial(momentToDateString, ["DDMMMYYYY"]);
const momentToVoltTypeDate = R.partial(momentToDateString, ["DDMMYYYY"]);
export const addDays = R.curry((date, daysToAdd) => moment(date).add(daysToAdd, "d"));

export const buildBhavCopyDateTypes = R.cond([
    [R.equals("MA"), R.always(momentToMATypeDate)],
    [R.equals("FNO"), R.always(momentToFNOTypeDate)],
    [R.equals("VOLT"), R.always(momentToVoltTypeDate)]
]);

export const changeDateFormat = (date: string, srcFormat: string, targetFormat: string) =>
    moment(date, srcFormat).format(targetFormat);

export const getDateRange = (start, end) =>
    R.times(n => addDays(start, n), (end.diff(start, "days")));

export const todayAsISODate = () => IO(() => momentToISODateStr(moment()));

const buildMAUrl = (dateStr: string) =>
    `http://www.nseindia.com/archives/equities/mkt/MA${dateStr}.csv`;

const buildFNOUrl = (dateStr: string) => {
    return Identity.of(dateStr)
        .map(ds => ds.toUpperCase())
        .map(upperDate => {
            const year = upperDate.substr(5, 4);
            const mon = upperDate.substr(2, 3);
            return `http://www.nseindia.com/content/historical/DERIVATIVES/${year}/${mon}/fo${upperDate}bhav.csv.zip`;
        })
        .get();

}
const buildVoltUrl = (dateStr: string) =>
    `http://nseindia.com/archives/nsccl/volt/FOVOLT_${dateStr}.csv`;

export const buildBhavCopyUrl = R.cond([
    [R.equals("MA"), R.always(buildMAUrl)],
    [R.equals("FNO"), R.always(buildFNOUrl)],
    [R.equals("VOLT"), R.always(buildVoltUrl)]
]);

export const download1 = url => Future((reject, resolve) =>
    got(url)
        .then(response => resolve((response)))
        .catch(err => reject(err)));

const makeDownloadReqHeader = url => {
    return {
        url: url,
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;",
            "Accept-Encoding": "gzip, deflate, sdch",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64)"
        },
        encoding: null
    };
}
// TODO: clean this up
const piggyResponse = (response, url) => {
    response.requestUrl = url;
    return response;
}
const resolveIfValidResponse = (reject, resolve, response, url) =>
    response.statusCode == 200 ? resolve(piggyResponse(response, url))
        : reject({
            err: "Download Failed",
            httpCode: response.statusCode,
            url: url
        });

export const download = url => Future((reject, resolve) =>
    request(makeDownloadReqHeader(url), (err, response, body) =>
        err ? reject({ err: "Download Failed", url: url, details: JSON.parse(err) })
            : resolveIfValidResponse(reject, resolve, response, url)));

export const save = R.curry((fileName, contents) => Future((reject, resolve) =>
    fs.writeFile(fileName, contents, (err) =>
        err ? reject(err) : resolve(fileName))));

export const locationToSave = R.curry((worklocation, filename) =>
    path.join(worklocation, filename));

export const fileNameFromUrl = url => R.last(url.split("/"));

export const fileNameFromPath = absPath => path.parse(absPath).base;

export const readFile = fileUri => Future((reject, resolve) =>
    fs.readFile(fileUri, "utf-8", (err, contents) =>
        err ? reject(err) : resolve(contents)));

export const isZipFile = (fileName: string) => fileName.endsWith(".zip");

export const readZipFile = (fileUri, archiveLocation) => Future((reject, resolve) =>
    decompress(fileUri, archiveLocation)
        .then(files => resolve(path.join(path.dirname(fileUri), files[0].path)))
        .catch(err => reject(err)));

export const extractWhenRequired = (fileUri, archiveLocation) =>
    isZipFile(fileUri) ?
        readZipFile(fileUri, archiveLocation) :
        Future((rej, res) => res(fileUri));