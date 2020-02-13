import AWS from "aws-sdk";
AWS.config.update({ region: "ap-southeast-2" });

var mysql = require("../../library/database.js");

import { generateResponse, generateError } from '../../library/responses';


export async function main(event, context) {
  const data = JSON.parse(event.body);
  try {
    var condition = {aws_cognito_id: event.pathParameters.user_id};
    let results = await mysql.query("UPDATE clients SET ? WHERE ?", [data, condition])
    await mysql.quit()
  return generateResponse(200, results)
  } catch (err) {
    return generateError(500, err)
  }
}
