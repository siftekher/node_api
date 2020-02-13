import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

module.exports.in_database = async (event, context, callback) => {
  try {
    const data = JSON.parse(event.body);

    const {
      client_id,
      staff_id,
      beneficiary_id,
      // payee_id,
      payee_country_id,
      nickname,
      record_created_datetime,
      transaction_datetime,
      currency_from_id,
      currency_to_id,
      amount_from,
      amount_to,
      amount_to_usd,
      remitting_bank,
      client_rate,
      settlement_date,
      purpose_of_payment_detail,
      memo,
      status,
      payee_first_name,
      payee_middle_name,
      payee_last_name,
      payee_email,
      payee_address_line_1,
      payee_address_line_2,
      payee_postcode,
      payee_state,
      payee_suburb,
      payee_country,
      payee_different,
      beneficiary_ids

    } = data;

    let database_result = await mysql.query('INSERT INTO transfers SET ?', 
    {
      client_id,
      staff_id,
      beneficiary_id,
      // payee_id,
      payee_country_id,
      nickname,
      record_created_datetime,
      transaction_datetime,
      currency_from_id,
      currency_to_id,
      amount_from,
      amount_to,
      amount_to_usd,
      remitting_bank,
      client_rate,
      settlement_date,
      purpose_of_payment_detail,
      memo,
      status,
      payee_first_name,
      payee_middle_name,
      payee_last_name,
      payee_email,
      payee_address_line_1,
      payee_address_line_2,
      payee_postcode,
      payee_state,
      payee_suburb,
      payee_country,
      payee_different
    });

    await mysql.quit();
    let tran_crm_id = database_result.insertId;

    for(let i = 0, l = beneficiary_ids.length; i < l; i++) {
      let bene_data = new Object();
      let payout_result =  new Object();
      bene_data.transfer_id = tran_crm_id;
      bene_data.beneficiary_id = beneficiary_ids[i].beneficiary_id;
      bene_data.purpose_of_payment_detail = beneficiary_ids[i].purposeOfPayment;
      // bene_data.purpose_of_payment_other = beneficiary_ids[i].purpose_of_payment_other;
      bene_data.amount_to = beneficiary_ids[i].amount;
      bene_data.detail_1 = beneficiary_ids[i].detail_1;
      bene_data.detail_2 = beneficiary_ids[i].detail_2;
      bene_data.detail_3 = beneficiary_ids[i].detail_3;

      if(beneficiary_ids[i].document != null && beneficiary_ids[i].document.length !== 0){
        let documentData = new Object();
        documentData.file_ref = beneficiary_ids[i].document;
        documentData.document_category_id = 2;
        documentData.record_created_datetime = data.record_created_datetime;

        let document_result = await mysql.query('INSERT INTO documents SET ?', documentData );

        bene_data.document_id = document_result.insertId;
      }

      payout_result = await mysql.query('INSERT INTO transfer_payouts SET ?', bene_data );

      return generateResponse(200, payout_result);
    }

  } catch (err) {
    return generateError(500, err);
  }
};