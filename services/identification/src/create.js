
import uuid from "uuid";

import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");


module.exports.test = async (event, context, callback) => {
    try {
        // const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        // const aws_cognito_id = cognitoAuthenticationProvider[2];
        // const condition = {aws_cognito_id: aws_cognito_id}
        const condition = {id: 20}
        let results = await mysql.query('SELECT * FROM staff_members WHERE ?', condition);
        await mysql.quit()
        const aws_cognito_id = results[0].aws_cognito_id;

        const data = JSON.parse(event.body);

        data["record_created_datetime"] = new Date().toISOString().slice(0, 19).replace('T', ' ');
        data["record_modified_datetime"] = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // data["record_modified_staff"] = aws_cognito_id;
        data["aws_cognito_id"] = aws_cognito_id;
        data["uuid"] = uuid.v1();

        return generateResponse(200, data);

    } catch (err) {
        return generateError(null, err);
    }


};


module.exports.in_database = async (event, context, callback) => {
    try {
        // const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        // const cognitoId = cognitoAuthenticationProvider[2];
        //
        // var condition = { aws_cognito_id: cognitoId };
        // let client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
        // await mysql.quit()
        // const client_id = client_check_results[0].id;

        // const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        // const aws_cognito_id = cognitoAuthenticationProvider[2];
        // const condition = {aws_cognito_id: aws_cognito_id}
        // let staff_results = await mysql.query('SELECT * FROM staff_members WHERE ?', condition);
        // await mysql.quit()
        // const staff_id = staff_results[0].id;

        const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        const cognitoProvider = cognitoAuthenticationProvider[0];
        const cognitoId = cognitoAuthenticationProvider[2];

        let client_check_results;
        if (cognitoProvider === "accounts.google.com,accounts.google.com") {
            let condition = { aws_cognito_id_google: cognitoId };
            client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
            await mysql.quit()
        } else {
            let condition = { aws_cognito_id: cognitoId };
            client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
            await mysql.quit()
        }
        let client_id = client_check_results[0].id;


        const data = JSON.parse(event.body);
        const {
            // client_id,
            document_category_id,
            document_detail,
            document_expiry,
            document_issue_state,
            document_issue_country,
            document_number,
            nickname,
            file,
        } = data;

        let record_created_datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const record_created_staff_id = 1;
        const id_status = 2;
        // data["uuid"] = uuid.v1();

        let document_id = "";

        if(file != null && file.length !== 0){
            let documentData = new Object();
            documentData.file_ref = file;
            documentData.document_category_id = 1;
            documentData.record_created_datetime = record_created_datetime;

            let document_result = await mysql.query('INSERT INTO documents SET ?', documentData );

            document_id = document_result.insertId;
        }

        let database_result = await mysql.query('INSERT INTO identification_records SET ?',
            {
                client_id,
                document_category_id,
                document_detail,
                document_expiry,
                document_issue_state,
                document_issue_country,
                document_number,
                nickname,
                document_id,
                record_created_datetime,
                record_created_staff_id,
                id_status
            });
        await mysql.quit();

        return generateResponse(200, data);

    } catch (err) {
        return generateError(500, err);
    }

};

