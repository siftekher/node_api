const aws = require('aws-sdk');
import { getSignatureLine } from '../../../library/email_branding';
import { generateResponse, generateError } from '../../../library/responses';

var mysql = require("../../../library/database.js");
const ses = new aws.SES({region: 'us-east-1'});
const fromEmail = `infotech@remitfx.io  <infotech@remitfx.io>`;
const bccEmail = `software.notifications@pimwa.com`;

module.exports.identification_document_uploaded = async (event) => {
    try {
        const cognitoAuthenticationProvider = event.requestContext.identity.cognitoAuthenticationProvider.split(":");
        const cognitoProvider = cognitoAuthenticationProvider[0];
        const cognitoId = cognitoAuthenticationProvider[2];

        let client_results;
        if (cognitoProvider === "accounts.google.com,accounts.google.com") {
            let condition = { aws_cognito_id_google: cognitoId };
            client_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
            await mysql.quit()
        } else {
            let condition = { aws_cognito_id: cognitoId };
            client_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition])
            await mysql.quit()
        }

        const {
            data
        } = JSON.parse(event.body)
        const {
            nickname,
            document_number
        } = data

        let to_email = client_results[0].email;
        let subject = `REMITFX: Identification document uploaded`;

        let content = `
    <html>
    <p>
        Dear ${client_results[0].title ? client_results[0].title : ""} ${client_results[0].first_name} ${client_results[0].last_name},
    </p>
    <h3>REMITFX: Identification document has been uploaded</h3>
    <p>
      Confirming that an identification document has been uploaded onto your account.
    </p>
    <p>
      The document uploaded was:
      <br/>
      <strong>Document: </strong>${nickname}<br/>
      <strong>Number: </strong>${document_number}<br/>
    </p>
    <p>
        This document will now be analysed by our compliance team, 
        and your portal updated to reflect the status shortly.
    </p>
    <p>
      Please note that use of this system is subject to the terms and conditions 
    </p>

    <p>
    Regards,
    <br/>
     ${getSignatureLine("ctin")}
    </html>
    `;

        let emailParams = {
            Source: fromEmail,
            Destination: {
                ToAddresses: [to_email],
                BccAddresses: [bccEmail]
            },
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
        };
        const res = await ses.sendEmail(emailParams).promise()
        return generateResponse(200, res)
    } catch (err) {
        return generateError(500, err)
    }
};


module.exports.send_remittance_instructions = async (event) => {
    try {
        const {
            id,
            rate,
            amount_to,
            currency_to,
            amount_from,
            currency_from,
            eba_account_name,
            remitting_bank_id,
            remittance_reference,
            language_id
        } = JSON.parse(event.body);

        var condition = {id: id};
        let client_results = await mysql.query(`SELECT * FROM clients WHERE ?`, [condition]);
        await mysql.quit();
        var condition2 = {id: remitting_bank_id};
        let bank_account_results = await mysql.query(`SELECT * FROM entity_bank_accounts WHERE ?`, [condition2])
        await mysql.quit();
        var condition3 = {id: bank_account_results[0].entity_bank_id};
        let bank_results = await mysql.query(`SELECT * FROM entity_banks WHERE ?`, [condition3]);
        await mysql.quit();

        let client = {};
        if (client_results.length === 1) {
            client = client_results[0]
        } else {
            return generateError(500, "No client located")
        }

        let to_email = client.email;

        let subject = `REMITFX Settlement Instructions`;

        let email_content = `
        <html>
        <style>
        h4 {
        margin-bottom: 0
        }
            table {
              border-collapse: collapse;
              width: 70%;
              border: 1px solid #e6e6e6;
            }
            table td, table td * {
              vertical-align: top;
            }
            tr:hover {background-color: #f5f5f5;}
        </style>
        <p>
            Dear ${client.title ? client.title : ""} ${client.first_name} ${client.last_name},
        </p>
        <h3>REMITFX Settlement Instructions</h3>
        <p>
          Your foreign exchange transaction is now process and awaiting settlement.
        </p>
        <p>
          We confirm the exchange rate of ${rate} and the amount
          of ${Number(amount_to).toFixed(2)} ${currency_to} will be credited to your nominated
          beneficiary.
        </p>
        <p>
          Please remit your ${Number(amount_from).toFixed(2)} ${currency_from} to
          the ${eba_account_name} Client Settlement Account, <strong>using reference ${remittance_reference} on your deposit</strong>
           and details as follows.
        </p>
        <h4>Payment</h4>
        <table>
            <tbody>
                <tr>
                    <td width="30%">Currency</td>
                    <td>${currency_from}</td>
                </tr>
                <tr>
                    <td width="30%">Amount</td>
                    <td>${Number(amount_from).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        <h4>Account Details</h4>
        <table>
            <tbody>
                <tr>
                    <td width="30%">Bank SWIFT Code</td>
                    <td>${bank_account_results[0].eba_swift}</td>
                </tr>
                <tr>
                    <td width="30%">Account Name</td>
                    <td>${bank_account_results[0].eba_accout_name}</td>
                </tr>
                <tr>
                    <td width="30%">Account Number</td>
                    <td>${bank_account_results[0].eba_accout_number}</td>
                </tr>
                <tr>
                    <td width="30%">IBAN</td>
                    <td>${bank_account_results[0].iban}</td>
                </tr>
                <tr>
                    <td width="30%">Reference</td>
                    <td>${remittance_reference}</td>
                </tr>
            </tbody>
        </table>
        <h4>Account</h4>
        <table>
            <tbody>
                <tr>
                    <td width="30%">Account Name</td>
                    <td>${bank_account_results[0].eba_accout_name}</td>
                </tr>
                <tr>
                    <td width="30%">Account Holder Address</td>
                      <td>
                        ${bank_account_results[0].address_line_1 || ""}
                        <br/>
                        ${bank_account_results[0].address_line_2 || ""}
                        <br/>
                        ${bank_account_results[0].address_suburb || ""}
                        &nbsp;
                        ${bank_account_results[0].address_state || ""}
                        &nbsp;
                        ${bank_account_results[0].address_postcode || ""}
                        <br/>
                      </td>
                </tr>
            </tbody>
        </table>
        <h4>Bank</h4>
        <table>
            <tbody>
                <tr>
                <td width="30%">Bank Name</td>
                <td>${bank_results[0].eb_long_name}</td>
                </tr>
                  <tr>
                    <td>Bank Address</td>
                      <td>
                        ${bank_results[0].address_line_1 || ""}
                        <br/>
                        ${bank_results[0].address_line_2 || ""}
                        <br/>
                        ${bank_results[0].address_suburb || ""}
                        &nbsp;
                        ${bank_results[0].address_state || ""}
                        &nbsp;
                        ${bank_results[0].address_postcode || ""}
                        <br/>
                      </td>
                </tr>

            </tbody>
        </table>
    <p>
      Please note that use of this system is subject to the terms and conditions 
    </p>

    <p>
    Regards,
    <br/>
     ${getSignatureLine("ctin")}
    </html>
    `;

        let emailParams = {
            Source: fromEmail,
            Destination: {
                ToAddresses: [to_email],
                BccAddresses: [bccEmail]
            },
            ReplyToAddresses: [fromEmail],
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: email_content
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            }
        };
        const res = await ses.sendEmail(emailParams).promise();
        return generateResponse(200, res)
    } catch (err) {
        return generateError(500, err)
    }
};
