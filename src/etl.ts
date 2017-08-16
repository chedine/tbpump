const reader = require("readline");
const fs = require("fs");
const flyd = require("flyd");
import * as dt from "./datetime";
import * as db from "./db";
import * as url from "./locations";
import * as moment from "moment";
import * as io from "./io";

const contracts = {
  Index: 1,
  IndexFuture: 2,
  StockFuture: 3,
  CallOption: 4,
  PutOption: 5,
  Vix: 6,
  Equity: 7,
  Commodity: 8,
  CallStockOption: 9,
  PutStockOption: 10
};
/**
 * Resolves contract type using contract description (in bhav copy) and option type columns.
 * @param contract 
 * @param optionType 
 */
const resolveFNOType = function (contract: string, optionType: string) {
  if (contract === "FUTIDX") {
    return contracts.IndexFuture;
  }
  if (contract === "FUTSTK") {
    return contracts.StockFuture;
  }
  if (contract === "OPTIDX") {
    return optionType === "CE" ? contracts.CallOption : contracts.PutOption;
  }
  throw new Error("Unknown contract type : " + contract);
}
/**
 * 
 * @param instrument 
 */
const addInstrumentName = function (instrument: any) {
  let name: string = instrument.underlying + "_" + instrument.type;
  if (instrument.expiry) {
    name += "_" + instrument.expiry.toString();
  }
  if (instrument.type === contracts.CallOption || instrument.type === contracts.PutOption) {
    name += "_" + instrument.strike.toString();
  }
  instrument.name = name;
}
/**
 * CSV parse settings to parse Market Activity file.
 * Only data I'm concerned right now is Nifty spot data.
 */
const MA_FILE_OPTS = {
  filter: function (tokens: string[]) {
    return tokens.length > 1 && tokens[1] === "Nifty 50";
  },
  parse: function (filename: string, tokens: string[]) {
    return {
      underlying: "NIFTY",
      open: parseFloat(tokens[3]),
      high: parseFloat(tokens[4]),
      low: parseFloat(tokens[5]),
      close: parseFloat(tokens[6]),
      type: contracts.Index,
      trade_date: Number(dt.dateStrToDateStr(filename.substring(2, 8), "DDMMYYYY", "YYYYMMDD"))
    };
  }
}
/**
 * Parser settings for FNO file.
 * Accepts everything that's related to nifty. (Futures and Options)
 */
const FNO_FILE_OPTS = {
  filter: function (tokens: string[]) {
    return tokens.length > 1 && tokens[1] === "NIFTY";
  },
  parse: function (filename: string, tokens: string[]) {
    return {
      underlying: tokens[1],
      open: parseFloat(tokens[5].trim()),
      high: parseFloat(tokens[6]),
      low: parseFloat(tokens[7]),
      close: parseFloat(tokens[8]),
      type: resolveFNOType(tokens[0].trim(), tokens[4].trim()),
      oi: parseFloat(tokens[12]),
      volume: parseFloat(tokens[10]),
      strike: parseFloat(tokens[3]),
      trade_date: Number(dt.dateStrToDateStr(filename.substring(2, 11), "DDMMMYYYY", "YYYYMMDD")),
      expiry: Number(dt.dateStrToDateStr(tokens[2], "DD-MMM-YYYY", "YYYYMMDD")),
    };
  }
}
/**
 * CSV parser setting to parse Volatility File.
 * Concerned only Nifty
 */
const VOLT_FILE_OPTS = {
  filter: function (tokens: string[]) {
    return tokens.length > 1 && tokens[1] === "NIFTY";
  },
  parse: function (filename: string, tokens: string[]) {
    return {
      underlying: "VIX",
      open: parseFloat(tokens[15]),
      high: parseFloat(tokens[15]),
      low: parseFloat(tokens[15]),
      close: parseFloat(tokens[15]),
      type: contracts.Vix,
      trade_date: Number(dt.dateStrToDateStr(filename.substring(7, 15), "DDMMYYYY", "YYYYMMDD"))
    };
  }
}
/**
 * Given a stream carrying "Instruments", returns a function that can read
 * a given file using a given CSV parser options.
 * For every row(line) in the file, parses it into an Instrument object and 
 * sends it across the stream(data$)
 * @param data$ - Stream on which parsed Instrument object will be sent over.
 */
export function transform(file: string, callback: any) {
  const lineReader = reader.createInterface({
    input: fs.createReadStream(file)
  });
  const parserOptions = resolveParser(file);
  const fileName = io.parseFileName(file);
  const instruments = [];
  lineReader.on("line", function (line: string) {
    const tokens = line.split(",");
    if (parserOptions.filter(tokens)) {
      const instrument = parserOptions.parse(fileName, tokens);
      addInstrumentName(instrument);
      // data$(instrument);
      instruments.push(instrument);
    }
  });
  lineReader.on("close", function () {
    callback(instruments);
  });
}


function resolveParser(file: string) {
  const fileName: string = io.parseFileName(file);
  if (fileName.startsWith("FOVOLT")) {
    return VOLT_FILE_OPTS;
  }
  else if (fileName.startsWith("MA")) {
    return MA_FILE_OPTS;
  }
  else {
    return FNO_FILE_OPTS;
  }
}
/**
 * 
 */
export function makeETL() {
  const allInstruments = [];

  function download(date: moment.Moment, callback: any) {

    const extractCompleteHandler = function (fileName: string) {
      transform(fileName, callback);
    }
    const saveHandler = function (fileName: string) {
      if (fileName.endsWith(".zip")) {
        io.extract(fileName, url.workLocation, url.tempLocation, extractCompleteHandler);
      }
      else {
        extractCompleteHandler(fileName);
      }
    }
    const downloadHandler = function (response) {
      io.saveBhavCopy(url.workLocation, response, saveHandler);
    }
    io.download(url.getFNOUrl(date), downloadHandler);
    io.download(url.getMAUrl(date), downloadHandler);
    io.download(url.getVOLTUrl(date), downloadHandler);
  }

  function downloadAll(from: moment.Moment, to: moment.Moment) {
    let dbBusy = false;
    const days: Set<moment.Moment> = dt.range(from, to);
    const dbHandler = function (instruments: any) {
      if (instruments) {
        dbBusy = true;
        db.DataStore.getInstance().insertInstruments(instruments, dbHandler);
      }
      else {
        dbBusy = false;
      }
    }
    const dataHandler = function (instruments: any) {
      allInstruments.push(instruments);
      if (!dbBusy) {
        dbBusy = true;
        db.DataStore.getInstance().insertInstruments(allInstruments.shift(), dbHandler);
      }
    }
    days.forEach((day: moment.Moment) => download(day, dataHandler));
  }
  // External API
  return {
    downloadAll: downloadAll
  }
}