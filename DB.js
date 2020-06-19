const sqlite3 = require('sqlite3');

// wrapper for async/await
module.exports = class DB {

  constructor(path) {
    this.db = new sqlite3.Database(path);
  }

  runner(method, query, params) {
    return new Promise(res => {
      this.db[method](query, params, (err, result) => {
        if (err) { throw (new Error(err)); }
        res(result);
      })
    });
  }

  async run(...args) {
    return await this.runner('run', ...args);
  }

  async all(...args) {
    return await this.all('run', ...args);
  }

  async each(...args) {
    return await this.each('run', ...args);
  }

}