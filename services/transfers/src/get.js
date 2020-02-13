import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");


module.exports.test = async (event) => {
  try {
    var sql = `SELECT * FROM test`;
    let results = await mysql.query(sql)
    await mysql.quit()
    return generateResponse(200, results)
  } catch (err) {
    return generateError(500, err)
  }
}

module.exports.list_not_deleted = async (event) => {
  try {
    const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
    const cognitoProvider = cognitoAuthenticationProvider[0];
    const cognitoId = cognitoAuthenticationProvider[2];

    let client_check_results;
    if (cognitoProvider === "accounts.google.com,accounts.google.com") {
      let condition = { aws_cognito_id_google: cognitoId };
      client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
      await mysql.quit()
    } else 
    if (cognitoProvider === "graph.facebook.com,graph.facebook.com") {
      let condition = { aws_cognito_id_facebook: cognitoId };
      client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
      await mysql.quit()
    } else {
      let condition = { aws_cognito_id: cognitoId };
      client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
      await mysql.quit()
    }
    // return generateResponse(200, client_check_results)

    // var condition = { aws_cognito_id: cognitoId };
    // let client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
    // await mysql.quit()
    const client_id = client_check_results[0].id;

    let sql = `SELECT DISTINCT transfers.id,
                               transfers.client_id,
                               transfers.memo,
                               transfers.transaction_datetime,
                               transfers.settlement_date,
                               transfers.nickname,
                               clients.nickname as "client_nickname",
                               clients.first_name,
                               clients.last_name,
                               clients.email,
                               clients.team_id,
                               transfers.beneficiary_id,
                               beneficiaries.nickname as "beneficiaries_nickname",
                               cur_b.id as currency_from_id,
                               cur_b.iso_alpha_3 as "currency_from_iso_alpha_3",
                               cur_t.id as currency_to_id,
                               cur_t.iso_alpha_3 as "currency_to_iso_alpha_3",
                               transfers.amount_from,
                               transfers.amount_to,
                               transfers.client_rate,
                               transfers.record_created_datetime,
                               admin_transfer_status.nickname as transfer_status
                FROM  transfers
                LEFT JOIN clients ON(transfers.client_id = clients.id)
                LEFT JOIN currencies as cur_b ON(transfers.currency_from_id = cur_b.id)
                LEFT JOIN currencies as cur_t ON(transfers.currency_to_id = cur_t.id)
                LEFT JOIN beneficiaries ON(transfers.beneficiary_id = beneficiaries.id)
                LEFT JOIN admin_transfer_status ON(transfers.status = admin_transfer_status.id)
                WHERE  transfers.deleted = "false" AND transfers.client_id = ?
              `;

    let results = await mysql.query(sql, [client_id]);
    await mysql.quit();

    return generateResponse(200, results)
  } catch (err) {
    return generateError(500, err)
  }
};

module.exports.by_id = async (event) => {
  const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
  const cognitoProvider = cognitoAuthenticationProvider[0];
  const cognitoId = cognitoAuthenticationProvider[2];

  let client_check_results;
  if (cognitoProvider === "accounts.google.com,accounts.google.com") {
    let condition = { aws_cognito_id_google: cognitoId };
    client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
    await mysql.quit()
  } else if (cognitoProvider === "graph.facebook.com,graph.facebook.com") {
    let condition = { aws_cognito_id_facebook: cognitoId };
    client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
    await mysql.quit()
  } else {
    let condition = { aws_cognito_id: cognitoId };
    client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
    await mysql.quit()
  }
  const client_id = client_check_results[0].id;


  try {
    const id = event.pathParameters.id;
    let condition1 = { id: id };
    let condition2 = { client_id: client_id };
    let results = await mysql.query('SELECT * FROM transfers WHERE ? AND ?', [condition1, condition2]);
    await mysql.quit();

    return generateResponse(200, results[0])
  } catch (err) {
    return generateError(500, err)
  }
};

module.exports.transfer_status = async (event) => {
  try {

    let results = await mysql.query('SELECT * FROM admin_transfer_status');
    await mysql.quit();

    return generateResponse(200, results)
  } catch (err) {
    return generateError(500, err)
  }
};

module.exports.full_by_id = async (event) => {
  try {
    const id = event.pathParameters.id;

    let results = await mysql.query(`
    SELECT transfers.*, 
           clients.first_name as client_firstname, 
           clients.last_name as client_lastname,
           clients.nickname as client_nickname,
           transaction_datetime,
           b.nickname as beneficiary,
           cu1.iso_alpha_3 as currency_from_iso_alpha_3, 
           cu2.iso_alpha_3 as currency_to_iso_alpha_3
    FROM   transfers
    LEFT JOIN clients on transfers.client_id = clients.id
    LEFT JOIN beneficiaries b on transfers.beneficiary_id = b.id
    LEFT JOIN currencies as cu1 on transfers.currency_from_id = cu1.id
    LEFT JOIN currencies as cu2 on transfers.currency_to_id = cu2.id WHERE ?`, { ["transfers.id"]: id });

    await mysql.quit();

    let newresults = await mysql.query(`
        SELECT transfer_payouts.*,  beneficiaries.nickname, admin_purpose_of_payment.description
                FROM transfer_payouts 
                LEFT JOIN beneficiaries ON transfer_payouts.beneficiary_id = beneficiaries.id 
                LEFT JOIN admin_purpose_of_payment on transfer_payouts.purpose_of_payment_detail = admin_purpose_of_payment.id
        WHERE ?`, { ["transfer_payouts.transfer_id"]: id });
    await mysql.quit();

    let retVal = {
      fullList: results[0],
      payouts: newresults
    };

    return generateResponse(200, retVal);
  } catch (err) {
    return generateError(500, err)
  }
};


module.exports.get_purpose = async (event) => {
  try {
    const division_id = event.pathParameters.division_id;

    // let results = await mysql.query(`
    // SELECT * FROM admin_purpose_of_payment
    // WHERE ?`, { ["division_id"]: division_id });

    let results = await mysql.query(`
    SELECT * FROM admin_purpose_of_payment`);

    await mysql.quit();

    return generateResponse(200, results)
  } catch (err) {
    return generateError(500, err)
  }
};
