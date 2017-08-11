const reader = require("readline");
const fs = require("fs");
const flyd = require("flyd");
import * as dt from "./datetime";
import * as db from "./db";
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
      trade_date: Number(filename.substring(2, 8))
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
      trade_date: Number(dt.dateStrToDateStr(filename.substring(2, 11), "DDMMMYYYY", "DDMMYYYY")),
      expiry: Number(dt.dateStrToDateStr(tokens[2], "DD-MMM-YYYY", "DDMMYYYY")),
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
      trade_date: Number(filename.substring(7, 15))
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
export function makeBhavCopyLoader(data$: stream) {
  flyd.map((ins: any) => db.instance.insertInstruments(ins), data$);

  return function (file: string, opts?: any) {
    console.log("DB: Loading " + file);
    const lineReader = reader.createInterface({
      input: fs.createReadStream(file)
    });
    const parserOptions = opts ? opts : resolveParser(file);
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
      data$(instruments);
    });
  }
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

/** const stream = flyd.stream();
// readBhavCopy("./work/MA110717.csv", MA_FILE_OPTS);
makeBhavCopyReader(stream)("./work/temp/fo11JUL2017bhav.csv", FNO_FILE_OPTS);
makeBhavCopyReader(stream)("./work/FOVOLT_19072017.csv", VOLT_FILE_OPTS);
makeBhavCopyReader(stream)("./work/MA110717.csv", VOLT_FILE_OPTS);
// flyd.on((i: any) => console.log(i), stream);
const db$ = flyd.map((ins: any) => db.insertInstruments(ins), stream);
flyd.on((i: any) => console.log(i), db$);
**/