import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");

module.exports.all = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM currencies');
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.id = async (event) => {
    try {
        var condition = {id: event.pathParameters.currency_id};
        let results = await mysql.query("SELECT * FROM  currencies WHERE ?", [condition])
        await mysql.quit()

        return generateResponse(200, results[0])
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.list_not_deleted = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM currencies WHERE deleted = 0');
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.all_priority = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM currencies WHERE list_priority = 0');
        await mysql.quit();

        let newresults = await mysql.query('SELECT * FROM currencies WHERE list_priority = 1');
        await mysql.quit();

        let retVal = {
            fullList: results,
            priorityonly: newresults
        }

        return generateResponse(200, retVal)
    } catch (err) {
        return generateError(500, err)
    }
};