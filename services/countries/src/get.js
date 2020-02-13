import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

module.exports.all = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM countries ORDER BY list_priority ');
        await mysql.quit();

        // let newresults = await mysql.query('SELECT * FROM countries WHERE list_priority = 1');
        // await mysql.quit();
        //
        // let retVal = {
        //     fullList: results,
        //     priorityonly: newresults
        // };

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.id = async (event) => {
    try {
        var condition = {id: event.pathParameters.id};
        let results = await mysql.query("SELECT * FROM  countries WHERE ?", [condition])
        await mysql.quit()

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.list_not_deleted = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM countries WHERE deleted = "false" ORDER BY list_priority DESC');
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};