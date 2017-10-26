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