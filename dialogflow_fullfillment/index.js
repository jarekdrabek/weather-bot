'use strict';

const http = require('http');
const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((req, res) => {
  let city = req.body.queryResult.parameters.city; // city is a required param
  if (req.body.queryResult.parameters.country) {
    city += ','+req.body.queryResult.parameters.country;
  }
  let date = '';
  if (req.body.queryResult.parameters.date) {
    date = req.body.queryResult.parameters.date;
  }
  console.log("Date:", date, " City:", city);

  callWeatherApi(city, date).then((output) => {
    res.json({ 'fulfillmentText': output });
  }).catch((error) => {
    res.json({ 'fulfillmentText': `I was not able to check the weather online, try again!` });
    console.log(error);
  });
});

function callWeatherApi (city, date) {

  const host = 'api.worldweatheronline.com';
  const wwoApiKey = '3772aabe522543cbbfa150114191402';

  return new Promise((resolve, reject) => {
    let day_date = date.substring(0,10);
    let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
      '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + day_date;
    console.log('API Request: ' + host + path);

    http.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        console.log('Response: ' + body);
        let response = JSON.parse(body);
        let location = response.data.request[0].query;
        let the_day_at_noon = response.data.weather[0].hourly[4];
        let temperature = the_day_at_noon.tempC;
        let cloudiness = the_day_at_noon.weatherDesc[0].value;

        let output = `${cloudiness} with the temperature of ${temperature}°C
        in ${location} on ${day_date}`;

        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.log(`Error calling the weather API: ${error}`);
        reject();
      });
    });
  });
}
