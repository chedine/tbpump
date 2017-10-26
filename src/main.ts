const { Identity, Maybe, Either, Future, IO } = require("ramda-fantasy");
import * as R from "ramda";
import * as moment from "moment";
import * as parser from "./parser";
import * as bhav from "./bhavcopy";
import * as db from "./litedb";

const workLocation = "./work";
const logIO = obj => IO(() => console.log(obj));
const tapIO = obj => IO(() => {
    console.log(obj);
    return obj;
});
const checkin = R.curry((messageGenerator: any, value: any) => {
    console.log(messageGenerator(value));
    return value;
})

const loadIntoDB = R.curry((database, instruments: db.Instrument[]) =>
    db.bulkInsertInstruments(database, instruments));

const loadBhavCopy = (env: AppEnv, bhavCopyType: string, filePath: string) => {
    const toInstruments = parser.buildBhavCopyParser(
        bhav.fileNameFromPath(filePath))(bhavCopyType);
    return bhav.extractWhenRequired(filePath, workLocation)
        .chain(bhav.readFile)
        .map(toInstruments) // Identity<[instruments]>
        .chain(i => loadIntoDB(env.database, i.get()))
}

const extract = (date: string, bhavCopyType: string) => {
    const urlBuilder = bhav.buildBhavCopyUrl(bhavCopyType);
    const dateStrBuilder = bhav.buildBhavCopyDateTypes(bhavCopyType);
    const results =
        IO(() => bhav.isoDateToMoment(date))
            .map(dateStrBuilder)
            .chain(d => IO.of(urlBuilder(d)))
            .map(bhav.download)
            .runIO()
            .map(checkin(resp => `Downloaded from : ${resp.requestUrl}`))
            .chain(response =>
                bhav.save(bhav.locationToSave(workLocation, bhav.fileNameFromUrl(response.requestUrl))
                    , response.body))
    return results;
}

export const etl = (env: AppEnv, date: string, bhavCopyType: string) => {
    return extract(date, bhavCopyType)
        .chain(extracted => loadBhavCopy(env, bhavCopyType, extracted));
}

const app = R.curry((env: AppEnv, dates: string[]) => {
    //   const listOfFutures: any = R.traverse(Future.of, d => etl(d, bhavCopyType) , dates);
    //  listOfFutures.fork(console.log, console.log);
    const bhavCopyDates = R.xprod(dates, ["FNO", "MA", "VOLT"]);
    bhavCopyDates.map((pair: string[]) => etl(env, pair[0], pair[1])
        .fork(console.error, console.log));
});

export const runETL = (appInput: AppSpec) => {
    const listOfDatesToETL = bhav.getDateRange(bhav.isoDateToMoment(appInput.startDate)
        , bhav.isoDateToMoment(appInput.endDate))
        .map(bhav.momentToISODateStr);
    app(appInput.env, listOfDatesToETL);
}

