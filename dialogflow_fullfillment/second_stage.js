'use strict';

const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, res) => {
  	let date = request.body.queryResult.parameters.date;
    let city = request.body.queryResult.parameters.city;
        getWeatherForecast(city, date).then(output => res.json({"fulfillmentText":output})
    );
});

function getWeatherForecast(city, date){
  return new Promise((resolve, reject) => {
    callGetCoordinates(city).then(output =>{
        callWeatherApi(output.cityName, output.coordinates, date).then(output => resolve(output));
    });
  });
}

// api.worldweatheronline.com/premium/v1/weather.ashx?format=json&num_of_days=1&q=Paris&key=3772aabe522543cbbfa150114191402&date=2019-02-19
const https = require('https');

function callWeatherApi (cityName, coordinates, date) {
  const host = 'api.worldweatheronline.com';
  const wwoApiKey = '3772aabe522543cbbfa150114191402';

  return new Promise((resolve, reject) => {
    let day_date = date.substring(0,10);
    let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
      '&q=' + coordinates + '&key=' + wwoApiKey + '&date=' + day_date;
    console.log('API Request: ' + host + path);

    https.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        console.log('Response: ' + body);
        let response = JSON.parse(body);
        let location = response.data.request[0].query;
        let the_day_at_noon = response.data.weather[0].hourly[4];
        let temperature = the_day_at_noon.tempC;
        let weather_description = the_day_at_noon.weatherDesc[0].value;

        let output = `${weather_description} with the temperature of ${temperature}°C
        in ${cityName} on ${day_date}`;

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

function callGetCoordinates(cityName){

  let google_host = 'https://maps.googleapis.com';
  let googleApiKey = 'AIzaSyBj2ZABDNF1VhG9zCI__lF4DttQ_I5Zkuw';
  let path = "/maps/api/geocode/json?address="+encodeURIComponent(cityName)+"&key="+googleApiKey;
  console.log('Google API Request: ' + google_host + path);

  return new Promise((resolve, reject) => {
      https.get(google_host+path, (res) => {
          let body = '';
          res.on('data', function (chunk) {
              body += chunk;
          });
          res.on('end', function () {
              console.log('Response: ' + body);
              let response = JSON.parse(body);
              let lat = response.results[0].geometry.location.lat;
              let lng = response.results[0].geometry.location.lng;
              let coordinates = lat + "," + lng;
              console.log("Coordinates: " + coordinates);
              resolve({"cityName":decodeURIComponent(cityName), "coordinates":coordinates});
          });
          res.on('error', (error) => {
              console.log(`Error calling Google Geo API: ${error}`);
              reject();
          });

      });
  });
}