import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

module.exports.in_database = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const full_name = data.full_name;
        const iso_alpha_2 = data.iso_alpha_2;
        const iso_alpha_3 = data.iso_alpha_3;
        const un_code = data.un_code;

        let database_result = await mysql.query('INSERT INTO countries SET ?', {
            full_name: full_name,
            iso_alpha_2: iso_alpha_2,
            iso_alpha_3: iso_alpha_3,
            un_code: un_code
        });
        await mysql.quit()

        return generateResponse(200, database_result)
    } catch (err) {
        return generateError(500, err)
    }
};