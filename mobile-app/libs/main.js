// =====================================
// Variable Declaration
// =====================================

// Redirect console.log to Evothings Workbench.
if (window.hyper && window.hyper.log) { console.log = hyper.log }

var bluetoothSerial = {};
bluetoothSerial.write = function() {};

const DEBUG = false;
// =====================================
// Window Setup
// =====================================
$(".dial").knob({
	draw : function ()
	{
		// "tron" case
		if(this.$.data('skin') == 'tron')
		{

			var a = this.angle(this.cv)  // Angle
				, sa = this.startAngle          // Previous start angle
				, sat = this.startAngle         // Start angle
				, ea                            // Previous end angle
				, eat = sat + a                 // End angle
				, r = 1;

			this.g.lineWidth = this.lineWidth;

			this.o.cursor
				&& (sat = eat - 0.3)
				&& (eat = eat + 0.3);

			if (this.o.displayPrevious)
			{
				ea = this.startAngle + this.angle(this.v);
				this.o.cursor
					&& (sa = ea - 0.3)
					&& (ea = ea + 0.3);
				this.g.beginPath();
				this.g.strokeStyle = this.pColor;
				this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
				this.g.stroke();
			}

			this.g.beginPath();
			this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
			this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
			this.g.stroke();

			this.g.lineWidth = 2;
			this.g.beginPath();
			this.g.strokeStyle = this.o.fgColor;
			this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
			this.g.stroke();

			return false;
		}
	}
});
// =====================================
// HTML5 Window Hardware Setup
// =====================================

var currently_processing_location = false;
function geoFindMe(callback)
{
	if (!navigator.geolocation){
	  console.log("Geolocation is not supported by your browser");
	  return;
	}

	function success(position)
	{
		var latitude  = position.coords.latitude;
		var longitude = position.coords.longitude;

		//console.log('Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°');

		if(GPS_Marker.selfie) {
			GPS_Marker.selfie.setPosition({
				lat: latitude,
				lng: longitude
			});
		}
		else
		{
			GPS_Marker.selfie = new google.maps.Marker(
			{
				position:
				{
					lat: latitude,
					lng: longitude
				},
				map: map,
				icon: icons['self']
			});
		}
		currently_processing_location = false;
		if(typeof callback === "function")
		{
			callback({
				lat: latitude,
				lng: longitude
			});
		}
	};
	function error()
	{
	  console.log("Unable to retrieve your location");
	};
	if(currently_processing_location === false)
	{
		//console.log("Locating...");
		currently_processing_location = true;
		var ua = navigator.userAgent.toLowerCase(),
        geoTimeout = (ua.indexOf("android") > -1) ? '15000' : '1000';

		navigator.geolocation.getCurrentPosition(success, error, {
			enableHighAccuracy: true,
			maximumAge: 3000,
			timeout: geoTimeout
		});
	}
}

//// doing the example from the Docs to learn
// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, 3,1,1000);
// var renderer = new THREE.WebGLRenderer({
// 	//alpha: true,
// });
// renderer.setSize( 450, 250 );
// // tried this a little different from the example in docs
// document.querySelector("#webgl-container").appendChild(renderer.domElement);
// //  This is where introtowebgl uses CubeGeometry
// var geometry = new THREE.ConeGeometry( 3, 3, 10 );
// var material = new THREE.MeshBasicMaterial({
// 	color: "red",
// 	wireframe: true
// });
// var cube = new THREE.Mesh(geometry,material);
// console.log(cube.rotation);
// scene.add(cube);
// camera.position.z = 3;

// function render()
// {
// 	requestAnimationFrame(render);
// 	cube.rotation.x = degtorad(feedback.orientation.roll);
// 	//cube.rotation.y += .04;
// 	renderer.render(scene,camera);
// }
// render();


// var scroll_timeout;
// window.addEventListener('scroll', function(e)
// {
// 	if(DEBUG)
// 	{
// 		clearInterval(debug_interval);
// 		clearTimeout(scroll_timeout);
// 		scroll_timeout = setTimeout(function()
// 		{
// 			debug_interval = setInterval(debug_function, 100);
// 		}, 50);
// 	}
// });

function degtorad(deg) { return deg*(Math.PI/180); }

var a=0,b=5,c=10,d=0,e=20,f=0,hb=0,cs=0,ts=0,v=0,ch=0,th=0;
var i = 0;
const MAX_DISTANCE = 645;
const MAX_SPEED = 15;
var debug_interval, update_telemetry;

