/// <reference path="../node_modules/@types/mocha/index.d.ts" />
import { expect } from "chai";
import * as main from "../src/index";
import * as urls from "../src/locations";
import * as dt from "../src/datetime";
import * as R from "ramda"
import * as moment from "moment";

describe("URL functions", () => {
  it("MA URL is right", () => {
    expect(urls.getMAUrl(dt.toDate("20160101"))).to.equal("http://www.nseindia.com/archives/equities/mkt/MA010116.csv");
    expect(urls.getMAUrl(dt.toDate("20161231"))).to.equal("http://www.nseindia.com/archives/equities/mkt/MA311216.csv");
    // expect(urls.getMAUrl(dt.toDate("20160231"))).to.equal("http://www.nseindia.com/archives/equities/mkt/MA311216.csv");
  })
});

describe("URL functions", () => {
  it("VOLT URL is right", () => {
    expect(urls.getVOLTUrl(dt.toDate("20160101"))).to.equal("http://nseindia.com/archives/nsccl/volt/FOVOLT_01012016.csv");
    expect(urls.getVOLTUrl(dt.toDate("20161231"))).to.equal("http://nseindia.com/archives/nsccl/volt/FOVOLT_31122016.csv");
  })
});


describe("URL functions", () => {
  it("FNO URL is right", () => {
    expect(urls.getFNOUrl(dt.toDate("20160101"))).to.equal("http://www.nseindia.com/content/historical/DERIVATIVES/2016/JAN/fo01JAN2016bhav.csv.zip");
    expect(urls.getFNOUrl(dt.toDate("20161231"))).to.equal("http://www.nseindia.com/content/historical/DERIVATIVES/2016/DEC/fo31DEC2016bhav.csv.zip");
  })
});

describe("URL functions", () => {
  it("FNO URL is right", () => {
    expect(urls.getBhavCopyURL("FNO", dt.toDate("20160101"))).to.equal("http://www.nseindia.com/content/historical/DERIVATIVES/2016/JAN/fo01JAN2016bhav.csv.zip");
    expect(urls.getBhavCopyURL("VOLT", dt.toDate("20161231"))).to.equal("http://nseindia.com/archives/nsccl/volt/FOVOLT_31122016.csv");
    expect(urls.getBhavCopyURL("MA", dt.toDate("20161231"))).to.equal("http://www.nseindia.com/archives/equities/mkt/MA311216.csv");
    // expect(urls.getBhavCopyURL("sdf", dt.today())).to.throw(new Error("Un supported symbol sdf"));
  })
});

describe("Date Range functions", () => {
  it("Date range is determined correctly", () => {
    const from = dt.toDate("20170701");
    const to = dt.toDate("20170721");
    const days: Set<moment.Moment> = dt.range(from, to);
    console.log(days);
    days.forEach((d: moment.Moment) => console.log(urls.getFNOUrl(d)));
  })
});