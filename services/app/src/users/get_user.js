import AWS from "aws-sdk";
AWS.config.update({ region: "ap-southeast-2" });
import { generateResponse, generateError } from '../../../../library/responses';
var mysql = require("../../../../library/database");


module.exports.test = async (event) => {
  // console.log(event);
  try {
    var sql = `SELECT * FROM clients`;

    let results = await mysql.query(sql)
    await mysql.quit()

    return generateResponse(200, results)
  } catch (err) {
    return generateError(500, err)
  }
}

module.exports.test_auth = async (event) => {
  const client_id = event.pathParameters.client_id;

  try {
    var sql = `SELECT * FROM clients WHERE ?`;

    let results = await mysql.query(sql, {id: client_id});
    await mysql.quit()

    return generateResponse(200, results)
  } catch (err) {
    return generateError(500, err)
  }
}


module.exports.by_id = async (event) => {
  try {
    const user_id = event.pathParameters.user_id;

    let results = await mysql.query(`SELECT * FROM clients 
                                          LEFT JOIN teams ON (clients.team_id = teams.id)
                                          LEFT JOIN divisions ON(teams.division_id = divisions.id)
                                          LEFT JOIN entities ON(divisions.entity_id = entities.id)
                                          WHERE ?`, {aws_cognito_id: user_id});
    // let results = await mysql.query('SELECT * FROM staff_members WHERE aws_cognito_id="921e321d-5cd8-4baa-99c8-1b5218e881bc"');
    await mysql.quit()

    return generateResponse(200, results[0])
  } catch (err) {
    return generateError(500, err)
  }
}


module.exports.by_email = async (event) => {
  try {

    const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
    const cognitoProvider = cognitoAuthenticationProvider[0];
    const cognitoId = cognitoAuthenticationProvider[2];

    // const data = JSON.parse(event.body);
    const email = event.pathParameters.email;

    let results = await mysql.query('SELECT * FROM clients WHERE ?', {email: email});
    // let results = await mysql.query('SELECT * FROM staff_members WHERE aws_cognito_id="921e321d-5cd8-4baa-99c8-1b5218e881bc"');
    await mysql.quit();


    if (cognitoProvider === "accounts.google.com,accounts.google.com") {
      if (results[0]) {
        if (results[0].aws_cognito_id_google != cognitoId) {
          let data = {aws_cognito_id_google: cognitoId};
          let condition = {email: event.pathParameters.email};
          let update_result = await mysql.query("UPDATE clients SET ? WHERE ?", [data, condition])
          await mysql.quit()
        }
      }
    } else 
    if (cognitoProvider === "graph.facebook.com,graph.facebook.com") {
      if (results[0]) {
        if (results[0].aws_cognito_id_facebook != cognitoId) {
          let data = {aws_cognito_id_facebook: cognitoId};
          let condition = {email: event.pathParameters.email};
          let update_result = await mysql.query("UPDATE clients SET ? WHERE ?", [data, condition])
          await mysql.quit()
        }
      }
    }

    return generateResponse(200, results[0])
  } catch (err) {
    return generateError(500, err)
  }
}

