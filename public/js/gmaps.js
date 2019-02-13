// GLOBALS
// ======================================================

var directionsService;
var directionsDisplay;
var wayPoints;
var distance;
var icon;
var map;

// USER INFO ON SIGN IN
// ========================================

var user = {
    userId: localStorage.getItem("userId"),
    userEmail: localStorage.getItem("userEmail"),
    userName: localStorage.getItem("userName"),
  };
  
  console.log("userid" + user.userId);


// INITIALIZE MAP
// ======================================================

function initMap() {

    // Map style settings
    // Turn off points of interest
    var myStyles = [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ];

    // Set up map centered around Seattle
    // ======================================================

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: { lat: 47.60453, lng: -122.33422 },
        draggableCursor: "crosshair",
        styles: myStyles
    });

    // Set up Direction Tools
    // ======================================================

    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        // draggable: true,
        preserveViewport: true,
        suppressMarkers: true
    });

    directionsDisplay.setMap(map);

    // Calculate and Draw Routes
    // ======================================================

    wayPoints = [];

    // Initially disable Map Control Box buttons
    $("#saveRoute").disabled = true;
    $("#undoLast").disabled = true;
    $("#loopRoute").disabled = true;
    $("#clearRoute").disabled = true;

    // Listen for user clicks on map
    // Calculate and update directions display
    google.maps.event.addListener(map, 'click', function (event) {

        // Clear save confirmation message
        setConfirmMsg("clear");

        wayPoints.push({
            location: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
        });

        // If this is the first point, put a marker there
        if (wayPoints.length == 1) {
            icon = getStartIcon(wayPoints[0].location);
        }

        // Enable/disable Map Control Box buttons
        if (wayPoints.length >= 1) {
            $("#saveRoute").disabled = false;
            $("#undoLast").disabled = false;
            $("#loopRoute").disabled = false;
            $("#clearRoute").disabled = false;
        }
        else {
            $("#saveRoute").disabled = true;
            $("#undoLast").disabled = true;
            $("#loopRoute").disabled = true;
            $("#clearRoute").disabled = true;
        }

        // If at least one wayPoint present, calculate route
        if (wayPoints.length > 1) {
            calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
        }
    });

    // Event handlers for Map Control Buttons
    // ======================================================

    $("#saveRoute").on("click", saveRoute);
    $("#clearRoute").on("click", clearRoute);
    $("#undoLast").on("click", undoLast);
    $("#loopRoute").on("click", loopRoute);
}

// GET START ICON
// ======================================================

function getStartIcon(position) {
    
    // Google libraries of map marker icons
    var startIcon = "http://maps.google.com/mapfiles/arrow.png";

    icon = new google.maps.Marker({
        position: position,
        icon: startIcon,
        map: map
    });

    return icon;
}

// CALCULATE AND DISPLAY ROUTE
// ======================================================

function calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints) {

    distance = 0;
    var meters = 0;
    const metersToMiles = 0.000621371192;

    directionsService.route({
        origin: wayPoints[0],
        waypoints: wayPoints,
        destination: wayPoints[wayPoints.length - 1],
        optimizeWaypoints: false,
        travelMode: 'WALKING'
    },
        function (response, status) {
            // console.log(response);

            // Sum up the distance (in meters) of each leg of route
            for (var i = 0; i < response.routes[0].legs.length; i++) {
                meters += response.routes[0].legs[i].distance.value;
            }

            // Convert total distance from meters to miles
            distance = Math.round((meters * metersToMiles) * 100) / 100;

            $("#distance").text(distance + " mi.");

            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
}

// LOOP ROUTE (OUT AND BACK)
// ======================================================

function loopRoute() {

    var reverseWayPoints = wayPoints.reverse(); 
    var length = reverseWayPoints.length; // So that length doesn't update in for loop

    for (var i=length-1; i>=0; i--) {
        wayPoints.push(reverseWayPoints[i]);
    }

    calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
}

// API CALLS
// ======================================================

var API = {
    saveRoute: function (route) {
        return $.ajax({
            headers: {
                "Content-Type": "application/json"
            },
            url: "api/saveRoute",
            type: "POST",
            data: JSON.stringify(route)
        });
    },

    loadRoute: function(route) {
        return $.ajax({
            url: "api/loadRoute/" + route.name,
            type: "GET"
        });
    }
};

// SAVE ROUTE
// ======================================================

function saveRoute(event) {
    event.preventDefault();

    var routeName = "";

    var newRoute = {
        name: routeName,
        distance: distance,
        wayPoints: JSON.stringify(wayPoints),
        icon: JSON.stringify(icon.position),
        UserId: user.userId
    }

    // console.log(newRoute);

    API.saveRoute(newRoute).then(function (response) {
        console.log("Saving...");
        console.log(response);
    });

    // *** Move into API callback function
    setConfirmMsg("save");
}

function setConfirmMsg(key) {

    var message;

    switch(key) {
        case "save": message = "Route saved!"; break;
        case "clear": message = ""; break;
        default: message = "";
    }

    $("#confirmSave").text(message);
}

// LOAD ROUTE
// ======================================================

function loadRoute(event) {
    event.preventDefault();

    // *** TEMPORARY. Change to more elegant later ***
    var routeName = prompt("Enter name of route to load: ");

    var route = {
        name: routeName
    }
    
    // Clear icons
    if (icon != null) {
        icon.setMap(null);
    }

    API.loadRoute(route).then(function(response) {
        console.log("Loading...");

        // Get stored waypoints for route
        wayPoints = JSON.parse(response.wayPoints);

        // Get stored icon location
        iconLocation = JSON.parse(response.icon);

        getStartIcon(iconLocation);

        // Draw route on map
        calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
    });
}

// UNDO LAST
// ======================================================

function undoLast(event) {
    event.preventDefault();

    wayPoints.pop();

    // If waypoints are emptied, clear markers from map
    if (wayPoints.length == 0) {
        icon.setMap(null);
    }

    calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
}

// CLEAR ROUTE
// ======================================================

function clearRoute(event) {
    event.preventDefault();

    // Clear save confirmation message
    setConfirmMsg("clear");

    // Clear waypoints
    wayPoints = [];

    // Clear icons
    if (icon != null) {
        icon.setMap(null);
    }

    $("#distance").text("0.0 mi.");

    // Erase route from map
    directionsDisplay.set("directions", null);
}
