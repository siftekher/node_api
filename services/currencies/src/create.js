import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

module.exports.in_database = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const deleted = 0; //default value 0, not deleted
        const full_name = data.full_name;
        const short_name = data.short_name;
        const iso_alpha_3 = data.iso_alpha_3;
        const iso_numeric = data.iso_numeric;
        const list_priority = data.list_priority;

        let database_result = await mysql.query('INSERT INTO currencies SET ?', {
            deleted: deleted,
            full_name: full_name,
            short_name: short_name,
            iso_alpha_3: iso_alpha_3,
            iso_numeric: iso_numeric,
            list_priority: list_priority
        });
        await mysql.quit()

        return generateResponse(200, database_result)
    } catch (err) {
        return generateError(500, err)
    }
};