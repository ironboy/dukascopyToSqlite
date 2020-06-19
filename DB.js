const sqlite3 = require('sqlite3');

// wrapper for async/await
module.exports = class DB {

  constructor(path) {
    this.db = new sqlite3.Database(path);
  }

  run(query, params) {
    return new Promise(res => {
      this.db.run(query, params, (err, result) => {
        if (err) { throw (new Error(err)); }
        res(result);
      })
    });
  }

}