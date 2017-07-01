//// Connection procedure
var connect_btn = document.querySelector("#connect");
var map_view = document.querySelector("#map-view");
var tele_view = document.querySelector("#telemetry-view");
var view_navi_btn = document.querySelector("#view-change");
var log_textarea = document.querySelector("#log");

var bluetooth_procedure = {
	disconnect: function()
	{
		connect_btn.className = "btn btn-warning btn-block";
		connect_btn.innerHTML = "Connect";
	},
	connect: function()
	{
		connect_btn.className = "btn btn-success btn-block";
		connect_btn.innerHTML = "Connected";
	},
	attempt_to_connect: function()
	{
		message_log("ATTEMPTING TO CONNECT!");
		bluetoothSerial.isConnected(bluetooth_procedure.connect_procedure, function()
		{
			bluetoothSerial.connect('30:14:06:24:01:80',
				function()
				{
					message_log("CONNECTION SUCCESSFUL!");
					bluetooth_procedure.connect();
				},
				function()
				{
					message_log("FAILED TO CONNECT!");
					bluetooth_procedure.disconnect();
				}
			);
		});
	},
	recieve_successful: function(data)
	{
		for (var i = 0; i < message_handler_struct.length; i++)
		{
			if(data.match(message_handler_struct[i].trigger))
			{
				message_handler_struct[i].action(data);
				//message_log(data);
				return;
			}
		}
		data = `INVALID: "${data}"`;
		message_log(data);
	}
};


const MAX_VOLTAGE = 12.6;
const MIN_VOLTAGE = 9;

var feedback = {
	speed: {
		current: 0,
		target: 0,
		linear_current: 0,
		linear_target: 0,
		error: 0,
		color: 'grey'
	},
	heading: {
		steering: 0,
		target: 0,
		current: 0,
		error: 0,
		color: 'grey',
		target_color: 'grey'
	},
	orientation: {
		pitch: 0,
		roll: 0,
		color: 'grey'
	},
	sonar: [ 0, 0, 0, 0, 0, 0 ],
	charge: {
		voltage: 12.587,
		soc: 0,
		adc: -1,
		color: 'grey'
	},
	heartbeat: 0
}

const TICKS_PER_REV = 8;
const SECONDS_PER_TICK = .5;
const WHEEL_DIAMETER = 10.16; // cm

var CarIsEnabled = true;
var CurrentView = "maps";

function linearSpeed(input)
{
	return (1/TICKS_PER_REV)*(1/SECONDS_PER_TICK)*input*(Math.PI*WHEEL_DIAMETER);
}


function message_log(msg)
{
	this.log_buffer = (typeof this.log_buffer == "undefined") ? "" : this.log_buffer;
	var line_count = (this.log_buffer.match(/\n/g) || []).length;
	if(line_count >= 25)
	{
		this.log_buffer = this.log_buffer.substring(this.log_buffer.indexOf("\n") + 1);
	}
	this.log_buffer += `[${(new Date().toString()).substring(0, 24).substring(4)}] ${msg}\n`;
	log_textarea.innerHTML = this.log_buffer;
	log_textarea.scrollTop = log_textarea.scrollHeight;
	console.log(msg);
}

// =====================================
// Event Listeners
// =====================================
//// Attach click listener to #view-change button
view_navi_btn.addEventListener('click', function()
{
	switch(CurrentView)
	{
		case "maps":
			map_view.style.left = '-100%';
			map_view.style.visibility = 'hidden';
			tele_view.style.left = '0px';
			tele_view.style.visibility = 'visible';
			view_navi_btn.className = "btn btn-info btn-block";
			view_navi_btn.innerHTML = "Maps";
			CurrentView = "telemetry";
			break;
		case "telemetry":
			tele_view.style.left = '-100%';
			tele_view.style.visibility = 'hidden';
			map_view.style.left = '0px';
			map_view.style.visibility = 'visible';
			view_navi_btn.className = "btn btn-info btn-block";
			view_navi_btn.innerHTML = "Telemetry";
			CurrentView = "maps";
			break;
	}
});


