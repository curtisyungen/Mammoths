// GLOBALS
// ======================================================

var directionsService3;
var directionsDisplay3;
var wayPoints3;
var routesMap;
var startIcon;
var startIconLoc;
var endIcon;
var endIconLoc;

// USER INFO
// ======================================================

var user = {
    userId: localStorage.getItem("userId"),
    userEmail: localStorage.getItem("userEmail"),
    userName: localStorage.getItem("userName")
};

// GET MY ROUTES API CALL
// ========================================

// Gets all of user's route entries from database
function getMyRoutes() {

    // Get and return all runs in database
    $.ajax({
        url: "/api/getMyRoutes/" + user.userId,
        method: "GET"
    })
        .then(function (response) {
            displayMyRoutes(response);
        });
}

getMyRoutes();

// INITIATE VIEW ROUTES MAP
// ======================================================

function initViewRoutesMap() {

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

    routesMap = new google.maps.Map(document.getElementById("routesMap"), {
        zoom: 15,
        center: { lat: 47.60453, lng: -122.33422 },
        styles: myStyles
    });

    // Set up Direction Tools
    // ======================================================

    directionsService3 = new google.maps.DirectionsService;
    directionsDisplay3 = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });

    directionsDisplay3.setMap(routesMap);
}

// DISPLAY MY ROUTES LIST
// ======================================================

function displayMyRoutes(myRoutes) {
    console.log(myRoutes);

    if (myRoutes.length == 0) {
        $("#myRoutesList").text("No routes to display.");
    }

    for (var rte in myRoutes) {

        // Create a div to hold each route's data
        routeDiv = $("<div>").addClass("routeDiv")
            .attr("data-routeId", myRoutes[rte].id);

        // Populate div and display run data
        //***I sure wish there was something that could handle these bars
        routeDiv.html(
            `<td class="dataSpan">${myRoutes[rte].name}</td>` +
            `<td class="dataSpan">${myRoutes[rte].distance} mi.</td>` +
            `<td class="dataSpan">${myRoutes[rte].location}</td>`
        );

        $("#myRoutesList").append(routeDiv);
    }
}

// SHOW ROUTES ON MAP
// ======================================================

$("#myRoutesList").on("click", ".routeDiv", getRoutePoints);

// Get points of route to draw on map
function getRoutePoints() {

    // Change color of div to show selected run
    $(".routeDiv").css("background", "white");
    $(this).css("background", "orange");
    
    var routeId = $(this).attr("data-routeId");

    $.ajax({
        url: "/api/loadRouteById/" + routeId,
        method: "GET"
    })
        .then(function (response) {

            // If a route exists, load its info and display it on map
            if (response) {
                startIconLoc = JSON.parse(response.startIcon);
                endIconLoc = JSON.parse(response.endIcon);
                wayPoints3 = JSON.parse(response.wayPoints);
                displayRoute(directionsService3, directionsDisplay3, wayPoints3);
            }

            // Otherwise, default to show Seattle
            // *** LATER CHANGE TO DEFAULT CITY
            else {
                routeMap.setCenter({ lat: 47.60453, lng: -122.33422 });
                routeMap.setZoom(13);
            }
        });
}

function displayRoute(directionsService3, directionsDisplay3, wayPoints3) {
    var origin = wayPoints3[0].location;
    var destination = wayPoints3[wayPoints3.length - 1].location;

    // Cut off origin and destination to avoid duplication
    var stops3 = [];
    for (var i = 1; i < wayPoints3.length - 1; i++) {
        stops3.push(wayPoints3[i]);
    }

    distance = 0;

    directionsService3.route({
        origin: origin,
        waypoints: stops3,
        destination: destination,
        optimizeWaypoints: false,
        provideRouteAlternatives: false,
        travelMode: 'WALKING'
    },
        function (response, status) {

            if (status === 'OK') {
                directionsDisplay3.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }

            // Manage Start and End Icons on Map

            if (startIcon != null) {
                startIcon.setMap(null);
            }

            getStartIcon(startIconLoc);

            if (endIcon != null) {
                endIcon.setMap(null);
            }

            getEndIcon(endIconLoc);
        });
}

// VIEW RUNS - GET START ICON
// ======================================================

function getStartIcon(position) {

    // Google libraries of map marker icons
    var startIconImg = "http://maps.google.com/mapfiles/arrow.png";

    startIcon = new google.maps.Marker({
        position: position,
        icon: startIconImg,
        map: routesMap
    });

    return startIcon;
}

// VIEW RUNS - GET END ICON
// ======================================================

function getEndIcon(position) {

    // Google libraries of map marker icons
    var endIconImg = "http://www.google.com/mapfiles/dd-end.png";

    endIcon = new google.maps.Marker({
        position: position,
        icon: endIconImg,
        map: routesMap
    });

    return endIcon;
}