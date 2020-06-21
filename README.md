# Example data
Right now we have two files with ask and bid prices for teh Apple stock traded on NASDAQ, minute by minute from 2019-01-01 to 2020-06-12.

# The data explained
For each minute we have the opening price (that minute att 00 seconds) and closing price (that minute at 59 seconds) + the highest and lowest prices. We could make an algorithm that interpolate in between prices per second if necessary - either as just a slide from opening to closing or trying to hit the highest and lowest prices in between... But do not use any random generators - it should always return the same thing at a certain time for those interpolated in-between values...

# Importing dukascopy-data
The data was optained from Dukascopy
1. Goto https://www.dukascopy.com/trading-tools/widgets/quotes/historical_data_feed
   (Register if you do not have an account, you can connect it to your FB account if you want)
2. Choose stock/instrument
3. Choose time period and candle stick (most data available as minutes as most fine-grained, setting to tick or seconds will then result in empty files).
4. Choose offer side ASK or BID price.
5. Choose filter flats ALL (no data for times when the exchange is not open)
6. Choose GMT
7. Click Download.
8. The data is prepared
9. Download the csv file and put in the *dukascopy-data* folder
10. Run *node import-dukascopy-data*
11. A new SQLite3 database named stockprices is created in the *database* folder.

* Right now we only create the tables askPrices and bidPrices. We might have to create a third table in the datase with meta info as to on which stock exchange the stock is traded and in what currency... But this could be done manually.

* Actual orders for a user should be in a database separately created for that specific user.


# Start of simple server that will get you price-data
**node get-prices.js**
/api/:symbol/:askOrBid/:granularity/:start/:end
Try:

http://localhost:3000/api/AAPL/ask/seconds/2019-01-01_14:30/2019-01-02_14:32

http://localhost:3000/api/AAPL/ask/minutes/2019-01-01_14:30/2019-01-02_14:32

http://localhost:3000/api/AAPL/ask/minutes-detailed/2019-01-01_14:30/2019-01-02_14:32

Interpolation to seconds works (and there should not be a seconds-detailed).

Added filling holes/gaps to import (do not now why the are holes... Low trade? Trade temporarily stopped because of news flash etc?)

Interpolation/rounding to bigger granularites like hours, hours-detailed, days, days-detailed not implemented yet.