var debug_function = function()
{
	window.requestAnimationFrame(function()
	{
		a = Math.round(((MAX_DISTANCE/2)*Math.sin(degtorad(i)))+(MAX_DISTANCE/2));
		b = Math.round(((MAX_DISTANCE/2)*Math.sin(degtorad(i)))+(MAX_DISTANCE/2));
		c = Math.round(((MAX_DISTANCE/2)*Math.sin(degtorad(i)))+(MAX_DISTANCE/2));
		d = Math.round(((MAX_DISTANCE/2)*Math.sin(degtorad(i)))+(MAX_DISTANCE/2));
		e = Math.round(((MAX_DISTANCE/2)*Math.sin(degtorad(i)))+(MAX_DISTANCE/2));
		f = Math.round(((MAX_DISTANCE/2)*Math.sin(degtorad(i)))+(MAX_DISTANCE/2));

		hb++;
		ts = 5;
		cs = ((ts/1.25)*Math.sin(degtorad(i*10)))+(ts+0.25);
		v = (2*Math.cos(i/10))+11.1;
		var tmp = Math.round((100*Math.sin(degtorad(i*10))));
		var tmp2 = Math.round((100*Math.sin(degtorad(-i*10))));
		var tmp3 = Math.round((.5)*Math.sin(degtorad(i*10))+.5);

		ch = (tmp < 0) ? (360+tmp) : tmp;
		th = (tmp2 < 0) ? (360+tmp2) : tmp2;

		bluetooth_procedure.recieve_successful(`S:${a},${b},${c},${d},${e},${f}`);
		bluetooth_procedure.recieve_successful(`H:${ch},0`);
		bluetooth_procedure.recieve_successful(`V:${v}`);
		bluetooth_procedure.recieve_successful(`HB:${hb}`);
		bluetooth_procedure.recieve_successful(`MM:${ts},0`);
		bluetooth_procedure.recieve_successful(`T:${cs}`);
		bluetooth_procedure.recieve_successful(`TH:${th}`);
		bluetooth_procedure.recieve_successful(`D:${tmp3}`);

		i++;

		feedback.orientation.roll = ((90)*Math.sin(degtorad(i*10)));
    });
};

if(DEBUG)
{
	debug_interval = setInterval(debug_function, 100);
}

update_telemetry = setInterval(function()
{
	window.requestAnimationFrame(function() {
		$("input#speed").trigger('configure', { fgColor: feedback.speed.color, inputColor: feedback.speed.color });
		$("input#speed").val(linearSpeed(feedback.speed.current)).trigger('change');

		$("input#tspeed").trigger('configure', { fgColor: "#2DD700", inputColor: "#2DD700" });
		$("input#tspeed").val(linearSpeed(feedback.speed.target));
		$("input#tspeed").trigger('change');

		$("input#heading").trigger('configure', { fgColor: feedback.heading.color, inputColor: feedback.heading.color });
		$("input#heading").val(feedback.heading.current).trigger('change');

		$("input#theading").trigger('configure', { fgColor: feedback.heading.target_color, inputColor: feedback.heading.target_color });
		$("input#theading").val(feedback.heading.target).trigger('change');

		//console.log(feedback.orientation.pitch);

		var progress = document.querySelector("#state-of-charge");
		feedback.charge.voltage = ((3.3*(feedback.charge.adc/Math.pow(2,10)))+MIN_VOLTAGE)*1.068181818;
		feedback.charge.voltage -= .40;
		feedback.charge.voltage = (feedback.charge.voltage < 0) ? 0 : feedback.charge.voltage;
		// console.log(feedback.charge.voltage);
		feedback.charge.soc = 100*((feedback.charge.voltage-MIN_VOLTAGE)/(MAX_VOLTAGE-MIN_VOLTAGE));
		if(feedback.charge.adc < 0)
		{
			feedback.charge.color = "grey";
			feedback.charge.soc = 100;
			feedback.charge.voltage = 12.6;
		}
		else if(feedback.charge.soc < 33)
		{
			feedback.charge.color = "danger active";
		}
		else if(feedback.charge.soc < 66)
		{
			feedback.charge.color = "warning active";
		}
		else
		{
			feedback.charge.color = "success active";
		}
		progress.style.width = `${feedback.charge.soc}%`;
		progress.className = `progress-bar progress-bar-striped progress-bar-${feedback.charge.color}`;
		progress.innerHTML = `<span> (${Math.round(feedback.charge.soc)}%) Voltage (${feedback.charge.voltage.toFixed(3)}V) </span>`;
	});
}, 100);

setInterval(function()
{
	geoFindMe();
}, 1000);