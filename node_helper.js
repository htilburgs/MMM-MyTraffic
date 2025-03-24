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

async getTraffic(url) {
    try {
      // Maak een GET-aanroep naar de opgegeven URL
      const response = await fetch('https://api.anwb.nl/v2/incidents?apikey=QYUEE3fEcFD7SGMJ6E7QBCMzdQGqRkAi', { gzip: true, mode: 'no-cors' });

      if (!response.ok) {
        throw new Error(
          `MMM-MyTraffic: Network response was not ok. Status: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      // Stuur de ontvangen gegevens naar de module
      this.sendSocketNotification("MYTRAFFIC_RESULT", result);
    } catch (error) {
      console.error(`MMM-MyTraffic Error: ${error.message}`);
    }
  },
				   
				   
/*
  getTRAFFIC: function(url) {
	request('https://api.anwb.nl/v2/incidents?apikey=QYUEE3fEcFD7SGMJ6E7QBCMzdQGqRkAi', { gzip: true, mode: 'no-cors' }, (error, response, body) => {
	if (!error && response.statusCode == 200) {
	  var result = JSON.parse(body);							// JSON data path	
	  //console.log(response.statusCode + body);			// Uncomment to see in terminal for test purposes
	  this.sendSocketNotification('MYTRAFFIC_RESULT', result);
	}
        });
    },
*/

  socketNotificationReceived: function(notification, payload) {
            if (notification === 'GET_MYTRAFFIC') {
            this.getTRAFFIC(payload);
            }
  }
});
