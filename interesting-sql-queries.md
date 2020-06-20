Find those that are only in askPrices and not in bidPrices and vice versa...
(This should not happen - bad data from Dukascopy?)

SELECT * FROM (SELECT "ask" as type,* FROM askPrices UNION ALL SELECT "bid" AS type,* FROM bidPrices) GROUP BY symbol, gmtTime HAVING COUNT(*)=1

Find gaps (should be there but aren't)
SELECT DATETIME(gmtTime,"+1 minute") FROM bidPrices WHERE strftime("%M",gmtTime) <> "59" AND DATETIME(gmtTime,"+1 minute") NOT IN (SELECT gmtTime FROM bidPrices)
and (same but from askPrices):
SELECT DATETIME(gmtTime,"+1 minute") FROM askPrices WHERE strftime("%M",gmtTime) <> "59" AND DATETIME(gmtTime,"+1 minute") NOT IN (SELECT gmtTime FROM askPrices)

Why gaps? Technical malfunction in logging or the stock price did not move at all?
Since few gaps (41 amongst 141370 for Apple) we should be able to fill them with previous...

When all gaps filled we could join askPrices and bidPrices into ONE table...
