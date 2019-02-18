// REFERENCES TO FORM ELEMENTS
// ========================================

var $runDate = $("#dateForm");
var $runDistance = $("#distanceForm");
var $runRoute = $("#showRoutes");
var $runHours = $("#hours");
var $runMins = $("#minutes");
var $runSecs = $("#seconds");
var $runLocation = $("#locationForm");
var $runSurface = $("#surfaceForm");
var $submitBtn = $("#submitRun");
var $runList = $("#runList");
var $newActivity = $("#newActivity");
var $showRoutes = $("#showRoutes");

// USER INFO ON SIGN IN
// ========================================

var user = {
  userId: localStorage.getItem("userId"),
  userEmail: localStorage.getItem("userEmail"),
  userName: localStorage.getItem("userName"),
};

// APPEND USER NAME TO THE NAV BAR
$("#loggedInUser").append(user.userName)

// REFRESH RUNS
// ========================================

var refreshRuns = function () {

  $.ajax({
      url: "api/runs/" + user.userId,
      type: "GET"
    })
  .then(function (data) {
    var $runs = data.map(function (run) {
      var $recentRun = $("<div class='recentRunDiv'>").html(
        `<td class='dataSpan'>${run.date}</td>` +
        `<td class='dataSpan'>${run.distance} mi.</td>` +
        `<td class='dataSpan'>${run.duration}</td>` +
        `<td class='dataSpan'>${run.location}</td>`
      );

      var $div = $("<div>")
        .attr({
          "data-id": run.id
        })
        .addClass("recentRun")
        .css("margin-bottom", "5px")
        .append($recentRun);

      return $div;
    });

    $("#run-list").empty();
    $("#run-list").append($runs);
  });
};

refreshRuns();

// LOAD EXISTING ROUTE (DROP DOWN MENU IN FORM)
// =============================================

// Initial call to populate drop down menu
showRoutes();

// Update Load Existing Route drop down menu when clicked
$showRoutes.on("mouseenter", checkShowRoutes);

// Update routes only if the drop down menu is blank
// This avoids erasing user's selection
function checkShowRoutes() {
  if ($showRoutes.val() == "") {
    showRoutes();
  }
}

// Update the drop down menu with all routes
function showRoutes() {

  $.ajax({
    url: "api/loadAllRoutes/" + user.userId,
    type: "GET"
  })
  .then(function (data) {
    $showRoutes.empty();
    $showRoutes.append(`<option val="0" id="0">`);

    for (var i=0; i<data.length; i++) {
      var route = $(`<option val=${data[i].name}>`).text(data[i].name + ": " + data[i].distance + " mi., " + data[i].location);
      
      route.attr("id", data[i].id);

      $showRoutes.append(route);
    }
  });
};

// AUTO-POPULATE DISTANCE & LOCATION FIELDS
// ========================================

$showRoutes.on("change", populateFields);

function populateFields() {

  var routeText = $showRoutes.val().trim();
  var distanceText = routeText.split(":")[1];
  var distanceVal = parseFloat(distanceText.split(" ")[1]);

  var locationText = routeText.split(",")[1].trim();

  $("#distanceForm").val(distanceVal);
  $("#locationForm").val(locationText);
}

// CALCULATE MILE PACE
// ========================================

$(".duration").on("change", calculatePace);
$(".distance").on("change", calculatePace);

function calculatePace() {

  // Convert form values to total minutes
  var hours = parseInt($runHours.val().trim());
  var minutes = parseInt($runMins.val().trim());
  var seconds = parseInt($runSecs.val().trim());

  // Get distance
  var distance = parseFloat($runDistance.val().trim());

  // Validate data
  // Then calculate and display pace
  if ($runDistance && $runHours && (minutes <= 59 && minutes >= 0) && (seconds <= 59 && seconds >= 0)) {

    var totalMinutes = (hours * 60) + (minutes) + (seconds / 60);
    
    var paceMins = Math.floor(totalMinutes / distance);
    var paceSecs = Math.round(((totalMinutes / distance) - paceMins) * 60);

    // Adds a zero before the seconds figure
    // To avoid having a result such as "5:9" for the pace. Corrects to "5:09"
    var addZeroSecs = "";
    if (paceSecs < 10) {
      addZeroSecs = 0;
    }

    $("#pace").text(` ${paceMins}:${addZeroSecs}${paceSecs}`);
  }
}

// SUBMIT NEW RUN
// ========================================

var handleFormSubmit = function (event) {
  event.preventDefault();

  var addZeroMins = "";
  if ($runMins.val().trim().length < 2) {
    addZeroMins = 0;
  }

  var $runDuration = `${$runHours.val().trim()}:${addZeroMins}${$runMins.val().trim()}:${$runSecs.val().trim()}`;

  var routeId = $("#showRoutes :selected").attr("id");

  // Default route ID if route is empty
  if (routeId < 1 || routeId == "") {
    routeId = null;
  }

  var routeName = $runRoute.val().trim();

  // Default route name if route is empty
  if (routeName == "" || routeName == null) {
    routeName = "No route";
  }
  
  var run = {
    date: $runDate.val().trim(),
    distance: $runDistance.val().trim(),
    route: routeName,
    duration: $runDuration,
    location: $runLocation.val().trim(),
    surface: $runSurface.val().trim(),
    RouteId: routeId,
    UserId: user.userId
  };

  // ===== Form Validation =====

  if (!(run.date && run.distance && $runHours.val().trim() && $runMins.val().trim() && $runSecs.val().trim())) {
    alert("Please fill out the date, distance and duration.");
    return;
  };

  // Submit new run
  $.ajax({
    headers: {
      "Content-Type": "application/json"
    },
    type: "POST",
    url: "api/runs",
    data: JSON.stringify(run)
  }).then(function () {
    refreshRuns();
  });
  
  // Empty form fields
  $runDate.val("");
  $runDistance.val("");
  $runRoute.val("");
  $runHours.val("");
  $runMins.val("");
  $runSecs.val("");
  $runLocation.val("");
  $runSurface.val("");

  // Clear map
  clearRoute(event);
};

// EVENT HANDLERS: SUBMIT RUN
// ========================================

$submitBtn.on("click", handleFormSubmit);

// GOOGLE SIGN OUT
// ========================================

var auth2;

window.onLoadCallback = function () {
  gapi.load('auth2', function () {
    auth2 = gapi.auth2.init({
      client_id: '894965613215-inve9sto28jrujo1kshpeao4gm2e8hdb.apps.googleusercontent.com',
      scope: 'profile',
      fetch_basic_profile: false
    });
  });
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    document.location.href = '/';
  });
}

$(document).ready(function() {

  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function() {

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

  });
}); 
