const flyd = require("flyd");
const streamFilter = require("flyd/module/filter");
const fs = require("fs");
import * as io from "./io";
import * as db from "./db";
import * as url from "./locations";
import * as dt from "./datetime";
import * as moment from "moment";
import * as etlproc from "./etl";
/**
 * 
 */
function main() {
    const args = process.argv.slice(2);
    const etl = etlproc.makeETL();
    const refresh = function () {
        console.log("Refreshing database ...");
        db.DataStore.getInstance().findLastRefresh(function (lastRefresh: number) {
            console.log("Refreshing from " + lastRefresh);
            const to = dt.today();
            const from = dt.toDate(lastRefresh.toString()).add(1, "days");
            etl.downloadAll(from, to);
        });
    }

    const downloadPeriod = function (start: string, end: string) {
        const from = dt.toDate(start);
        const to = dt.toDate(end);
        etl.downloadAll(from, to);
    }
    const cmd = args.length > 0 ? args[0] : "refresh";

    if (cmd === "refresh") {
        refresh();
    }
    else if (cmd === "init") {
        console.log("Initiliazing database schema");
        db.DataStore.getInstance().setupSchema();
    }
    else if (cmd === "dump") {
        db.DataStore.getInstance().dump();
    }
    else if (cmd === "download") {
        console.log("Downloading bhav copies from " + args[1] + " to " + args[2]);
        downloadPeriod(args[1], args[2]);
    }
    else {
        console.log("Unknown command ...");
    }
}

// Setup work location
fs.mkdir(url.workLocation, function (err: any) {
    if (err) {
        console.log("Skipping work directory creation..")
    }
    main();
});