const fs = require('fs');
const path = require('path');
const DB = require('./DB');

// path to database
const dbPath = path.join(__dirname, 'databases', 'stockPrices..db');
// path to file folder
const dirPath = path.join(__dirname, 'dukascopy-data');

// Create db and import dukascopy .csv-files
// (install es6-string-html in VSC for SQL highliting)
(async () => {
  // remove database file it exists
  fs.existsSync(dbPath) && fs.unlinkSync(dbPath);

  // create database (file + our two tables)
  let db = new DB(dbPath);
  let query = /*sql*/`CREATE TABLE askPrices(
    symbol TEXT     NOT NULL,
    gmtTime DATETIME NOT NULL,
    open    DOUBLE   NOT NULL,
    high    DOUBLE   NOT NULL,
    low     DOUBLE   NOT NULL,
    close   DOUBLE   NOT NULL,
    volume  DOUBLE   NOT NULL,
    PRIMARY KEY(
      symbol,
      gmtTime
    )
  );`
  await db.run(query);
  query = query.split('askPrices').join('bidPrices');
  await db.run(query);

  // import data from files
  let files = fs.readdirSync(dirPath)
    .filter(x => x.substr(-4) === '.csv');
  for (let file of files) {
    console.log('Importing', file)
    let data = fs.readFileSync(path.join(dirPath, file), 'utf-8');
    let stockName = '"' + file.split('.')[0] + '"';
    let askOrBid = file.includes('_ASK_') ? 'ask' : 'bid';
    let fixedData = [];
    data = data.split('\r').join(''); // remove carriage returns
    for (let line of data.split('\n').slice(1)) {
      // fix us date-format to iso and remove ms
      let dt = line.split(/[\.\s]/, 4);
      dt = '"' + dt[2] + '-' + dt[1] + '-' + dt[0] + ' ' + dt[3] + '"';
      fixedData.push('(' + stockName + ',' + dt + ','
        + line.split(',').slice(1).join(',') + ')');
    }
    await db.run(`INSERT INTO ${askOrBid}prices VALUES\n`
      + fixedData.join(',\n'));
    console.log('Done');
  }
})();