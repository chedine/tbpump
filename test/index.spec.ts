/// <reference path="../node_modules/@types/mocha/index.d.ts" />
import { expect } from "chai";
import * as main from "../src/main";
import * as R from "ramda"
import * as moment from "moment";
const { Identity, Maybe, Either, Future, IO } = require("ramda-fantasy");
const sqlite3 = require("sqlite3").verbose();

describe("Date Range functions", () => {
  it("Date range is determined correctly", () => {
    const database = new sqlite3.Database("./db/test.db");
    const env = {
      database: database,
      workLocation: "./work"
    };
   // main.etl(env, "20170101", "FNO").fork(console.log, console.log);
   R.pair([1,2] , []);
  })
});