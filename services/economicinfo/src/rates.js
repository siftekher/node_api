// import { generateResponse, generateError } from '../../../library/responses';
// var mysql = require("../../../library/database.js");
const axios = require('axios');

const generateResponse = (code, payload) => {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(payload)
  }
}


module.exports.get = async (event) => {
  const currency_from = event.pathParameters.currency_from;
  const currency_to = event.pathParameters.currency_to;
  let response = await axios.get(`https://apilayer.net/api/convert?access_key=a4eb7fd0501842eb4d4712cc459cae5f&from=${currency_from}&to=${currency_to}&amount=1`)
    .then(function (response) {
      // handle success
      // console.log(response.data.info);
      return response.data.info;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      return generateResponse(500, error);
    })
  return generateResponse(200, response);
}


