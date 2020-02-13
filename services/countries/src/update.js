import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

export async function id(event, context) {
    const data = JSON.parse(event.body);
    try {
        var condition = {id: event.pathParameters.id};
        let results = await mysql.query("UPDATE countries SET ? WHERE ?", [data, condition])
        await mysql.quit()
        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
}