const GPS_PRECISION = 1000000;
var map, icons;
var target, heading, car;

var GPS_Marker = {
	target: undefined,
	heading: undefined,
	car: undefined,
	selfie: undefined,
	waypoints: undefined
};
var GPS_Positions = {
	SJSU: {
		lat: 37.336056,
		lng: -121.881855
	},
	Current: {
		lat: 37.336056,
		lng: -121.881855
	},
	Target_Coordinates: {
		lat: 336056,
		lng: -881855
	},
	waypoints: undefined
};

var directionsService, directionsDisplay, stepDisplay;
var send_waypoints_interval;

// =====================================
// Google Maps
// =====================================
function encodeCoords(coords)
{
	var n = Math.abs(coords.lat);
	var lat_d = n - Math.floor(n);
	var n = Math.abs(coords.lng);
	var lng_d = n - Math.floor(n);

	return {
		lat: Math.round(lat_d*GPS_PRECISION),
		lng: -Math.round(lng_d*GPS_PRECISION)
	};
}
function decodeCoords(coords)
{
	return {
		lat: (coords.lat/GPS_PRECISION)+37,
		lng: (coords.lng/GPS_PRECISION)-121
	};
}
function markerToCoords(marker)
{
	return {
		lat: marker.position.lat(),
		lng: marker.position.lng()
	};
}

// Adds a marker to the map and push to the array.
function changeTarget(location, icon)
{
	if(GPS_Marker.target) { GPS_Marker.target.setMap(null); }

	GPS_Marker.target = new google.maps.Marker({
		position: location,
		map: map,
		icon: icon
	});
	GPS_Positions.Target_Coordinates = {
		lat: location.lat(),
		lng: location.lng()
	};

	GPS_Positions.Target_Coordinates['encoded'] = encodeCoords(GPS_Positions.Target_Coordinates);
	//// NOTE: FOR testing GPS purposes
	//GPS_Positions.waypoints = [ markerToCoords(GPS_Marker.target) ];
	calculateAndDisplayRoute(directionsDisplay, directionsService, stepDisplay, map);
}

function createCar(location, rotation)
{
	if(GPS_Marker.car) { car.setMap(null); }
	if(GPS_Marker.heading) { car.setMap(null); }

	icons['car'].rotation = feedback.heading.current;
	icons['heading'].rotation = feedback.heading.target;

	GPS_Marker.heading = new google.maps.Marker({
		position: location,
		map: map,
		icon: icons['heading']
	});
	GPS_Marker.car = new google.maps.Marker({
		position: location,
		map: map,
		icon: icons['car']
	});
}

function updateCar()
{
	icons['car'].rotation = feedback.heading.current;
	icons['heading'].rotation = feedback.heading.target;

	GPS_Marker.car.setPosition(new google.maps.LatLng(GPS_Positions.Current.lat, GPS_Positions.Current.lng));
	GPS_Marker.heading.setPosition(new google.maps.LatLng(GPS_Positions.Current.lat, GPS_Positions.Current.lng));

	GPS_Marker.car.setIcon(icons['car']);
	GPS_Marker.heading.setIcon(icons['heading']);
}
function calculateAndDisplayRoute(directionsDisplay, directionsService, stepDisplay, map)
{
	// First, remove any existing markers from the map.
	if(GPS_Marker.waypoints instanceof Array)
	{
		for (var i = 0; i < GPS_Marker.waypoints.length; i++)
		{
			GPS_Marker.waypoints[i].setMap(null);
		}
	}
	// Retrieve the start and end locations and create a DirectionsRequest using
	// WALKING directions.
	directionsService.route({
		origin: GPS_Positions.Current,
		destination: GPS_Positions.Target_Coordinates,
		travelMode: 'WALKING'
	}, function(response, status)
	{
		// Route the directions and pass the response to a function to create
		// markers for each step.
		if (status === 'OK')
		{
			directionsDisplay.setDirections(response);
			showSteps(response, stepDisplay, map);
		}
		else
		{
			window.alert('Directions request failed due to ' + status);
		}
	});
}

