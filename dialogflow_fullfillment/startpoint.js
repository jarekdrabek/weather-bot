'use strict';

const http = require('http');
const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((req, res) => {

  	let city = req.body.queryResult.parameters.city;
  	let date = req.body.queryResult.parameters.date;

  	console.log('Reuqest: Date: ',date,'City',city);

	callWeatherApi(city, date).then(output => {
	  	res.json({ 'fulfillmentText': output });
    });
});
