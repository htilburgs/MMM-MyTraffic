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
		showConstructions: false,		// Show Constructions
		showRadars: false,			// Show Radar controles
		preferredRoads: ['ALL'],		// Show All roads or show you're selection -> ['A1','A50','A67']
		maxWidth: "500px",			// Max width wrapper
		largeIcons: false,			// Display Large or Small icons and information
		animationSpeed: 1000, 			// fade in and out speed
		initialLoadDelay: 1000,
		retryDelay: 2500,
		updateInterval: 60 * 1000		// every 1 minute
	},

			
	// Create lists of jams, construction-zones and radar positions, with their road name	
	MTR: null,	
	jams : [],
	constructions : [],
	radars : [],
	
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
		this.MTR = [];				// <-- Create empty MyTraffic array
		this.scheduleUpdate();     	// <-- When the module updates (see below)
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
				
		if (this.config.largeIcons != false) {
			
			//Display Traffic Jam information
			if (this.config.showJams != false) {
			for (var j of this.jams) {	

				var warnWrapper = document.createElement("div");
				var icon = document.createElement("div");
				icon.classList.add('trafficicon-jam', 'small-icon');
				var event = document.createElement("div");
				event.className = "event xsmall";
				var information = document.createElement("div");
				information.className = "bold"
				if (typeof j.road!== undefined) {
					information.innerHTML = j.name +  ": " + j.start + " - " + j.end;
					} 
				var description = document.createElement("div");
				description.className.add = "description xsmall";
				
				if(j.jam.reason && !isNaN(j.jam.distance)) {
					description.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.reason + " " + (j.jam.distance/1000) + "KM";
				} else if (j.jam.reason && isNaN(j.jam.distance)) {
					description.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.reason;
				} else if (j.jam.reason === undefined && !isNaN(j.jam.distance)) {
					description.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.events[0].text + ". " + (j.jam.distance/1000) + "KM";
				} else {
					description.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.events[0].text;
				}
				
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
			for (var c of this.constructions) {	
				var warnWrapper = document.createElement("div");
				var icon = document.createElement("div");
				icon.classList.add('trafficicon-construction', 'small-icon');
				var event = document.createElement("div");
				event.className = "event xsmall";
				var information = document.createElement("div");
				information.className = "bold"
				information.innerHTML = c.name + ": " + c.start + " - " + c.end;
				var description = document.createElement("div");
				description.className.add = "description xsmall";
				if(c.roadwork.from !== c.roadwork.to) {
					description.innerHTML = c.roadwork.from + " t/m " + c.roadwork.to + ": " + c.roadwork.reason;
				}
				else {
					description.innerHTML = c.roadwork.from + ": " + c.roadwork.reason;
				}
				var horLine = document.createElement("hr");
				event.appendChild(information);
				event.appendChild(description);
				warnWrapper.appendChild(icon);
				warnWrapper.appendChild(event);
				wrapper.appendChild(warnWrapper);
				wrapper.appendChild(horLine);
				}
			}
			
		} else {	//Part of largeIcons: false
			
			//Display Traffic Jam information
			if (this.config.showJams != false) {
			for (var j of this.jams) {		
				var jamsInformation = document.createElement("div");
				jamsInformation.className = "jamsInformation xsmall bold";
				jamsInformation.innerHTML = '<i class="tr-traffic-jam"></i> ' + j.name + " : " + j.start + " - " + j.end;
				wrapper.appendChild(jamsInformation);
				
				var jamsDescription = document.createElement("div");
				jamsDescription.className = "jamsDescription xsmall";
			
				if(j.jam.reason && !isNaN(j.jam.distance)) {
					jamsDescription.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.reason + " " + (j.jam.distance/1000) + "KM";
				} else if (j.jam.reason && isNaN(j.jam.distance)) {
					jamsDescription.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.reason;
				} else if (j.jam.reason === undefined && !isNaN(j.jam.distance)) {
					jamsDescription.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.events[0].text + ". " + (j.jam.distance/1000) + "KM";
				} else {
					jamsDescription.innerHTML = j.jam.from + " t/m " + j.jam.to + ". " + j.jam.events[0].text;
				}
				wrapper.appendChild(jamsDescription);
		   		}
			}
				
			//Display Trafic Camera (Radar) information
			if (this.config.showRadars != false) {		
			   for (var r of this.radars) {	
				var radarInformation = document.createElement("div");
				radarInformation.className = "radarInformation xsmall bold"
				radarInformation.innerHTML = '<i class="tr-traffic-camera"></i> ' + r.name + ": " + r.start + " - " + r.end + ". " + r.radar.reason;
				wrapper.appendChild(radarInformation);
			   }
			}
			
			//Display Traffic Constructions information
			if (this.config.showConstructions != false) {		
			   for (var c of this.constructions) {			
				var consInformation = document.createElement("div");
				consInformation.className = "consInformation xsmall bold";
				consInformation.innerHTML = '<i class="tr-traffic-cone"></i> ' + c.name + ": " + c.start + " - " + c.end;
				wrapper.appendChild(consInformation);
				var consDescription = document.createElement("div");
				consDescription.className = "consDescription xsmall";
				
				if(c.roadwork.from !== c.roadwork.to) {
					consDescription.innerHTML = c.roadwork.from + " t/m " + c.roadwork.to + ": " + c.roadwork.reason;
				}
				else {
					consDescription.innerHTML = c.roadwork.from + ": " + c.roadwork.reason;
				}
				wrapper.appendChild(consDescription);
			   }
			}
		}	
			
		return wrapper;
	}, // <-- closes the getDom function from above
		
	
	// this processes your data
	processTRAFFIC: function (data) { 
		this.MTR = data; 
		//console.log(this.MTR); // uncomment to see if you're getting data (in dev console)

    		this.jams=[]
    		this.constructions=[]
    		this.radars=[]
			
		// Convert preferredRoads Array to upper case
		var pRoads = this.config.preferredRoads;
		this.pRoads = pRoads.map(function(x){ return x.toUpperCase() })
    		
		for (var road of this.MTR.roads){
			if(this.pRoads.includes(road.road) || this.pRoads.includes("ALL")) {
				for(var segment of road.segments) {
					// Log.log(segment)		// uncomment to see if you're getting data (in dev console)
					if(segment.jams) {
						for(var jam of segment.jams) {
							console.log(jam)
							this.jams.push({name: road.road, start: segment.start, end: segment.end, jam:jam})
						}
					 }
					if(segment.roadworks) {
						for(var roadwork of segment.roadworks) {
							this.constructions.push({name: road.road, start: segment.start, end: segment.end, roadwork:roadwork})
						}
					}
					if(segment.radars) {
						for(var radar of segment.radars) {
							this.radars.push({name: road.road, start: segment.start, end: segment.end, radar:radar})
						}
					}
				}
			}
		}
		
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
        	this.updateDom(100);
		}
		//this.updateDom(this.config.initialLoadDelay);		// For testing purposes
	},
});
