# GnuCash Historic Prices Importer

Script to import historic currency prices into gnucash using sqlite3 backend. Please note this is for my personal use and hasn't been widely tested. I wouldn't run this script without backing up data first.

## A few things to consider

- Gnucash doesn't have a relational model per se. Prices are set with GUIDs which don't appear to follow any official standard for UUIDs. The script creates identificators using alphanumeric characters. This is the logic which gnucash appears to implement.
- All prices are inserted with the time of 23:00:00 appended to the date of the historic price. This will be the value which gnucash uses on the following day. This appears to be the default behaviour in gnucash.
- The script is non-destructive, so if there are data already set for the range specified with `startDate`, an update will take place.
- I've created this to work with currency prices. It uses the free tier of [quandl](https://blog.quandl.com/api-for-currency-data) for currencies, but the script is easily customisable for other quotes.

## Example

```
chmod u+x gnucash-price-importer
gnucash-price-importer --file="/my/gnucash/sqlite3.file" --quandlApiKey="mykey" --currency=GBP --commodity=USD
```

## Options

- _file_*: The path to your gnucash file
- _quandlApiKey_: This is optional as you may still use the API in anonymous mode if you don't run script too many times a day.
- _currency_*: The main currency your accounts are in.
- _commodity_*: The currency you'd like to import.
