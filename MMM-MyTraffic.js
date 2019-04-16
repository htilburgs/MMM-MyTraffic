/*
//-------------------------------------------
MMM-MyTraffic
Copyright (C) 2019 - H. Tilburgs
MIT License
//-------------------------------------------
*/

Module.register('MMM-MyTraffic', {

	// Default values
	defaults: {
		showJams: true,				// Show Traffic jams
		showConstructions: true,		// Show Constructions
		showRadars: true,			// Show Radar controles
		preferredRoads: null,			// Display only preferred roads - FUTURE OPTION
		maxWidth: "500px",			// Max width wrapper
		animationSpeed: 1000, 			// fade in and out speed
		initialLoadDelay: 1000,
		retryDelay: 2500,
		updateInterval: 10 * 60 * 1000		// every 10 minutes
	},
		
	// Define stylesheet
	getStyles: function () {
		return ["MMM-MyTraffic.css"];
	},  

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},
	
	start: function () {
		Log.info("Starting module: " + this.name);
		requiresVersion: "2.1.0",	
			
		// Set locales
		this.url = "https://www.anwb.nl/feeds/gethf"
		this.MTR = [];			// <-- Create empty MyTraffic array
		this.scheduleUpdate();       	// <-- When the module updates (see below)
	},

	getDom: function () {
		
		// creating the wrapper
		var wrapper = document.createElement("div");
		wrapper.className = "wrapper";
		wrapper.style.maxWidth = this.config.maxWidth;
	
		// The loading sequence
        	if (!this.loaded) {
            	    wrapper.innerHTML = "Loading....";
            	    wrapper.classList.add("bright", "light", "small");
            	    return wrapper;
        	}	
		
		var MTR = this.MTR;
		var ROADS = this.preferredRoads;
		
		// Create lists of jams, construction-zones and radar positions, with their road name	
		var jams = []
		var constructions = []
		var radars = []

		for (var road of MTR.roadEntries){
  			for (var jam of road.events.trafficJams){
			jams.push({name: road.road, jam})
			}
  			for (var construction of road.events.roadWorks){
    			constructions.push({name: road.road,construction})
  			}
  			for (var radar of road.events.radars){
    			radars.push({name: road.road,radar})
  			}
		}	
		
		//Display Traffic Jam information
		if (this.config.showJams != false) {
		   for (var i = 0; i < jams.length; i++) {	
			var warnWrapper = document.createElement("div");
			var icon = document.createElement("div");
			icon.classList.add('trafficicon-jam', 'small-icon');
			var event = document.createElement("div");
			event.className = "description xsmall";
			var information = document.createElement("div");
			information.className = "information bold"
			if (typeof jams[i].jam.startDate !== "undefined") {
				information.innerHTML = jams[i].name + " - " + jams[i].jam.startDate + " - " + (jams[i].jam.distance/1000) + "KM";
				} else {
				information.innerHTML = jams[i].name;
				}
			var description = document.createElement("div");
			description.className.add = "duration xsmall";
			description.innerHTML = jams[i].jam.description;
			var horLine = document.createElement("hr");
			event.appendChild(information);
			event.appendChild(description);
			warnWrapper.appendChild(icon);
			warnWrapper.appendChild(event);
			wrapper.appendChild(warnWrapper);
			wrapper.appendChild(horLine); 
		   }
		}
			   
		//Display Traffic Camera (Radar) information
		if (this.config.showRadars != false) {		
		   for (var i = 0; i < radars.length; i++) {	
			var warnWrapper = document.createElement("div");
			var icon = document.createElement("div");
			icon.classList.add('trafficicon-camera', 'small-icon');
			var event = document.createElement("div");
			event.className = "description xsmall";
			var information = document.createElement("div");
			information.className = "information bold"
			information.innerHTML = radars[i].radar.location;
			var description = document.createElement("div");
			description.className.add = "duration xsmall";
			description.innerHTML = radars[i].radar.description;
			var horLine = document.createElement("hr");
			event.appendChild(information);
			event.appendChild(description);
			warnWrapper.appendChild(icon);
			warnWrapper.appendChild(event);
			wrapper.appendChild(warnWrapper);
			wrapper.appendChild(horLine); 
		   }
		}
				
		//Display Traffic Constructions information
		if (this.config.showConstructions != false) {		
		   for (var i = 0; i < radars.length; i++) {	
			var warnWrapper = document.createElement("div");
			var icon = document.createElement("div");
			icon.classList.add('trafficicon-construction', 'small-icon');
			var event = document.createElement("div");
			event.className = "description xsmall";
			var information = document.createElement("div");
			information.className = "information bold"
			information.innerHTML = constructions[i].name + " - " + constructions[i].construction.startDate + " t/m " + constructions[i].construction.stopDate;
			var description = document.createElement("div");
			description.className.add = "duration xsmall";
			description.innerHTML = constructions[i].construction.description;
			var horLine = document.createElement("hr");
			event.appendChild(information);
			event.appendChild(description);
			warnWrapper.appendChild(icon);
			warnWrapper.appendChild(event);
			wrapper.appendChild(warnWrapper);
			wrapper.appendChild(horLine);
		   }
		}	
		return wrapper;
	}, // <-- closes the getDom function from above
		
	
	// this processes your data
	processTRAFFIC: function (data) { 
		this.MTR = data; 
//		console.log(this.MTR); // uncomment to see if you're getting data (in dev console)
		this.loaded = true;
	},
	
	// this tells module when to update
	scheduleUpdate: function () { 
		setInterval(() => {
		   this.getTRAFFIC();
		}, this.config.updateInterval);
		this.getTRAFFIC();
		var self = this;
	},
	  
	// this asks node_helper for data
	getTRAFFIC: function() { 
		this.sendSocketNotification('GET_MYTRAFFIC', this.url);
	},
	
	// this gets data from node_helper
	socketNotificationReceived: function(notification, payload) { 
		if (notification === "MYTRAFFIC_RESULT") {
		    this.processTRAFFIC(payload);
		}
		this.updateDom(this.config.initialLoadDelay);
	},
});
