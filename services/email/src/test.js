const aws = require('aws-sdk')

import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");
const ses = new aws.SES({region: 'us-east-1'});
const fromEmail = "infotech@remitfx.io"

module.exports.main = async (event) => {
  try {
    const { to_name, to_email, subject } = JSON.parse(event.body)
    // var condition = {id: division};
    // let division_results = await mysql.query(`SELECT * FROM divisions WHERE ?`, [condition])
    // await mysql.quit()

    let content = `
    <html>
    <h1>Email Test</h1>
    <h2>Subject line: ${subject}</h2>
    <hr>
    <p>
        This is a test submission from rfx-webapp-cp-api...
    </p>
    <p>
        The subject line is: 
        <span style="font-weight: 600">
            ${subject}
        </span>
    </p>
  
    <table>
    <tr>
        <th style="text-align: left">to_name</th>
        <td>${to_name}</td>
    </tr>
    <tr>
        <th style="text-align: left">to_email</th>
        <td>${to_email}</td>
    </tr>
    </table>
    <hr/>
    </html>
`;
    let emailParams = {
      Source: fromEmail,
      Destination: { ToAddresses: [to_email] },
      ReplyToAddresses: [fromEmail],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: content
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      }
    }
    const data = await ses.sendEmail(emailParams).promise()
    return generateResponse(200, data)
  } catch (err) {
    return generateError(500, err)
  }
}
