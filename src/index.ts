const flyd = require("flyd");
const streamFilter = require("flyd/module/filter");
const fs = require("fs");
import * as io from "./io";
import * as url from "./locations";
import * as dt from "./datetime";
import * as moment from "moment";
import * as etl from "./etl";

/**
 * Initializes downloaders, writers, extractor functions with appropriate streams
 * and connects streams together so that the value flows..
 * 1. Any object on download$ is mapped to a writer function (to persist the content into a file)
 * 2. Any object on savedFile$ is filtered (for .zip files) and mapped to a extract function.
 * Objects are pushed into dowload$ by downloader function
 * Objects are pushed into savedFile$ by writer function
 * Both downloader and writer functions pushes errors into error$
 */
function bootstrap() {
    const download$: stream = flyd.stream(); // All downloads
    const error$: stream = flyd.stream(); // All errors
    const savedFile$: stream = flyd.stream(); // All downloads saved as files
    const csvDownloads$ = streamFilter((file: string) => file.endsWith(".csv"), savedFile$);
    const zipDownloads$ = streamFilter((file: string) => file.endsWith(".zip"), savedFile$);
    const unzip$ = flyd.stream(); // All zip files extracted 

    const downloader = io.makeDownloader(download$, error$);
    const writer = io.makeFileWriter(savedFile$, error$);
    const extractor = io.makeExtractor(unzip$);

    const dbLoad$ = flyd.stream();
    const loader = etl.makeBhavCopyLoader(dbLoad$);
    function download(date: moment.Moment) {
        downloader(url.getFNOUrl(date));
        downloader(url.getMAUrl(date));
        downloader(url.getVOLTUrl(date));
    }

    function downloadAll(from: moment.Moment, to: moment.Moment) {
        const days: Set<moment.Moment> = dt.range(from, to);
        days.forEach((d: moment.Moment) => download(d));
    }
    // Draining error stream
    flyd.on((err: any) => console.log("Err: " + err), error$);
    // Write the downloaded content
    flyd.map((s: any) => writer(url.workLocation, s), download$);
    // Filter the saved files for zip types
    flyd.on((f: any) => extractor(f, url.workLocation, url.tempLocation), zipDownloads$);

    flyd.on((f: any) => loader(f), csvDownloads$);
    flyd.on((f: any) => loader(f), unzip$);

    flyd.on((s: any) => console.log("Unzip ended"), unzip$.end);

    // Setup work location
    fs.mkdir(url.workLocation, function (err: any) {
        if (err) {
            console.log("Skipping work directory creation..")
        }
    });
    // External API
    return {
        download: download,
        downloadAll: downloadAll
    }
}
const main = bootstrap();
const from = dt.toDate("20170713");
const to = dt.toDate("20170714");
main.downloadAll(from, to);
console.log("Done !!! ");