const express = require('express');
const request = require('request-promise');
const iplocation = require('iplocation').default;
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const bodyParser = require('body-parser');
const validateip = require('validate-ip');
const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))


function getWoeidFromIp(ipAdress, callback){

  //extract lattlong from ip location
  iplocation(ipAdress)
  .then((res) => {
    let lattlong = res.latitude + ', ' + res.longitude;
    const options = {
      method: 'GET',
      uri: `https://www.metaweather.com/api/location/search/?lattlong=${lattlong}`,
    }

    //extract the woeid from lattlong sending request to metaweatherAPI
    request(options)
    .then((response) => {
      weather_json = JSON.parse(response);
      let woeid = weather_json[0].woeid;
       callback(woeid);
    })
    .catch(err => {
      callback(new Error('Bad ip'));
    });
  })
  .catch(err => {
     callback(new Error('Bad ip'));
  });
}

app.get('/', (req, res) => {
  let ipAdress = localStorage.getItem('storedIp');

  getWoeidFromIp(ipAdress, (result) => {
    //if IP is wrong
    if (result == 'Error: Bad ip'){
      res.render('weather', {error: 'This ip is not valid.'});
    }

    else {
      const options = {
       method: 'GET',
       uri: `https://www.metaweather.com/api/location/${result}/`,
     }

     //get weather data from woeid by sending request to metaweatherAPI
     request(options)
     .then((response) => {
       weather_json = JSON.parse(response);

       //parsing JSON data
       let weather = {
         city: weather_json.title,
         country: weather_json.parent.title,
         temperature: Math.round(weather_json.consolidated_weather[0].the_temp),
         description: weather_json.consolidated_weather[0].weather_state_name,
         icon: weather_json.consolidated_weather[0].weather_state_abbr
       }

       //send data to the template
       let weather_data = {weather: weather};
       res.render('weather', weather_data);
     })
     .catch((err) => {
       console.log('Erreur !');
       res.render('weather', {error: 'Error from Location/API, please try later'});
     });
   }
  });
});

app.post('/', (req, res) => {
  //get ip from form and store it into local storage
  let ipAdress = req.body.ip_adress.trim();
  if (validateip(ipAdress)){
    localStorage.setItem('storedIp', ipAdress);
    res.redirect('/');
  }
  else
    res.render('weather', {error: 'This ip is not valid.'});
});

app.listen(3000);
