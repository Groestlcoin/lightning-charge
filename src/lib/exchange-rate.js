import big from 'big.js'
import request from 'superagent'
import memoize from './memoize'

require('superagent-proxy')(request)

const enc = encodeURIComponent

// if none is set, will fallback to using HTTPS_PROXY or ALL_PROXY.
// see https://github.com/Rob--W/proxy-from-env
const RATE_PROXY = process.env.RATE_PROXY

const FIXED_RATES    = { GRS: 1 }
    , GRS_MSAT_RATIO = big('100000000000')
    , CRYPTOCOMPARE_CURR  = [ 'USD', 'EUR' ]
    , CACHE_TTL      = +process.env.RATE_CACHE_TTL || 30000

// Fetch USD/EUR rates from Cryptocompare, use CoinGecko for other currencies
const getRate = memoize(CACHE_TTL, currency =>
  CRYPTOCOMPARE_CURR.includes(currency.toUpperCase())
  ? getRateCryptocompare(currency)
  : getRateCoingecko(currency)
)

const getRateCryptocompare = currency =>
  request.get(`https://min-api.cryptocompare.com/data/price?fsym=GRS&tsyms=${enc(currency)}`)
    .proxy(RATE_PROXY)
    .then(res => res.body[currency.toLowerCase()] || Promise.reject(`Unknown currency: ${currency}`))

const getRateCoingecko = currency =>
  request.get(`https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=${enc(currency)}`)
    .proxy(RATE_PROXY)
    .then(res => res.body.groestlcoin[currency.toLowerCase()] || Promise.reject(`Unknown currency: ${currency}`))

// Convert `amount` units of `currency` to msatoshis
const toMsat = async (currency, amount) =>
  big(amount)
    .div(FIXED_RATES[currency] || await getRate(currency))
    .mul(GRS_MSAT_RATIO)
    .round(0, 3) // round up to nearest msatoshi
    .toFixed(0)

module.exports = { getRate, toMsat }
