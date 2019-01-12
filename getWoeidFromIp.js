const request = require('request-promise');
const iplocation = require('iplocation').default;

exports.getWoeid = function getWoeidFromIp(ipAdress, callback){

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
