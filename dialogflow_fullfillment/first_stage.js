'use strict';

const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	response.json({"fulfillmentText":"Hello GCP Meetup Krk, yeah fullfillment works!"});
});
