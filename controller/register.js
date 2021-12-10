const express = require('express')
const Router = express.Router();
const Db = require("../db/db")

var md5 = require('md5')

// Route: /auth/Register
class Register {
    constructor() {
        this.response = {
            message: "ok"
        }
        // init database
        this.db = new Db().getDb()
        this.status = 200

        // iniitalize the router
        Router.post('/', this.Post);
    }


    // Post Method
    Post = async (req, res) => {
        this.status = 201
        try {

            // check the required fields
            if (!req.body.username) {
                this.status = 400
                this.response.message = "username is required"
                this.writeResponse(res)
            }
            if (!req.body.password) {
                this.status = 400
                this.response.message = "password is required"
                this.writeResponse(res)
            }

            var self = this;
            // check if the user exist
            self.db.get(`select COUNT(*) as count from user where username = ?`, [req.body.username], (err, row) => {
                if (row.count === 0) {
                    // create the user
                    self.db.run('INSERT INTO user (username, password) VALUES (?,?)', [req.body.username, md5(req.body.password)], function (err, result) {
                        if (err) {
                            // self.status = 400
                            // self.response.message = err.message
                            res.status(400).json(err.message);
                        } else {
                            res.status(this.status).json(this.response);
                        }
                    });
                } else {
                    res.status(400).json("username already exists");
                }
            });

        } catch (err) {
            this.response.message = err.message
            this.status = 500
        }
    }
    writeResponse = (res) => {
        res.status(this.status).json(this.response);
    }
}
new Register();

module.exports = Router;