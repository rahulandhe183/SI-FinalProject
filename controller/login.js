const express = require('express')
const Router = express.Router();
const Db = require("../db/db")
var md5 = require('md5')
const jwt = require("jsonwebtoken");


// Route: /auth/login
class Login {

    constructor() {
        this.response = {
            message: "ok"
        }
        this.status = 200
        // iniitalize the databae
        this.db = new Db().getDb()

        // iniitalize the router
        Router.post('/', this.Post);
    }

    // Post method for the login route
    Post = (req, res) => {
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

            // check if the user exist
            var self = this;
            self.db.get(`select *  from user where username = ? AND password = ?`, [req.body.username, md5(req.body.password)], (err, row) => {
                if (err) {
                    self.status = 400
                    self.response.message = err.message
                    self.writeResponse(res)
                }
                if (row.count === 0) {
                    self.response.message = "user not found"
                    self.status = 400
                    self.writeResponse(res)
                } else {
                    self.response.message = "you are logged in"
                    const token = jwt.sign({ id: row.id, username: row.username }, 'secretKey');
                    res.cookie("access_token", token, {}).status(200).json({ message: "Logged in successfully" });
                }
            })

        } catch (err) {
            // error handling
            this.response.message = err.message
            this.status = 500
            console.error(err.message)
            this.writeResponse(res)
        }
    }


    // write response
    writeResponse = (res) => {
        res.status(this.status).json(this.response);
    }

}

new Login();

module.exports = Router;