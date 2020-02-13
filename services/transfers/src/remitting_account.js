import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

export async function get_details (event, context) {
  const data = JSON.parse(event.body);
  try {
    var condition1 = {
      country_id: data.country_id
    }
    var condition2 = {
      currency_id: data.currency_id
    }
    let results = await mysql.query('SELECT * FROM entity_bank_account_remitting_cross WHERE ? AND ?', [condition1, condition2]);
    await mysql.quit();

    return generateResponse(200, results);
  } catch (err) {
    return generateError(500, err);
  }
};