const sqlite3 = require("sqlite3").verbose();
import * as loc from "./locations";

export class DataStore {
    private db: any;
    private static instance: DataStore = new DataStore();
    private constructor() {
        this.db = new sqlite3.Database(loc.dbLocation);
    }

    public static getInstance = function (): DataStore {
        if (!this.instance) {
            console.log("Instantiating datastore");
            this.instance = new DataStore();
        }
        return this.instance;
    }
    public setupSchema() {
        const db = this.db;
        db.serialize(function () {
            db.run("DROP TABLE instruments;", function (err: any, row: any) {
                if (err) {
                    console.log("Instruments table does't exist");
                } else {
                    console.log("Instruments table dropped ...")
                }
            });
            db.run(INSTRUMENTS_CREATE_SQL, function (err: any, row: any) {
                if (err) {
                    console.log("Error creating table Instruments:" + err);
                } else {
                    console.log("Instruments table created ...");
                }
            });
        });
    }

    public insertInstruments(instruments: any[], callback: any) {
        const db = this.db;
        this.db.serialize(function () {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare("Insert into Instruments (underlying, open, high, low, close, expiry, oi, trade_date, strike, type, volume, name)" +
                " values (?,?,?,?,?,?,?,?,?,?,?,?)");
            instruments.forEach((instrument: any) => stmt.run([instrument.underlying, instrument.open, instrument.high, instrument.low,
            instrument.close, instrument.expiry, instrument.oi, instrument.trade_date,
            instrument.strike, instrument.type, instrument.volume, instrument.name]));
            stmt.finalize();
            db.run("COMMIT");
            console.log("DB: Inserted " + instruments.length + " rows !!");
            // db.close();
            callback();
        });

    }

    public dump() {
        this.db.all("select distinct(trade_date) as td from instruments order by trade_date", function (err, rows) {
            rows.forEach(function (row) {
                console.log(row.td);
            });
        });
    }

    public findLastRefresh(callback: any) {
        this.db.all("select max(trade_date) as lastRefresh from instruments", function (err, rows) {
            callback(rows ? rows[0].lastRefresh : undefined);
        });
    }

}

const INSTRUMENTS_CREATE_SQL = `
CREATE TABLE "instruments" (
  "id" INTEGER PRIMARY KEY,
  "expiry" bigint DEFAULT NULL,
  "close" double NOT NULL,
  "high" double NOT NULL,
  "low" double NOT NULL,
  "open" double NOT NULL,
  "oi" bigint DEFAULT NULL,
  "trade_date" bigint NOT NULL,
  "underlying" varchar(100) NOT NULL,
  "volume" bigint(20) DEFAULT NULL,
  "strike" double DEFAULT NULL,
  "type" tinyint DEFAULT NULL,
  "name" varchar(200) NOT NULL,
   UNIQUE ("name","trade_date")
) ;
`;

export function main() {
    const command = process.argv.length <= 2 ? "dump" : process.argv[2].trim();
    if (command === "dump") {
        instance.dump();
    }
    else if (command === "setup") {
        instance.setupSchema();
    }
    else {
        console.log("Unknown Command : " + command);
    }
}

export const instance = DataStore.getInstance();
