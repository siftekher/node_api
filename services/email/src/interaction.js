const aws = require('aws-sdk')

import { generateResponse, generateError } from '../../../library/responses';
var mysql = require("../../../library/database.js");
const ses = new aws.SES({ region: 'us-east-1' });
const fromEmail = `infotech@remitfx.io  <infotech@remitfx.io>`;
const to_email = "software.notifications@pimwa.com"

module.exports.main = async (event) => {
  try {
    const {
      // staff_name, 
      // staff_id, 
      // stafff_aws, 
      interaction,
      data,
      result
    } = JSON.parse(event.body)

    // var condition = {id: division};
    // let division_results = await mysql.query(`SELECT * FROM divisions WHERE ?`, [condition])
    // await mysql.quit()

    let subject = `RemitFX Interaction report: ${interaction}`;

    let content = `
    <html>
    <h1>CTIN Portal Interaction Report</h1>
    <h2>Interaction: ${interaction}</h2>
    <hr>
    <p>
        An interaction has been made with the CTIN Portal.
    </p>
  
    <h3>Data items</h3>
    <table>
    `;
    for (var item in data) {
      content += `
  <tr>
  <th style="text-align: left">${item}</th>
  <td>${data[item]}</td>
  </tr>
`
    }
    content += `
    </table>
    <hr/>
    <h3>Result</h3>
    <p>
    Data result: ${result}
    </p>

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
    const res = await ses.sendEmail(emailParams).promise()
    return generateResponse(200, res)
  } catch (err) {
    return generateError(500, err)
  }
}
