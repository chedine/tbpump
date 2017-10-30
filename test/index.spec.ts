/// <reference path="../node_modules/@types/mocha/index.d.ts" />
import { expect } from "chai";
import * as bhav from "../src/bhavcopy";
import * as R from "ramda"
import * as moment from "moment";

describe("Bhav Copy Dates are built correctly", () => {
  it("MA bhav copy date is verified", () => {
    const dateStrBuilder = bhav.buildBhavCopyDateTypes("MA");
    const actuals = dateStrBuilder(bhav.isoDateToMoment("20170101"));
    expect(actuals).to.equal("010117");

    expect(dateStrBuilder(bhav.isoDateToMoment("20171231"))).to.equal("311217");

    expect(dateStrBuilder(bhav.isoDateToMoment("20170228"))).to.equal("280217");
  });
  it("FNO bhav copy date is verified", () => {
    const dateStrBuilder = bhav.buildBhavCopyDateTypes("FNO");
    const actuals = dateStrBuilder(bhav.isoDateToMoment("20170101"));
    expect(actuals).to.equal("01Jan2017");

    expect(dateStrBuilder(bhav.isoDateToMoment("20171231"))).to.equal("31Dec2017");

    expect(dateStrBuilder(bhav.isoDateToMoment("20170228"))).to.equal("28Feb2017");
  });
  it("VOLT bhav copy date is verified", () => {
    const dateStrBuilder = bhav.buildBhavCopyDateTypes("VOLT");
    const actuals = dateStrBuilder(bhav.isoDateToMoment("20170101"));
    expect(actuals).to.equal("01012017");

    expect(dateStrBuilder(bhav.isoDateToMoment("20171231"))).to.equal("31122017");

    expect(dateStrBuilder(bhav.isoDateToMoment("20170228"))).to.equal("28022017");
  });
});

describe("Bhav Copy URLs are built correctly", () => {
  const urlify = (bhavType: string, dateStr: String) => {
    const urlStrategy = bhav.buildBhavCopyUrl(bhavType);
    const dateStrBuilder = bhav.buildBhavCopyDateTypes(bhavType);
    return urlStrategy(dateStrBuilder(bhav.isoDateToMoment(dateStr)));

  }
  it("MA bhav copy URL is verified", () => {
    expect(urlify("MA", "20170101")).to.equal("http://www.nseindia.com/archives/equities/mkt/MA010117.csv");
    expect(urlify("MA", "20171231")).to.equal("http://www.nseindia.com/archives/equities/mkt/MA311217.csv");
    expect(urlify("MA", "20170228")).to.equal("http://www.nseindia.com/archives/equities/mkt/MA280217.csv");
  });

  it("FNO bhav copy URL is verified", () => {
    expect(urlify("FNO", "20170101")).to.equal("http://www.nseindia.com/content/historical/DERIVATIVES/2017/JAN/fo01JAN2017bhav.csv.zip");
    expect(urlify("FNO", "20171231")).to.equal("http://www.nseindia.com/content/historical/DERIVATIVES/2017/DEC/fo31DEC2017bhav.csv.zip");
    expect(urlify("FNO", "20170228")).to.equal("http://www.nseindia.com/content/historical/DERIVATIVES/2017/FEB/fo28FEB2017bhav.csv.zip");
  });

  it("VOLT bhav copy URL is verified", () => {
    expect(urlify("VOLT", "20170101")).to.equal("http://nseindia.com/archives/nsccl/volt/FOVOLT_01012017.csv");
    expect(urlify("VOLT", "20171231")).to.equal("http://nseindia.com/archives/nsccl/volt/FOVOLT_31122017.csv");
    expect(urlify("VOLT", "20170228")).to.equal("http://nseindia.com/archives/nsccl/volt/FOVOLT_28022017.csv");
  });

});

describe("Date Ranges are built correctly", () => {
  it("builds a date range when start and end is specified", () => {
    const dateRange = bhav.getDateRange(bhav.isoDateToMoment("20170101"), bhav.isoDateToMoment("20170110"));
    expect(dateRange).to.not.null;
    expect(dateRange.length).to.equal(9);
    expect(bhav.momentToISODateStr(dateRange[0])).to.equal("20170101");
    expect(bhav.momentToISODateStr(dateRange[dateRange.length - 1])).to.equal("20170109");
  });

  it("builds a date range when start and end are same", () => {
    const dateRange = bhav.getDateRange(bhav.isoDateToMoment("20170101"), bhav.isoDateToMoment("20170101"));
    expect(dateRange).to.not.null;
    expect(dateRange.length).to.equal(0);
  });
});