var message_handler_struct = [
	{
		trigger: /^T:[0-9]+/g,
		action: function(data)
		{
			feedback.speed.current = parseInt(data.replace("T:", ""));
			feedback.speed.error = Math.abs(feedback.speed.current-feedback.speed.target);
			var color = "red";
			if(feedback.speed.error <= 1)
			{
				feedback.speed.color = "#2DD700";
			}
			else if(feedback.speed.error <= 3)
			{
				feedback.speed.color = "orange";
			}
		}
	},
	{
		trigger: /^MM:[\-0-9]+,[\-0-9]+/g,
		action: function(data)
		{
			var tmp = data.replace("MM:", "");
			tmp = tmp.split(',');
			feedback.speed.target = tmp[0];
			feedback.heading.steering = tmp[1];
			//feedback.heading.target_color = "#2DD700";
		}
	},
	{
		trigger: /^H:[0-9]+,[0-9]+/g,
		action: function(data)
		{
			var tmp = data.replace("H:", "");
			tmp = tmp.split(',');

			feedback.heading.current = parseInt(tmp[0]);
			feedback.orientation.pitch = parseInt(tmp[1]);

			var tmp = feedback.heading.current-feedback.heading.target;
			feedback.heading.error = Math.abs(((tmp + 180) % 360) - 180);
			var color = "red";
			if(feedback.heading.error < 12.75)
			{
				feedback.heading.color = "#2DD700";
			}
			else if(feedback.heading.error < 45)
			{
				feedback.heading.color = "orange";
			}
		}
	},
	{
		trigger: /^TH:[0-9]+/g,
		action: function(data)
		{
			feedback.heading.target = parseInt(data.replace("TH:", ""));
			feedback.heading.target_color = "blue";
		}
	},
	{
		trigger: /^V:[0-9]+/g,
		action: function(data)
		{
			// var progress = document.querySelector("#state-of-charge");

			// feedback.charge.voltage = parseInt(data.replace("V:", ""));
			// feedback.charge.soc = 100*((feedback.charge.voltage-MIN_VOLTAGE)/(MAX_VOLTAGE-MIN_VOLTAGE));
			// var color = "#2DD700";
			// if(feedback.charge.soc < 33)
			// {
			// 	feedback.charge.color = "danger";
			// }
			// else if(feedback.charge.soc < 66)
			// {
			// 	feedback.charge.color = "warning";
			// }
			// else
			// {
			// 	feedback.charge.color = "success";
			// }
			// progress.style.width = `${feedback.charge.soc}%`;
			// progress.className = `progress-bar progress-bar-${feedback.charge.color} progress-bar-striped active`;
			// progress.innerHTML = `<span> (${Math.round(feedback.charge.soc)}%) Voltage (${feedback.charge.voltage}V) </span>`;
		}
	},
	{
		trigger: /^L:[0-9]+,[\-0-9]+/g,
		action: function(data)
		{
			var tmp = data.replace("L:", "");
			tmp = tmp.split(',');
			GPS_Positions.Current = decodeCoords({
				lat: parseInt(tmp[0]),
				lng: parseInt(tmp[1]),
			});
		}
	},
	{
		trigger: /^D:[01]+/g,
		action: function(data)
		{
			var tmp = parseInt(data.replace("D:", ""));
			var progress = document.querySelector("#gps-progress");
			if(tmp == 1)
			{
				progress.className = "progress-bar progress-bar-success progress-bar-striped active";
				progress.innerHTML = "<span>Destination Reached</span>";
			}
			else
			{
				progress.className = "progress-bar progress-bar-danger progress-bar-striped active";
				progress.innerHTML = "<span>Approaching Destination</span>";
			}
		}
	},
	{
		trigger: /^S:[0-9]+,[0-9]+,[0-9]+,[0-9]+,[0-9]+,[0-9]+/g,
		action: function(data)
		{
			if(typeof this.detect_sonar_calibration == "undefined")
			{
				this.detect_sonar_calibration = false;
			}

			var tmp = data.replace("S:", "");
			feedback.sonar = tmp.split(',');
			var directions = ["north-west","north","north-east","south-west","south","south-east"];

			feedback.charge.adc = parseInt(feedback.sonar[5]);
			feedback.sonar[5] = 0;

			if(parseInt(feedback.sonar[3]) === 255 &&
				// parseInt(feedback.sonar[5]) === 255 &&
				this.detect_sonar_calibration === false)
			{
				window.navigator.vibrate([250, 100, 250, 100, 250]);
				this.detect_sonar_calibration = true;
				message_log("RECALIBRATING ULTRASOUNDS");
				document.querySelector("#heartbeat").innerHTML = `!!! RECALIBRATING ULTRASOUNDS !!!`;
				setTimeout(() => {
					this.detect_sonar_calibration = false;
				}, 1000);
			}
			for (var i = 0; i < feedback.sonar.length; i++)
			{
				if(this.detect_sonar_calibration === false)
				{
					setDistanceIndicator(directions[i], parseInt(feedback.sonar[i]));
				}
				else
				{
					setDistanceIndicator(directions[i], -1);
				}
			}
		}
	},
	{
		trigger: /^HB:[0-9]+/g,
		action: function(data)
		{
			feedback.heartbeat = parseInt(data.replace("HB:",""));
			document.querySelector("#heartbeat").innerHTML = `(${feedback.heartbeat}) HEARTBEAT (${feedback.heartbeat})`;
		}
	}
];

