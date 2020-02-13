import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

export async function by_id(event) {
    try {
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

            document_category_id,
            document_detail,
            document_expiry,
            document_issue_state,
            document_issue_country,
            document_number,
            nickname,
            file_id,
            id_status,
            id_notes_staff,
            id_notes_client
        } = data;

        let record_created_datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // let record_created_staff_id = staff_id;
        // data["uuid"] = uuid.v1();

        var condition1 = {id: event.pathParameters.id};
        let database_result = await mysql.query('UPDATE identification_records SET ? WHERE ?',
            [{
                client_id,
                document_category_id,
                document_detail,
                document_expiry,
                document_issue_state,
                document_issue_country,
                document_number,
                nickname,
                file_id,
                record_created_datetime,
                // record_created_staff_id,
                id_status,
                id_notes_staff,
                id_notes_client
            }, condition1]
        );
        await mysql.quit();

        return generateResponse(200, database_result);
    } catch (err) {
        return generateError(500, err);
    }
};