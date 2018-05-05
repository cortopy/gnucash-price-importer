#!/usr/bin/env node
"use strict";

const db = require('sqlite');
const fetch = require('node-fetch');

module.exports = options => db.open(options.file)
  /*eslint-disable fp/no-nil */
  .then(() => {    
    try {
      const url = "https://www.quandl.com/api/v3/datasets/BOE/XUDLGBD"
        + `?start_date=${options.startDate}&order=asc${options.quandlApiKey ? "&api_key=" + options.quandlApiKey : ""}`;
      return fetch(url);
    } catch(err) {
      const logger = console.error(err);
      return 2;
    }
  })
  /*eslint-enable fp/no-nil */
  .then(res => res.json())
  .then(async function(body) {
    
    const prices = body.dataset.data;
    const [currencyGuid, commodityGuid] = await Promise.all([
      db.get("SELECT guid FROM commodities WHERE mnemonic = ?", options.currency),
      db.get("SELECT guid FROM commodities WHERE mnemonic = ?", options.commodity),
    ])
    .then(res => res.map(v => v.guid))
    .catch(err => console.error(err));

    const rows = prices.map(d => {
      const [date, price] = d;
      const priceDenom = +("1" + Array(price.toString().split(".")[1].length).fill(0).join(""));
      return {
        $guid: getGnuCashGUID(),
        $commodity_guid: commodityGuid,
        $currency_guid: currencyGuid,
        $date: date.replace(/-/g, "") + "230000",
        $source: "user:price-editor",
        $type: "last",
        $value_num: price * priceDenom,
        $value_denom: priceDenom
      }
    });
    return Promise.all(rows.map(async function(row) {
      const match = await db.get("SELECT * FROM prices WHERE date = ?", row.$date);
      return match 
        ? db.run(`UPDATE prices 
                  SET value_num = ?, value_denom = ?
                  WHERE date = ?`, [row.$value_num, row.$value_denom, row.$date])
        : db.run(`INSERT INTO prices VALUES (${Object.keys(row).join(", ")})`, row);
    }));
  })
  .then(() => db.close())
  .catch(err => console.error(err));


function randomIndex(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getGnuCashGUID(len = 32){
  const letters =['a','b', 'c', 'd','e','f','g','h','i', 'j', 'k', 'l', 'm', 'n','o','p','q', 'r','s','t','u','v','w','x','y','z'];
  const chars = letters.concat(Array(10).fill("").map((val, i) => i));

  return Array(len).fill("").reduce((guid, position) => {
    return guid + chars[randomIndex(0, chars.length - 1)];
  }, "");
}