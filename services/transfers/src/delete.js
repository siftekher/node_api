import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

export async function id(event, context) {
    //const data = JSON.parse(event.body);
    try {
        var condition = {id: event.pathParameters.country_id};
        let results = await mysql.query("DELETE FROM countries WHERE ?", [condition])
        await mysql.quit()
        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
}