function setDistanceIndicator(directions, value)
{
	var colors = ["green", "orange", "red"];
	var indicator = document.querySelector(`.${directions}`);
	indicator.querySelector('span').innerHTML = `${value} cm`;
	if(value < 14 && value != -1)
	{
		document.querySelector(`.${directions}`).style.visibility = "hidden";
	}
	else
	{
		document.querySelector(`.${directions}`).style.visibility = "visible";
		if(value == -1)							{ colors = ["red", "orange", "green"]; }
		else if(value >= 14 && value <= 75)		{ colors = ["red", "red", "red"]; }
		else if(value > 75 && value <= 150)		{ colors = ["orange", "orange", "lightgrey"]; }
		else if(value > 150 && value <= 300) 	{ colors = ["green", "lightgrey", "lightgrey"]; }
		else if(value > 300) 					{ colors = ["lightgrey", "lightgrey", "lightgrey"]; }
		indicator.querySelector('.tip').style.borderBottom 		= `25px solid ${colors[0]}`;
		indicator.querySelector('.middle').style.borderBottom 	= `25px solid ${colors[1]}`;
		indicator.querySelector('.bottom').style.borderBottom 	= `25px solid ${colors[2]}`;
	}
}
//// Attach click listener to #go button
var send_iteration = 0;
document.querySelector("#go").addEventListener('click', function()
{
	if(typeof GPS_Marker.target !== "undefined")
	{
		clearTimeout(send_waypoints_interval);
		send_iteration = 0;
		var send_seq_end = function()
		{
			var msg = `-1:0|0\n`;
			bluetoothSerial.write(msg);
			GPS_Marker.target.setIcon(icons['sent_target']);
		}
		var send_waypoint = function()
		{
			way = encodeCoords(GPS_Positions.waypoints[send_iteration]);
			var msg = `${send_iteration}:${way.lat}|${way.lng}\n`;
			message_log(msg);
			bluetoothSerial.write(msg);
			if(++send_iteration !== GPS_Positions.waypoints.length)
			{
				GPS_Marker.waypoints[send_iteration-1].setIcon(icons['sent_waypoint']);
				send_waypoints_interval = setTimeout(send_waypoint, 200);
			}
			else
			{
				setTimeout(send_seq_end, 200);
			}
		};
		send_waypoint();
	}
	else
	{
		alert("Please select a point to navigate to.");
	}
});
//// Attach click listener to #return-to-user button
document.querySelector("#return-to-user").addEventListener('click', function()
{
	if(GPS_Marker.selfie)
	{
		changeTarget(new google.maps.LatLng(GPS_Marker.selfie.getPosition().lat(), GPS_Marker.selfie.getPosition().lng()), icons['target']);
	}
});
//// Attach click listener to #connect button
connect_btn.addEventListener('click', bluetooth_procedure.attempt_to_connect);
//// Attach click listener to #disconnect button
document.querySelector("#disconnect").addEventListener('click', function()
{
	window.navigator.vibrate(500);
	var isDisconnecting = confirm("Are you sure you want to disconnect from RC Car?");
	if(isDisconnecting)
	{
		bluetoothSerial.disconnect(function()
		{
			bluetooth_procedure.disconnect();
			message_log("MANUAL DISCONNECT SUCCESSFUL!");
		}, function()
		{
			message_log("MANUAL DISCONNECT FAILURE!");
		});
	}
});
document.querySelector("#ultrasound-power-cycle").addEventListener('click', function()
{
	bluetoothSerial.write("ULTRACYCLE\n");
	message_log("ULTRASOUND POWER CYCLE SIGNAL SENT!");
});

document.querySelector("#headlight-on").addEventListener('click', function()
{
	bluetoothSerial.write("HL-ON\n");
	message_log("HEADLIGHTS ON ON!");
});
document.querySelector("#headlight-off").addEventListener('click', function()
{
	bluetoothSerial.write("HL-OFF\n");
	message_log("HEADLIGHTS ON OFF!");
});
document.querySelector("#headlight-auto").addEventListener('click', function()
{
	bluetoothSerial.write("HL-AUTO\n");
	message_log("HEADLIGHTS ON AUTO!");
});

//// Attach click listener to #enable
var enable_btn = document.querySelector("#enable");
enable_btn.addEventListener('click', function()
{
	if(enable_btn.className.indexOf("disabled") == -1)
	{
		bluetoothSerial.write((CarIsEnabled) ? "START\n" : "STOP\n");
		enable_btn.innerHTML = (CarIsEnabled) ? "Enabled" : "Disabled";
		enable_btn.className = (CarIsEnabled) ? "btn btn-success btn-block" : "btn btn-danger disabled btn-block";
		//// This will hold the button as disabled for 2.5 seconds to keep the user from
		//// double tapping the enable/disable button.
		if(!CarIsEnabled)
		{
			setTimeout(function()
			{
				enable_btn.className = "btn btn-danger btn-block";
			}, 2500);
		}
		CarIsEnabled = !CarIsEnabled;
		window.navigator.vibrate(100);
	}
});

//// Device ready event listener
document.addEventListener('deviceready', function()
{
	message_log("APPLICATION IS READY!");
	message_log("Setting up bluetooth feedback listener!");
	//// Setup Bluetooth serial message listener
	bluetoothSerial.subscribe('\n', bluetooth_procedure.recieve_successful,
		function() // failure
		{
			message_log("Message Recieve Failure");
		}
	);
	if(DEBUG)
	{
		message_log("APPLICATION ON DEBUG MODE!");
	}
	else
	{
		bluetooth_procedure.attempt_to_connect();
		setInterval(function()
		{
			bluetoothSerial.isConnected(bluetooth_procedure.connect, bluetooth_procedure.disconnect);
		}, 1000);
	}
}, false);