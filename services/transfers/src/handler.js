import { generateResponse, generateError } from '../../../library/responses';
// var mysql = require("./library/database.js");

module.exports.hello = async (event) => {
  try {
    // let results = await mysql.query('SELECT * FROM transfers');
    // await mysql.quit();

    return generateResponse(200, "hello")
  } catch (err) {
    return generateError(500, err)
  }
};