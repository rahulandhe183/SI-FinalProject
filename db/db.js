var sqlite3 = require('sqlite3').verbose()
// name of database
const DBSOURCE = "db.sqlite"

// Database class user to connect to Sqlite3 database
class Db {
    constructor() {
        this.db = new sqlite3.Database(DBSOURCE, (err) => {
            if (err) {
                // Cannot open database
                console.error(err.message)
                throw err
            } else {
                this.db.run(`CREATE TABLE user (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username text UNIQUE, 
                    password text, 
                    CONSTRAINT usename_unique UNIQUE (username)
                    )`,
                    (err) => {
                    });
            }
        });
    }
    // return the database
    getDb = () => {
        return this.db
    }
}

module.exports = Db;