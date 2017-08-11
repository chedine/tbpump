interface stream {
    (val?: any): any,
    end(b: boolean)
}

interface Instrument {
    open: number,
    expiry: number,
    trade_date: number,
    name: String,
    type: number,
    close: number,
    volume?: number,
    high: number,
    strike: number,
    underlying: String,
    low: number,
    oi?: number
}

type OptionsPair = {
    ce: Instrument,
    pe: Instrument
}

type OptionsRange = {
    lowerStrike: number
    upperStrike: number
}

interface OptionsChain{
    index: Instrument,
    vix?: Instrument,
    opts?: any,
    items: [OptionsPair],
    bounds: OptionsRange,
    trade_date: number,
    expiries: [number],
    selectedExpiry: number
}

interface BSHolderPort {
    new (o: any): any
}
interface Greeks {
    price: number
    delta: number
    gamma: number
    rho: number
    vega: number
    theta: number
    strike?: number
    omega: number
    [key:string]: number
}
interface OptionGreeks{
    ce: Greeks
    pe: Greeks
}