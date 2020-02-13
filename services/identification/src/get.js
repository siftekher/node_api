import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");


//const fields_for_list = `id, aws_cognito_id, first_name, last_name, email, telephone_mobile, residential_street_suburb, residential_street_country`;
const fields_for_list = `beneficiaries.id, beneficiaries.nickname, beneficiaries.client_id, clients.first_name, clients.last_name, beneficiaries.entity_id, entities.nickname as entity_name,
 beneficiaries.team_id, teams.nickname as team_name, beneficiaries.division_id, d.nickname as division_name`;


module.exports.categories = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM admin_identification_categories');
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.identification_status = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM admin_identification_status');
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

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
        } else {
            let condition = { aws_cognito_id: cognitoId };
            client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
            await mysql.quit()
        }
        let client_id = client_check_results[0].id;

        let sql = `SELECT
          identification_records.*,
          clients.nickname as "client_nickname",
          admin_identification_categories.nickname as "document_category",
          admin_identification_status.nickname as "status_nickname"
        FROM
          identification_records LEFT JOIN admin_identification_status ON identification_records.id_status = admin_identification_status.id ,
          clients,
          admin_identification_categories
        WHERE
          identification_records.client_id = clients.id
        AND
          identification_records.document_category_id = admin_identification_categories.id
        AND
            clients.id = ${client_id}
      `

        let results = await mysql.query(sql);
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.list_deleted = async (event) => {
    try {
        let results = await mysql.query(`SELECT ${fields_for_list} FROM clients WHERE deleted = "true"`);

        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.by_aws_id = async (event) => {
    try {
        const aws_cognito_id = event.pathParameters.aws_cognito_id;

        let results = await mysql.query('SELECT * FROM clients WHERE ?', { aws_cognito_id: aws_cognito_id });
        await mysql.quit();

        return generateResponse(200, results[0])
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.by_id = async (event) => {
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

        const id = event.pathParameters.id;

        let results = await mysql.query(`
      SELECT 
        identification_records.*, 
        documents.file_ref as file_id,
        clients.nickname as client,
        admin_identification_categories.nickname as document_category,
        staff_members.first_name as record_created_staff_first_name,
        staff_members.last_name as record_created_staff_last_name
      FROM 
        identification_records LEFT JOIN clients ON (identification_records.client_id = clients.id)
        LEFT JOIN admin_identification_categories ON(identification_records.document_category_id = admin_identification_categories.id)
        LEFT JOIN staff_members ON (identification_records.record_created_staff_id = staff_members.id)
        LEFT JOIN documents ON (identification_records.document_id = documents.id)
      WHERE 
 
        identification_records.id = ?`, id);
        await mysql.quit();

        if (client_id !== results[0].client_id) {
            return generateError(403, "Forbidden")
        }

        return generateResponse(200, results[0]);
    } catch (err) {
        return generateError(500, err)
    }
};
