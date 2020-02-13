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

module.exports.all = async (event) => {
    try {
        let results = await mysql.query('SELECT * FROM clients');
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
            let condition1 = { aws_cognito_id_google: cognitoId };
            client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition1]);
            await mysql.quit();
            var condition = {aws_cognito_id: client_check_results[0].aws_cognito_id};
        } else if (cognitoProvider === "graph.facebook.com,graph.facebook.com") {
            let condition1 = { aws_cognito_id_facebook: cognitoId };
            client_check_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition1])
            await mysql.quit()
            var condition = {aws_cognito_id: client_check_results[0].aws_cognito_id};
        } else {
            var condition = {aws_cognito_id: cognitoId};
        }

        let staff_results = await mysql.query(`SELECT * FROM staff_members WHERE ?`, [condition])
        await mysql.quit()
        const staff_id = staff_results[0].id;

        let sql = `SELECT DISTINCT clients.id,
                  clients.aws_cognito_id,
                  clients.first_name,
                  clients.last_name,
                  clients.nickname,
                  clients.email,
                  clients.telephone_mobile,
                  clients.residential_street_suburb,
                  clients.residential_street_country,
                  clients.team_id as "team_id",
                  teams.nickname as "team_nickname",
                  teams.division_id as "division_id",
                  divisions.nickname as "division_nickname",
                  divisions.entity_id as "entity_id",
                  entities.nickname as "entity_nickname"
                FROM clients, teams, divisions, entities, staff_team_access, staff_division_access, staff_entity_access
  WHERE clients.team_id = teams.id
    AND teams.division_id = divisions.id
    AND divisions.entity_id = entities.id
    AND clients.deleted = "false"
    AND (
         clients.responsible_staff_member = ?
        OR
          ( staff_team_access.staff_id = ? 
            AND staff_team_access.team_id = clients.team_id
            AND staff_team_access.access > 2)
          OR
          ( staff_division_access.staff_id = ? 
            AND staff_division_access.division_id = teams.division_id
            AND staff_division_access.access > 2)
          OR
          ( staff_entity_access.staff_id = ? 
            AND staff_entity_access.entity_id = divisions.entity_id
            AND staff_entity_access.access > 2)
        )`;

        if (staff_results[0].super_admin === 1) {
            sql = `SELECT DISTINCT clients.id,
                  clients.aws_cognito_id,
                  clients.first_name,
                  clients.last_name,
                  clients.nickname,
                  clients.email,
                  clients.telephone_mobile,
                  clients.residential_street_suburb,
                  clients.residential_street_country,
                  clients.team_id as "team_id",
                  teams.nickname as "team_nickname",
                  teams.division_id as "division_id",
                  divisions.nickname as "division_nickname",
                  divisions.entity_id as "entity_id",
                  entities.nickname as "entity_nickname"
                FROM clients, teams, divisions, entities
                WHERE clients.team_id = teams.id
                  AND teams.division_id = divisions.id
                  AND divisions.entity_id = entities.id
                  AND clients.deleted = "false"`;
        }


        let results = await mysql.query(sql, [staff_id, staff_id, staff_id, staff_id]);
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.by_aws_id = async (event) => {

        try {
            const aws_cognito_id = event.pathParameters.aws_cognito_id;
            let results  =  await mysql.query('SELECT * FROM clients WHERE ?', {aws_cognito_id: aws_cognito_id});

            await mysql.quit();

            return generateResponse(200, results[0]);

        } catch (err) {
            return generateError(500, err);
        }

    };



module.exports.by_id =  async (event)  => {

    try {
        const id = event.pathParameters.id;
        const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        const cognitoId = cognitoAuthenticationProvider[2];
        var condition = {aws_cognito_id: cognitoId};
        let staff_check_results = await mysql.query(`SELECT * FROM staff_members WHERE ?`, [condition])
        await mysql.quit()
        const staff_id = staff_check_results[0].id;

        let sql = `SELECT DISTINCT clients.*
                     FROM clients 
                     LEFT JOIN teams ON (clients.team_id = teams.id)
                     LEFT JOIN divisions ON (teams.division_id = divisions.id)
                     LEFT JOIN entities ON (divisions.entity_id = entities.id)
                     LEFT JOIN staff_team_access ON (staff_team_access.team_id = clients.team_id)
                     LEFT JOIN staff_division_access ON (staff_division_access.division_id = teams.division_id)
                     LEFT JOIN staff_entity_access ON (staff_entity_access.entity_id = divisions.entity_id)

                     WHERE clients.deleted = "false"
                     AND clients.id = ?
                     AND ( clients.responsible_staff_member = ?
                     OR (
                        ( staff_team_access.staff_id = ? AND staff_team_access.access > 2)
                     OR
                        ( staff_division_access.staff_id = ? AND staff_division_access.access > 2)
                     OR ( staff_entity_access.staff_id = ? AND staff_entity_access.access > 2)
                       )
                     )`;
        let results;



        if (staff_check_results[0].super_admin === 1) {
            results =  await mysql.query('SELECT * FROM clients WHERE ?', { id: id });
        } else {
            results =  await mysql.query(sql, [id, staff_id, staff_id, staff_id, staff_id]);
        }
        await mysql.quit();

        return generateResponse(200, results[0]);

    } catch (err) {
        return generateError(500, err);
    }

};

module.exports.list_todo_client_by_client_id = async (event) => {
    try {
        const client_id = event.pathParameters.client_id;

        let results = await mysql.query('SELECT * FROM todo_client WHERE ?', {client_id: client_id});
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.check_client_can_login = async (event) => {
    try {
       const aws_cognito_id = event.pathParameters.aws_cognito_id;
       let results = await mysql.query('SELECT * FROM clients WHERE ?', {aws_cognito_id: aws_cognito_id});

       await mysql.quit();

       if (results.length > 0 && results[0].deleted === 0) {
          return  generateResponse(200, true)
       } else {
          return  generateResponse(200, false)
       }

    } catch (err) {
          return  generateError(500, err)
        }
    };


module.exports.for_mob =  async (event)  => {

    try {
        var condition = {id: '2'};
        let result = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition]);
        await mysql.quit();
        return generateResponse(200, result[0]);
    } catch (err) {
        return generateError(500, err);
    }
    /*
        try {
            const id = event.pathParameters.id;
            const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
            const cognitoId = cognitoAuthenticationProvider[2];
            var condition = {aws_cognito_id: cognitoId};
            let result = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition]);
            await mysql.quit();

            return generateResponse(200, result);
        } catch (err) {
            return generateError(500, err);
        }
    */
};