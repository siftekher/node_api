
// Implement serverless-mysql
const mysql = require('serverless-mysql')() 
mysql.config({
    host: "",
    user: "",
    password: "",
    database: "",
  })


module.exports = mysql;

