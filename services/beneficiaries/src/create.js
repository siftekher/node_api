import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

module.exports.in_database = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const nickname = data.ben_legal_name;
        const ben_legal_name = data.ben_legal_name;
        const ben_address_line_1 = data.ben_address_line_1;
        const ben_address_line_2 = data.ben_address_line_2;
        const ben_address_suburb = data.ben_address_suburb;
        const ben_address_state = data.ben_address_state;
        const ben_address_postcode = data.ben_address_postcode;
        const ben_address_country = data.ben_address_country;

        const bank_legal_name = data.bank_legal_name;
        const bank_address_line_1 = data.bank_address_line_1;
        const bank_address_line_2 = data.bank_address_line_2;
        const bank_address_suburb = data.bank_address_suburb;
        const bank_address_state = data.bank_address_state;
        const bank_address_postcode = data.bank_address_postcode;
        const bank_address_country = data.bank_address_country;
        const account_currency = data.account_currency;
        const swift_code = data.swift_code;
        const account_number = data.account_number;
        const aba_routing_number = data.aba_routing_number;
        const bsb_code = data.bsb_code;
        const sort_code = data.sort_code;

        const ben_telephone_work = data.ben_telephone_work;
        const ben_telephone_afterhours = data.ben_telephone_afterhours;
        const ben_telephone_mobile = data.ben_telephone_mobile;
        const ben_email_main = data.ben_email_main;
        const ben_email_secondary = data.ben_email_secondary;

        const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        const cognitoProvider = cognitoAuthenticationProvider[0];
        const cognitoId = cognitoAuthenticationProvider[2];

        var condition = {"clients.aws_cognito_id": cognitoId};
        if (cognitoProvider === "accounts.google.com,accounts.google.com") {
            condition = {"clients.aws_cognito_id_google": cognitoId};
        } else if (cognitoProvider === "graph.facebook.com,graph.facebook.com") {
            var condition = {"clients.aws_cognito_id_facebook": cognitoId};
        } else {
            condition = {"clients.aws_cognito_id": cognitoId};
        }
        // var condition = {aws_cognito_id: cognitoId};
        let results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
        await mysql.quit()

        const client_id = results[0].id;

        let database_result = await mysql.query('INSERT INTO beneficiaries SET ?', {
            nickname: nickname,
            ben_legal_name: ben_legal_name,
            ben_address_line_1: ben_address_line_1,
            ben_address_line_2: ben_address_line_2,
            ben_address_suburb: ben_address_suburb,
            ben_address_state: ben_address_state,
            ben_address_postcode: ben_address_postcode,
            ben_address_country: ben_address_country,

            bank_legal_name: bank_legal_name,
            bank_address_line_1: bank_address_line_1,
            bank_address_line_2: bank_address_line_2,
            bank_address_suburb: bank_address_suburb,
            bank_address_state: bank_address_state,
            bank_address_postcode: bank_address_postcode,
            bank_address_country: bank_address_country,
            account_currency: account_currency,
            swift_code: swift_code,
            account_number: account_number,
            aba_routing_number: aba_routing_number,
            bsb_code: bsb_code,
            sort_code: sort_code,
            client_id: client_id,

            ben_telephone_work: ben_telephone_work,
            ben_telephone_afterhours: ben_telephone_afterhours,
            ben_telephone_mobile: ben_telephone_mobile,
            ben_email_main: ben_email_main,
            ben_email_secondary: ben_email_secondary

        });
        await mysql.quit()

        return generateResponse(200, database_result)
    } catch (err) {
        return generateError(500, err)
    }


};