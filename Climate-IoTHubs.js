var https = require('https');
var crypto = require('crypto');
var tessel = require('tessel');
var climatelib = require('climate-si7020');
//var moment = require('moment');
var climate = climatelib.use(tessel.port['A']);
 
climate.on('ready', function () {
  console.log('Connected to si7020');
});
 
'use strict';

var ClientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var date = new Date();

var connectionString = 'HostName=<IoTHubName>.azure-devices.net;DeviceId=<DeviceID>;SharedAccessKey=<SharedAccessKey>';

var client = ClientFromConnectionString(connectionString);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.ToString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  }
  else {
    console.log('Client connected');

    setInterval(function(){
      climate.readTemperature('f', function (err, temp) {
        climate.readHumidity(function (err, humid) {
        var data = JSON.stringify({ Device: 'tessel2', Temp: temp.toFixed(4), Humidity: humid.toFixed(4), Time: date.toString()});
        var message = new Message(data);
        console.log("Sending message: " + message.getData());
        client.sendEvent(message, printResultFor('send'));
        });
      });
    }, 1000)
  }
};

client.open(connectCallback);

climate.on('error', function(err) {
  console.log('error connecting module', err);
});
