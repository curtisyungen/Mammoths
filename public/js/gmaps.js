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

//console.log("userid" + user.userId);

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

    $("#searchAddress").on("click", openAddressModal);
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
    var endIconImg = "http://www.google.com/mapfiles/dd-end.png";

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

    const metersToMiles = 0.000621371192;
    var meters = 0;
    
    var origin = wayPoints[0].location;
    var destination = wayPoints[wayPoints.length - 1].location;

    // Cut off origin and destination to avoid duplication
    var stops = [];
    for (var i=1; i<wayPoints.length-1; i++) {
        stops.push(wayPoints[i]);
    }
    
    distance = 0;

    directionsService.route({
        origin: origin,
        waypoints: stops,
        destination: destination,
        optimizeWaypoints: false,
        provideRouteAlternatives: false,
        travelMode: 'WALKING'
    },
        function (response, status) {
            //console.log(response);

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
            endIcon = getEndIcon(destination);
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

// SEARCH ADDRESS
// ======================================================

// Open modal to enter address
function openAddressModal(event) {
    event.preventDefault();

    $("#searchAddressModal").show();
    $("#modal-address").focus();
}

// Event handler to close modal and search address
$("#closeAddressModal").on("click", function(event) {
    event.preventDefault();

    var address = $("#modal-address").val().trim();
    $("#modal-address").val("");

    if (address != null && address != "") {
        $("#searchAddressModal").hide();
        changeAddress(address);
    }
    else {
        alert("Please enter a name for this route.");
    }
});

// Event handler to cancel and close modal without searching address
$("#cancelAddressModal").on("click", function(event) {
    event.preventDefault();
    
    $("#modal-address").val("");
    $("#searchAddressModal").hide();
});

// Change address
function changeAddress(address) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({"address": address}, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            map.setZoom(15);
        } 
        else {
            alert("Geocode error: " + status);
        }
    });
}

// SAVE ROUTE
// ======================================================

// Open modal to enter route name
function openModal(event) {
    event.preventDefault();

    $("#nameRouteModal").show();
    $("#modal-routeName").focus();
}

// Event handler to close modal and save route
$("#closeNameRouteModal").on("click", function(event) {
    event.preventDefault();

    var name = $("#modal-routeName").val().trim();
    var location = $("#modal-location").val().trim();

    if (name != null && name != "") {
        $("#nameRouteModal").hide();
        saveRoute(name, location);
    }
    else {
        alert("Please enter a name for this route.");
    }
});

// Event handler to cancel and close modal without saving route
$("#cancelNameRouteModal").on("click", function(event) {
    event.preventDefault();

    $("#nameRouteModal").hide();
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

        API.saveRoute(newRoute);

        setTimeout(setConfirmMsg("save"), 1000);
        checkShowRoutes();      
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

// LOOP ROUTE (OUT AND BACK)
// ======================================================

function loopRoute() {

    var wayPointCopy = wayPoints;
    var length = wayPointCopy.length; // So that length doesn't update in for loop

    // Add way points onto route in reverse order
    for (var i=length-1; i>=0; i--) {
        wayPoints.push(wayPointCopy[i]);
    }

    calculateAndDisplayRoute(directionsService, directionsDisplay, wayPoints);
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
        endIcon.setMap(null);
        
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