function showSteps(directionResult, stepDisplay, map)
{
	var RCCarPath = directionsDisplay.directions.routes[0].overview_path;

	GPS_Positions.waypoints = [];
	GPS_Marker.waypoints = [];

	for (var i = 1; i < RCCarPath.length; i++)
	{
		var marker = new google.maps.Marker;
		marker.setMap(map);
		marker.setIcon(icons['waypoint']);
		marker.setPosition(RCCarPath[i]);

		GPS_Marker.waypoints.push(marker);

		GPS_Positions.waypoints.push({
			lat: RCCarPath[i].lat(),
			lng: RCCarPath[i].lng(),
		});
	}
	GPS_Positions.waypoints.push(markerToCoords(GPS_Marker.target));
}

function initializeGoogleMaps()
{
	icons = {
		car: {
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			scale: 4,
			rotation: 45,
			fillColor: "cyan",
			fillOpacity: 1.0,
			strokeWeight: 2,
			anchor: new google.maps.Point(0, 3)
		},
		heading: {
			path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
			scale: 4,
			rotation: 45,
			// fillOpacity: 1.0,
			strokeWeight: 2,
			strokeColor: "red",
			anchor: new google.maps.Point(0, 3)
		},
		self: {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 4,
			fillColor: "grey",
			fillOpacity: 1.0,
			strokeWeight: 2
		},
		target: {
			path: "M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 21.949v-4.949h-2v4.949c-4.717-.47-8.479-4.232-8.949-8.949h4.949v-2h-4.949c.47-4.717 4.232-8.479 8.949-8.949v4.949h2v-4.949c4.717.471 8.479 4.232 8.949 8.949h-4.949v2h4.949c-.47 4.717-4.232 8.479-8.949 8.949z",
			scale: 1,
			anchor: new google.maps.Point(12, 12),
			strokeColor: "red"
		},
		sent_target: {
			path: "M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 21.949v-4.949h-2v4.949c-4.717-.47-8.479-4.232-8.949-8.949h4.949v-2h-4.949c.47-4.717 4.232-8.479 8.949-8.949v4.949h2v-4.949c4.717.471 8.479 4.232 8.949 8.949h-4.949v2h4.949c-.47 4.717-4.232 8.479-8.949 8.949z",
			scale: 1,
			anchor: new google.maps.Point(12, 12),
			strokeColor: "green"
		},
		waypoint: {
			path: "M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 21.949v-4.949h-2v4.949c-4.717-.47-8.479-4.232-8.949-8.949h4.949v-2h-4.949c.47-4.717 4.232-8.479 8.949-8.949v4.949h2v-4.949c4.717.471 8.479 4.232 8.949 8.949h-4.949v2h4.949c-.47 4.717-4.232 8.479-8.949 8.949z",
			scale: 1,
			anchor: new google.maps.Point(12, 12)
		},
		sent_waypoint: {
			path: "M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 21.949v-4.949h-2v4.949c-4.717-.47-8.479-4.232-8.949-8.949h4.949v-2h-4.949c.47-4.717 4.232-8.479 8.949-8.949v4.949h2v-4.949c4.717.471 8.479 4.232 8.949 8.949h-4.949v2h4.949c-.47 4.717-4.232 8.479-8.949 8.949z",
			scale: 1,
			anchor: new google.maps.Point(12, 12),
			strokeColor: "blue"
		}
	};
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 18,
		center: GPS_Positions.SJSU,
		styles: [{
			"featureType": "poi",
			"stylers": [{ "visibility": "off" }]
		}]
		//mapTypeId: 'satellite'
	});
	//// Instantiate a directions service.
	directionsService = new google.maps.DirectionsService;
	//// Create a renderer for directions and bind it to the map.
	directionsDisplay = new google.maps.DirectionsRenderer({
		map: map,
		preserveViewport: true,
		suppressMarkers: true,
	});
	//// Instantiate an info window to hold step text.
	stepDisplay = new google.maps.InfoWindow;
	//// Adds a marker at the center of the map.
	createCar(GPS_Positions.Current, 0);
	//// Update rotation
	setInterval(updateCar, 100);
	//// Setup google maps on click event
	google.maps.event.addListener(map, "click", function(event)
	{
		if(typeof GPS_Marker.waypoints !== "undefined" && send_iteration != 0)
		{
			if(confirm("Are you sure you want to change your waypoint?"))
			{
				send_iteration = 0;
				CarIsEnabled = false;
				document.querySelector('#enable').click();
				changeTarget(event.latLng, icons['target']);
			}
		}
		else
		{
			changeTarget(event.latLng, icons['target']);
		}
	});
}