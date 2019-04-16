/*
//-------------------------------------------
MMM-MyTraffic
Copyright (C) 2019 - H. Tilburgs
MIT License
//-------------------------------------------
*/

const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

  start: function() {
          console.log("Starting node_helper for: " + this.name);
  },

  getTRAFFIC: function(url) {
	request({
	url: url,
	method: 'GET'
	}, (error, response, body) => {
	if (!error && response.statusCode == 200) {
	var result = JSON.parse(body);					// JSON data path	
//	console.log(response.statusCode + result);			// Uncomment to see in terminal for test purposes
	this.sendSocketNotification('MYTRAFFIC_RESULT', result);
	}
        });
    },

  socketNotificationReceived: function(notification, payload) {
            if (notification === 'GET_MYTRAFFIC') {
            this.getTRAFFIC(payload);
            }
  }
});
