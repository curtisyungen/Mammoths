// GLOBALS
// ======================================================

var directionsService;
var directionsDisplay;
var wayPoints;
var distance;
var startIcon;
var endIcon;
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
    toggleMapBoxBtns(true);

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
            startIcon = getStartIcon(wayPoints[0].location);
        }

        // If at least one wayPoint present, calculate route
        if (wayPoints.length > 1) {
            toggleMapBoxBtns(false); // enable map control buttons
            calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
        }
        else {
            toggleMapBoxBtns(true); // disable map control buttons
        }
    });

    // Event handlers for Map Control Buttons
    // ======================================================

    $("#saveRoute").on("click", openModal);
    $("#clearRoute").on("click", clearRoute);
    $("#undoLast").on("click", undoLast);
    $("#loopRoute").on("click", loopRoute);
}

// MAP BOX CONTROLS: ENABLE/DISABLE BUTTONS
// ======================================================

function toggleMapBoxBtns(key) {
    $("#saveRoute").prop("disabled", key);
    $("#undoLast").prop("disabled", key);
    $("#loopRoute").prop("disabled", key);
}

// GET START ICON
// ======================================================

function getStartIcon(position) {

    // Google libraries of map marker icons
    var startIconImg = "http://maps.google.com/mapfiles/arrow.png";

    startIcon = new google.maps.Marker({
        position: position,
        icon: startIconImg,
        map: map
    });

    return startIcon;
}

// GET END ICON
// ======================================================

function getEndIcon(position) {

    // Google libraries of map marker icons
    endIconImg = "http://www.google.com/mapfiles/dd-end.png";

    endIcon = new google.maps.Marker({
        position: position,
        icon: endIconImg,
        map: map
    });

    return endIcon;
}

// CALCULATE AND DISPLAY ROUTE
// ======================================================

function calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints) {

    distance = 0;
    var meters = 0;
    const metersToMiles = 0.000621371192;
    var destination = wayPoints[wayPoints.length - 1];

    directionsService.route({
        origin: wayPoints[0],
        waypoints: wayPoints,
        destination: destination,
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

            // Reset end icon
            if (endIcon != null) {
                endIcon.setMap(null);
            }
            endIcon = getEndIcon(destination.location);
        });
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

    loadRoute: function (route) {
        return $.ajax({
            url: "api/loadRoute/" + route.name,
            type: "GET"
        });
    }
};

// SAVE ROUTE
// ======================================================

// Open modal to enter route name
function openModal(event) {
    event.preventDefault();

    var modal = $("#nameRouteModal");
    modal.show();
    $("#modal-routeName").focus();
}

// Event handler to close modal and save route
$("#closeNameRouteModal").on("click", function(event) {
    event.preventDefault();

    $("#nameRouteModal").hide();

    var name = $("#modal-routeName").val().trim();
    var location = $("#modal-location").val().trim();

    saveRoute(name, location);
});

// Save route to database
function saveRoute(routeName, location) {  

    var newRoute = {
        name: routeName,
        location: location,
        distance: distance,
        wayPoints: JSON.stringify(wayPoints),
        startIcon: JSON.stringify(startIcon.position),
        endIcon: JSON.stringify(endIcon.position),
        UserId: user.userId
    }

    if (routeName != null & routeName != "") {
        console.log("Saving...");

        API.saveRoute(newRoute);

        setTimeout(setConfirmMsg("save"), 1000);
    }
}

// "Route saved" confirmation message
function setConfirmMsg(key) {

    var message;

    switch (key) {
        case "save": message = "Route saved!"; break;
        case "clear": message = ""; break;
        case "saving": message = "Saving..."; break;
        default: message = "";
    }

    $("#confirmSave").text(message);
}

// LOOP ROUTE (OUT AND BACK)
// ======================================================

function loopRoute() {

    var reverseWayPoints = wayPoints.reverse();
    var length = reverseWayPoints.length; // So that length doesn't update in for loop

    // Add reversed way points onto route
    for (var i = 0; i < length; i++) {
        wayPoints.push(reverseWayPoints[i]);
    }

    calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
}

// LOAD ROUTE
// ======================================================

$("#showRoutes").on("change", loadRoute);

function loadRoute() {

    var routeName = $("#showRoutes").val().split(":")[0].toString();

    var route = {
        name: routeName
    }

    // Clear icons
    if (startIcon != null) {
        startIcon.setMap(null);
    }

    if (endIcon != null) {
        endIcon.setMap(null);
    }

    API.loadRoute(route).then(function (response) {
        console.log("Loading...");

        // Get stored waypoints for route
        wayPoints = JSON.parse(response.wayPoints);

        // Get stored icon location
        startIconLoc = JSON.parse(response.startIcon);
        endIconLoc = JSON.parse(response.endIcon);

        // Set an icons at loaded locations
        getStartIcon(startIconLoc);
        getEndIcon(endIconLoc);

        // Draw route on map
        calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
    });
}

// UNDO LAST
// ======================================================

function undoLast(event) {
    event.preventDefault();

    // Remove last waypoint from array
    wayPoints.pop();

    // If waypoints are emptied, clear markers from map
    if (wayPoints.length == 0) {
        startIcon.setMap(null);

        toggleMapBoxBtns(true); // disable map control buttons
    }

    // Redraw route on map
    calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
}

// CLEAR ROUTE
// ======================================================

function clearRoute(event) {
    event.preventDefault();

    // Clear save confirmation message
    setConfirmMsg("clear");

    // Disable map control buttons
    toggleMapBoxBtns(true);
    
    // Clear entry form
    $("#showRoutes").val("");
    $("#distanceForm").val("");
    $("#locationForm").val("");

    // Clear waypoints
    wayPoints = [];

    // Clear start icon
    if (startIcon != null) {
        startIcon.setMap(null);
    }

    // Clear end icon
    if (endIcon != null) {
        endIcon.setMap(null);
    }

    // Reset distance text
    $("#distance").text("0.0 mi.");

    // Erase route from map
    directionsDisplay.set("directions", null);
}
