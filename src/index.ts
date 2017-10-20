const { Identity, Maybe, Either, Future, IO } = require("ramda-fantasy");
import * as R from "ramda";
import * as dblite from "./litedb";
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
import * as main from "./main";
import * as bhav from "./bhavcopy";

const workLocation = "./work";

export function bootstrap() {
    const args = process.argv.slice(2);
    const cmd = args.length > 0 ? args[0] : "refresh";
    const database = "./db/datafeed.db";
    const runETLForDates = (startDate, endDate) => {
        main.runETL({
            startDate: startDate,
            endDate: endDate,
            env: {
                database: database,
                workLocation: workLocation
            }
        });
    }
    if (cmd === "refresh") {
        console.log("refreshing ..");
        dblite.init(database)
            .chain(dblite.findLastRefresh)
            .map(results => bhav.momentToISODateStr(
                bhav.addDays(
                    bhav.isoDateToMoment(results[0].lastRefresh.toString()), 1)))
            .fork(console.log, startDate =>
                runETLForDates(startDate, bhav.todayAsISODate().runIO()));
    }
    else if (cmd === "init") {
        console.log("Initiliazing database schema ..");
        dblite.dropAndCreate(database).fork(console.error, console.log);
    }
    else if (cmd === "dump") {
        db.dumpDatabase(database).fork(console.error, console.log)
    }
    else if (cmd === "download") {
        console.log("Downloading bhav copies from " + args[1] + " to " + args[2]);
        dblite.init(database).fork(console.error, _ => runETLForDates(args[1], args[2]));
    }
    else {
        console.log("Unknown command ...");
    }
}

fs.mkdir(workLocation, function (err: any) {
    if (err) {
        console.log("Skipping work directory creation..")
    }
    bootstrap();
});