import * as moment from "moment";
import * as R from "ramda";
const { Identity, Maybe, Either, Future, IO } = require("ramda-fantasy");
import * as bhav from "./bhavcopy";

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
const checkContractType = expected => (tuple: string[]) =>
    R.equals(R.nth(0, tuple), expected)
/**
 * Resolves contract type using contract description (in bhav copy) and option type columns.
 * @param contract 
 * @param optionType 
 */
const resolveFNOType = R.cond([
    [checkContractType("FUTIDX"), R.always(contracts.IndexFuture)],
    [checkContractType("FUTSTK"), R.always(contracts.StockFuture)],
    [checkContractType("OPTIDX"),
    R.ifElse((tuple: string[]) => R.nth(1, tuple) === "CE",
        R.always(contracts.CallOption), R.always(contracts.PutOption))],
]);

export const maRecordPredicate =
    (tokens: string[]) =>
        tokens.length > 1 && tokens[1] === "Nifty 50";

export const parseMARecord = R.curry(
    (fileName: string, tokens: string[]) => {
        return {
            underlying: "NIFTY",
            open: parseFloat(tokens[3]),
            high: parseFloat(tokens[4]),
            low: parseFloat(tokens[5]),
            close: parseFloat(tokens[6]),
            type: contracts.Index,
            trade_date: Number(bhav.changeDateFormat
                (fileName.substring(2, 8), "DDMMYYYY", "YYYYMMDD")),
            name: "NIFTY_" + contracts.Index
        };
    }
);
export const fnoRecordPredicate =
    (tokens: string[]) =>
        tokens.length > 1 && tokens[1] === "NIFTY";

export const parseFNORecord = R.curry(
    (fileName: string, tokens: string[]) => {
        const underlying = tokens[1];
        const type = resolveFNOType([tokens[0].trim(), tokens[4].trim()]);
        const strike = parseFloat(tokens[3]);
        const exp = Number(bhav.changeDateFormat
            (tokens[2], "DD-MMM-YYYY", "YYYYMMDD"));
        return {
            underlying: tokens[1],
            open: parseFloat(tokens[5].trim()),
            high: parseFloat(tokens[6]),
            low: parseFloat(tokens[7]),
            close: parseFloat(tokens[8]),
            type: type,
            oi: parseFloat(tokens[12]),
            volume: parseFloat(tokens[10]),
            strike: strike,
            trade_date: Number(bhav.changeDateFormat
                (fileName.substring(2, 11), "DDMMMYYYY", "YYYYMMDD")),
            expiry: exp,
            name: underlying + "_" + exp + "_" + type + (type === contracts.CallOption || contracts.PutOption ? strike : "")
        };
    }
);

export const voltRecordPredicate =
    (tokens: string[]) =>
        tokens.length > 1 && tokens[1] === "NIFTY";

export const parseVOLTRecord = R.curry(
    (fileName: string, tokens: string[]) => {
        return {
            underlying: "VIX",
            open: parseFloat(tokens[15]),
            high: parseFloat(tokens[15]),
            low: parseFloat(tokens[15]),
            close: parseFloat(tokens[15]),
            type: contracts.Vix,
            trade_date: Number(bhav.changeDateFormat
                (fileName.substring(7, 15), "DDMMYYYY", "YYYYMMDD")),
            name: "VIX_" + contracts.Vix
        };
    }
);

export const parseBhavCopy = R.curry((rowPredicate, rowParser, contents: string) => {
    return Identity.of(contents.split("\n"))
        .map(lines => R.map((line: string) => line.split(","), lines))
        .map(rows => R.filter(rowPredicate, rows))
        .map(filteredRows => R.map(rowParser, filteredRows))
});

export const buildBhavCopyParser = (fileName: string) =>
    R.cond([
        [R.equals("MA"),
        R.always(parseBhavCopy(maRecordPredicate, parseMARecord(fileName)))],
        [R.equals("FNO"),
        R.always(parseBhavCopy(fnoRecordPredicate, parseFNORecord(fileName)))],
        [R.equals("VOLT"),
        R.always(parseBhavCopy(voltRecordPredicate, parseVOLTRecord(fileName)))]
    ]);
