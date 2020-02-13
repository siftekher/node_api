import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

module.exports.in_database = async (event, context, callback) => {
    try {
        const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        const aws_cognito_id = cognitoAuthenticationProvider[2];
        const condition = {aws_cognito_id: aws_cognito_id}
        let results = await mysql.query('SELECT id FROM staff_members WHERE ?', condition);
        await mysql.quit()
        const staff_id = results[0].id;

        const data = JSON.parse(event.body);

        data["record_created_datetime"] = new Date().toISOString().slice(0, 19).replace('T', ' ');
        data["record_modified_datetime"] = new Date().toISOString().slice(0, 19).replace('T', ' ');
        data["record_modified_staff"] = staff_id;
        data["default_rate_entity"] = 0.02;

        let database_result = await mysql.query('INSERT INTO clients SET ?', data);
        await mysql.quit();

        let last_insert_id = database_result.insertId;

        let todo_result = await mysql.query('INSERT INTO todo_client SET ?', {
            client_id: last_insert_id,
            transfer_id: "",
            description: "Upload identifiation document 1",
            datetime_created: new Date()
        });
        await mysql.quit();

        let todo_result1 = await mysql.query('INSERT INTO todo_client SET ?', {
            client_id: last_insert_id,
            transfer_id: "",
            description: "Upload identifiation document 2",
            datetime_created: new Date()
        });
        await mysql.quit();

        return generateResponse(200, database_result);
    } catch (err) {
        return generateError(500, err);
    }
};