// GLOBALS
// ======================================================

var directionsService2;
var directionsDisplay2;
var wayPoints2;
var map2;
var runData;
var startIcon;
var startIconLoc;
var endIcon;
var endIconLoc;
var deleteBtn;

// VIEW ALL RUNS API CALL
// ========================================

// Gets all run entries from database
function viewAllRuns() {
    $.ajax({
        url: "/viewAllRuns",
        method: "GET"
    })
        .then(function (response) {
            displayAllRunsList(response);
        });
}

viewAllRuns();

// INITIATE VIEW RUNS MAP
// ======================================================

function initViewRunsMap() {

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

    map2 = new google.maps.Map(document.getElementById("map2"), {
        zoom: 15,
        center: { lat: 47.60453, lng: -122.33422 },
        styles: myStyles
    });

    // Set up Direction Tools
    // ======================================================

    directionsService2 = new google.maps.DirectionsService;
    directionsDisplay2 = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });

    directionsDisplay2.setMap(map2);
}

// SHOW ALL RUNS IN DATA BASE
// ======================================================

function displayAllRunsList(runData) {
    console.log(runData);

    var runDiv;

    var userName;

    // Get all users from database
    $.ajax({
        url: "/api/allUsers",
        method: "GET"
    })
        .then(function (response) {

            if (runData.length == 0) {
                $("#allRunsList").text("No runs to display.");
            }

            for (var i in runData) {

                // Create a div to hold each run's data
                // Store route ID in each div's data
                // Add run ID for run deletion function
                runDiv = $("<div>").addClass("runDiv")
                    .attr("data-routeId", runData[i].RouteId)
                    .attr("data-runId", runData[i].id);

                // Get ID of user who entered each run
                var userId = runData[i].UserId;

                // Get Name of runner from ID
                for (var user in response) {
                    if (userId == response[user].id) {
                        userName = response[user].name;
                    }
                }

                // Populate div and display run data
                runDiv.html(runData[i].date + " &nbsp&nbsp " 
                + runData[i].distance + " miles&nbsp&nbsp " 
                + runData[i].duration + " &nbsp&nbsp&nbsp"
                + runData[i].location + " &nbsp&nbsp&nbsp"
                + runData[i].surface);

                $("#allRunsList").append(runDiv);
            }
        });
}

// SHOW ROUTE ON MAP WHEN RUN IS CLICKED
// ======================================================

// Event Handler for clicking on a run to see info
$("#allRunsList").on("click", ".runDiv", getRoutePoints);
$("#allRunsList").on("click", ".deleteRun", deleteRun);

// Get points of route to draw on map
function getRoutePoints() {

    // Hide all delete buttons 
    $(deleteBtn).hide();

    // Change color of div to show selected run
    $(".runDiv").css("background", "white");
    $(this).css("background", "orange");

    // Add delete button to run div
    deleteBtn = $("<a class='btn btn-danger delete deleteRun'>").text("delete").css("float", "right");
    $(this).append(deleteBtn);

    var routeId = $(this).attr("data-routeId");

    $.ajax({
        url: "/api/loadRouteById/" + routeId,
        method: "GET"
    })
        .then(function (response) {
            //console.log(response);

            startIconLoc = JSON.parse(response.startIcon);
            endIconLoc = JSON.parse(response.endIcon);

            wayPoints2 = JSON.parse(response.wayPoints);

            displayRunRoute(directionsService2, directionsDisplay2, wayPoints2);
        });
}

// DELETE RUN FROM DATABASE
// ======================================================

function deleteRun() {
    var runId = $(this).parent().attr("data-runId");

    $.ajax({
        url: "api/runs/" + runId,
        type: "DELETE"
    })
        .then(function (response) {
            console.log(response);

            // Empty runs list to prevent duplication of entries
            $("#allRunsList").empty();

            // Clear map of current route
            clearMap();

            // Refresh runs list
            viewAllRuns();
        });
}

// CLEAR MAP
// ======================================================

function clearMap() {
    // Clear waypoints
    wayPoints2 = [];

    // Clear start icon
    if (startIcon != null) {
        startIcon.setMap(null);
    }

    // Clear end icon
    if (endIcon != null) {
        endIcon.setMap(null);
    }

    // Erase route from map
    directionsDisplay2.set("directions", null);
}

// VIEW RUNS - DRAW ROUTE ON MAP
// ======================================================

function displayRunRoute(directionsService2, directionsDisplay2, wayPoints2) {

    var origin = wayPoints2[0].location;
    var destination = wayPoints2[wayPoints2.length - 1].location;

    // Cut off origin and destination to avoid duplication
    var stops2 = [];
    for (var i = 1; i < wayPoints2.length - 1; i++) {
        stops2.push(wayPoints2[i]);
    }

    distance = 0;

    directionsService2.route({
        origin: origin,
        waypoints: stops2,
        destination: destination,
        optimizeWaypoints: false,
        provideRouteAlternatives: false,
        travelMode: 'WALKING'
    },
        function (response, status) {
            //console.log(response);

            if (status === 'OK') {
                directionsDisplay2.setDirections(response);
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
        map: map2
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
        map: map2
    });

    return endIcon;
}
