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


export async function aws_cognito_id(event, context) {
    const data = JSON.parse(event.body);
    try {
        var condition = {aws_cognito_id: event.pathParameters.aws_cognito_id};
        let results = await mysql.query("UPDATE clients SET ? WHERE ?", [data, condition])
        await mysql.quit()
        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
}

export async function id(event, context) {
    const data = JSON.parse(event.body);
    try {
        var condition = {id: event.pathParameters.id};
        let results = await mysql.query("UPDATE clients SET ? WHERE ?", [data, condition])
        await mysql.quit()
        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
}
export async function by_aws_id(event, context) {
    const data = JSON.parse(event.body);
    try {
        var condition = {aws_cognito_id: event.pathParameters.aws_cognito_id};
        let results = await mysql.query("UPDATE clients SET ? WHERE ?", [data, condition])
        await mysql.quit()
        return generateResponse(200, results);
    } catch (err) {
        return generateError(500, err);
    }
}

