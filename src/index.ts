const flyd = require("flyd");
const streamFilter = require("flyd/module/filter")
import * as io from "./io";
import * as url from "./locations";
import * as dt from "./datetime";
import * as moment from "moment";

const download$ = flyd.stream();
const error$ = flyd.stream();
const savedFile$ = flyd.stream();

const downloader = io.makeDownloader(download$, error$);
const writer = io.makeFileWriter(savedFile$, error$);

function download(date: moment.Moment) {
    downloader(url.getFNOUrl(date));
    downloader(url.getMAUrl(date));
    downloader(url.getVOLTUrl(date));
}

function downloadAll(from: moment.Moment, to: moment.Moment) {
    const days: Set<moment.Moment> = dt.range(from, to);
    days.forEach((d: moment.Moment) => download(d));
}

function bootstrap() {
    flyd.on(function (response: any) {
        console.log("response");
    }, download$);

    flyd.on(function (response: any) {
        console.log(response);
    }, error$);

    flyd.map((s: any) => writer("work", s), download$);
    const downloadedZipFile$ = streamFilter((downloadedFile: string) => downloadedFile.endsWith(".zip"), savedFile$);
    flyd.map((s: any) => io.extract(s, "work/temp"), downloadedZipFile$);


}
bootstrap();
const from = dt.toDate("20170701");
const to = dt.toDate("20170721");
downloadAll(from, to);