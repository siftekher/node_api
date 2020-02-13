import { generateResponse, generateError } from '../../../../library/responses';
var mysql = require("../../../../library/database.js");


export async function main(event, context) {


  try {
    const data = JSON.parse(event.body);
    const email = data.email;
    const aws_cognito_id = data.aws_cognito_id;
    const first_name = data.first_name;
    const last_name = data.last_name;
    const record_created_datetime = data.record_created_datetime;
    const record_modified_datetime = data.record_modified_datetime;
    // const portal_account_created = data.portal_account_created;
    // const portal_email_confirmed = data.portal_email_confirmed;
    const referral_code = data.referral_code;

    let data_insert = {
      aws_cognito_id: aws_cognito_id,
      first_name: first_name,
      last_name: last_name,
      email: email,
      record_created_datetime: record_created_datetime,
      record_modified_datetime: record_modified_datetime,
      portal_account_created: 1,
      // portal_email_confirmed: 0,
      default_rate_entity: 0.02,
      account_status: 1,
      language_id: 1,
      nickname: `${last_name}, ${first_name}`
    }
    switch (referral_code) {
      case "gostudy":
        {
          data_insert["team_id"] = 2
          data_insert["responsible_staff_member"] = 1
          data_insert["record_modified_staff"] = 1
          break;
        }
      default:
        {
          data_insert["team_id"] = 1
          data_insert["responsible_staff_member"] = 1
          data_insert["record_modified_staff"] = 1
          break;
        }
    }

    let database_result = await mysql.query('INSERT INTO clients SET ?', data_insert);
    await mysql.quit()

    return generateResponse(200, database_result)
  } catch (err) {
    return generateError(500, err)
  }


  // const data = JSON.parse(event.body);
  // try {
  //   var condition = {aws_cognito_id: event.pathParameters.user_id};
  //   let results = await mysql.query("UPDATE clients SET ? WHERE ?", [data, condition])
  //   await mysql.quit()
  // return generateResponse(200, results)
  // } catch (err) {
  //   return generateError(500, err)
  // }
}

