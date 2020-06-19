const path = require('path');
const express = require('express');
const DB = require('./DB');
const { start } = require('repl');

// connect to DB
const dbPath = path.join(__dirname, 'databases', 'stockPrices..db');
const db = new DB(dbPath);

// start server
const app = express();
app.listen(3000, () => console.log('Listening on port 3000'));

app.get('/api/:symbol/:askOrBid/:granularity/:start/:end', async (req, res) => {
  let p = req.params;
  let g = p.granularity.split('-');
  let granularity = g[0];
  let detailed = g[1] === 'detailed';
  let result = await db.all(/*sql*/`
    SELECT gmtTime AS time, open, high, low, close
    FROM ${p.askOrBid}Prices WHERE
    symbol = $symbol AND
    time >= $start AND
    time <= $end
  `, {
    $start: p.start.split('_').join(' ') + ':00',
    $end: p.end.split('_').join(' ') + ':00',
    $symbol: p.symbol
  });
  result = granularity === 'seconds' ? interpolateToSeconds(result) : result;
  if (granularity !== 'seconds') {
    result = detailed ? result : simplify(result);
  }
  res.json(result);
});

function simplify(r) {
  return r.map(x => ({
    time: x.time,
    price: Math.round((x.open + x.close) / 0.002) / 1000
  }));
}

function interpolateToSeconds(r) {
  let newR = [];
  for (let x of r) {
    let time = x.time.split(':').slice(0, -1).join(':') + ':';
    let at45 = x.close < x.open ? x.low : x.high;
    let at15 = x.close > x.open ? x.low : x.high;
    let seconds = [];
    for (let i = 0; i <= 15; i++) {
      seconds.push(Math.round((x.open + ((at15 - x.open) / 15) * i) / 0.001) / 1000);
    }
    for (let i = 16; i <= 45; i++) {
      seconds.push(Math.round((at15 + ((at45 - at15) / 31) * (i - 15)) / 0.001) / 1000);
    }
    for (let i = 46; i <= 59; i++) {
      seconds.push(Math.round((at45 + ((x.close - at45) / 13) * (i - 46)) / 0.001) / 1000);
    }
    newR = [...newR, ...seconds.map((x, i) => ({ time: time + (i + '').padStart(2, '0'), price: x }))];
  }
  return newR;
}