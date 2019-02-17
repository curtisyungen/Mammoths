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

// USER INFO
// ======================================================

var user = {
    userId: localStorage.getItem("userId"),
    userEmail: localStorage.getItem("userEmail"),
    userName: localStorage.getItem("userName")
};

// VIEW ALL RUNS API CALL
// ========================================

// Gets all run entries from database
function viewAllRuns() {
    $.ajax({
        url: "/viewAllRuns",
        method: "GET"
    })
        .then(function (response) {
            $("#allRunsList").empty();
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

    var runDiv;

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
                //***I sure wish there was something that could handle these bars
                runDiv.html(
                    `<td class="dataSpan">${userName}</td>` +
                    `<td class="dataSpan">${runData[i].date}</td>` +
                    `<td class="dataSpan">${runData[i].distance} miles</td>` +
                    `<td class="dataSpan">${runData[i].duration}</td>` +
                    `<td class="dataSpan">${runData[i].location}</td>` +
                    `<td class="dataSpan">${runData[i].surface}</td>`
                );

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

    // Clear map of route
    clearMap();

    // Change color of div to show selected run
    $(".runDiv").css("background", "white");
    $(this).css("background", "orange");

    // Add delete button to run div
    deleteBtn = $("<a class='btn btn-danger delete deleteRun'>").text("delete");
    $(this).append(deleteBtn);

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
                wayPoints2 = JSON.parse(response.wayPoints);
                displayRunRoute(directionsService2, directionsDisplay2, wayPoints2);
            }

            // Otherwise, default to show Seattle
            // *** LATER CHANGE TO DEFAULT CITY
            else {
                map2.setCenter({ lat: 47.60453, lng: -122.33422 });
                map2.setZoom(13);
            }
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

            // Empty runs list to prevent duplication of entries
            $("#allRunsList").empty();

            // Clear map of current route
            clearMap();

            // Refresh runs list
            viewAllRuns();
        });
}

// VIEW FILTER
// ======================================================

$("#onlyMe").on("click", showOnlyUser);
$("#showAllRuns").on("click", viewAllRuns);

function showOnlyUser(event) {
    event.preventDefault();

    $.ajax({
        url: "/api/runs/" + user.userId,
        method: "GET"
    }).then(function (runData) {

        $("#allRunsList").empty();

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
            // for (var user in runData) {
            //     if (userId == runData[user].id) {
            //         userName = runData[user].name;
            //     }
            // }

            userName = user.userName; //**** */ TEMPORARY FIX

            // Populate div and display run data
            //***I sure wish there was something that could handle these bars
            runDiv.html(
                `<td class="dataSpan">${userName}</td>` +
                `<td class="dataSpan">${runData[i].date}</td>` +
                `<td class="dataSpan">${runData[i].distance} mi.</td>` +
                `<td class="dataSpan">${runData[i].duration}</td>` +
                `<td class="dataSpan">${runData[i].location}</td>` +
                `<td class="dataSpan">${runData[i].surface}</td>`
            );

            $("#allRunsList").append(runDiv);
        }
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
