import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");


module.exports.all = async (event) => {
    try {
        let results = await mysql.query('SELECT beneficiaries.id, beneficiaries.nickname, beneficiaries.client_id, clients.first_name, clients.last_name, beneficiaries.entity_id, entities.nickname ' + 'as entity_name,' +
            'beneficiaries.team_id, teams.nickname ' + 'as team_name, beneficiaries.division_id, d.nickname as division_name ' +
            'FROM beneficiaries left join clients on clients.id = beneficiaries.client_id ' +
            'left join entities on entities.id=beneficiaries.entity_id ' +
            'left join teams on teams.id = beneficiaries.team_id ' +
            'left join divisions d on d.id = beneficiaries.division_id');
        await mysql.quit();

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.list = async (event, context) => {
    // const userId =  event.requestContext.identity.cognitoIdentityId;
    const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
    const cognitoProvider = cognitoAuthenticationProvider[0];
    const cognitoId = cognitoAuthenticationProvider[2];

    try {
        if (cognitoProvider === "accounts.google.com,accounts.google.com") {
            var condition = {"clients.aws_cognito_id_google": cognitoId};
        } else if (cognitoProvider === "graph.facebook.com,graph.facebook.com") {
            var condition = {"clients.aws_cognito_id_facebook": cognitoId};
        } else {
            var condition = {"clients.aws_cognito_id": cognitoId};
        }

        // var condition = {"clients.aws_cognito_id": cognitoId};
        let results = await mysql.query(`SELECT clients.id AS id, entities.id AS entity_id, teams.id AS team_id, divisions.id AS division_id
                                           FROM clients LEFT JOIN teams ON(clients.team_id = teams.id) 
                                           LEFT JOIN divisions ON(teams.division_id = divisions.id)
                                           LEFT JOIN entities ON(divisions.entity_id = entities.id) 
                                           WHERE 
                                     ?`, [condition]);

        await mysql.quit();

        let entity_id = results[0].entity_id;
        let client_id = results[0].id;
        let team_id   = results[0].team_id;
        let division_id   = results[0].division_id;

        var condition1 = {"beneficiaries.entity_id": entity_id};
        var condition2 = {"beneficiaries.client_id": client_id};
        var condition3 = {"beneficiaries.team_id": team_id};
        var condition4 = {"beneficiaries.division_id": division_id};
        var condition  = {"beneficiaries.deleted": 0};
        let beneficiary = await mysql.query(`SELECT beneficiaries.id as id, beneficiaries.nickname, CONCAT(clients.first_name, " ",clients.last_name) AS c_name, 
                                               divisions.nickname AS d_nickname, entities.nickname AS e_nickname, teams.nickname AS t_nickname,
                                               currencies.short_name AS currency_short_name, beneficiaries.bank_legal_name
                                               FROM beneficiaries
                                               LEFT JOIN clients ON beneficiaries.client_id = clients.id 
                                               LEFT JOIN entities ON beneficiaries.entity_id = entities.id
                                               LEFT JOIN teams ON beneficiaries.team_id = teams.id
                                               LEFT JOIN divisions ON beneficiaries.division_id = divisions.id
                                               LEFT JOIN currencies ON beneficiaries.account_currency = currencies.id
                                               WHERE  
                                               ? AND ( ? OR ? OR ? OR ? )`, [condition, condition1, condition2, condition3, condition4 ]);
        await mysql.quit();

        return generateResponse(200, beneficiary )

    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.by_id = async (event) => {
    try {
        const id = event.pathParameters.id;

        let sql = `SELECT b.*,
                c.iso_alpha_3 as "iso_alpha_3",
                c.full_name as "currency_full_name"
                FROM beneficiaries AS b LEFT JOIN  currencies AS c on c.id = b.account_currency 
                WHERE 
                  ?`;
        let results = await mysql.query(sql, { ["b.id"]: id });

        // let results = await mysql.query('SELECT * FROM beneficiaries WHERE ?', { id: id });
        await mysql.quit();

        return generateResponse(200, results[0])
    } catch (err) {
        return generateError(500, err)
    }
};

module.exports.id = async (event) => {
    try {
        var condition = {"beneficiaries.id": event.pathParameters.id};
        let results = await mysql.query(`SELECT beneficiaries.*, currencies.short_name, currencies.full_name, currencies.iso_alpha_3, countries.full_name as ben_country FROM  beneficiaries 
                                    LEFT JOIN currencies on (beneficiaries.account_currency = currencies.id)
                                    LEFT JOIN countries on (beneficiaries.ben_address_country = countries.id)
                                    WHERE ?`, [condition])
        await mysql.quit()

        return generateResponse(200, results)
    } catch (err) {
        return generateError(500, err)
    }
};
