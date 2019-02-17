// USER INFO ON SIGN IN
// ========================================

var user = {
    userId: localStorage.getItem("userId"),
    userEmail: localStorage.getItem("userEmail"),
    userName: localStorage.getItem("userName"),
  };
  
  // APPEND USER NAME TO THE NAV BAR
  $("#loggedInUser").append(user.userName)

// GET ALL RUNS API CALL
// ========================================

function getAllRuns() {
    $.ajax({
        url: "/viewAllRuns",
        method: "GET"
    })
        .then(function (response) {
            //console.log(response);
            getAllUsers(response);
        });
}

getAllRuns();

// GET ALL USERS API CALL
// ========================================

function getAllUsers(runData) {

    // Get all users from database
    $.ajax({
        url: "/api/allUsers",
        method: "GET"
    })
        .then(function (userData) {
            //console.log(userData);

            var mileageData = [];

            for (var user in userData) {
                var userId = userData[user].id;
                var userMiles = getUserMiles(runData, userId);
                var userName = userData[user].name;

                mileageData.push({
                    userId: userId, userName: userName, userMiles: userMiles
                });
            }

            generateLeaderboard(mileageData);
        });
}

// GET USER MILES
// ========================================

function getUserMiles(runData, userId) {

    var userMiles = [];

    // Loop through runData
    for (var i in runData) {

        // Match userId to user ID in run entry
        // When found, push data to miles array
        if (userId == runData[i].UserId) {
            userMiles.push(runData[i].distance);
        }
    }

    var totalMiles = 0;
    for (var i = 0; i < userMiles.length; i++) {
        totalMiles += parseFloat(userMiles[i]);
    }

    return totalMiles;
}

// GENERATE LEADERBOARD
// ========================================

function generateLeaderboard(mileageData) {

    // Sort mileage data in descending order
    mileageData.sort(compare);
    
    // Compile and display leaderboard data
    for (var user in mileageData) {

        var userName = $("<div>")
            .addClass("userNameDiv")
            .text(mileageData[user].userName);
        var userMiles = $("<div>")
            .addClass("userMilesDiv")
            .text((Math.round((mileageData[user].userMiles)*100)/100) + " miles");

        var userTotalMiles = $("<div>")
            .addClass("userTotalMiles")
            .append(userName)
            .append(userMiles);

        $("#leaderboard").append(userTotalMiles);
    }
}

// Compare function to sort in descending order
function compare(a, b) {
    if (a.userMiles < b.userMiles)
        return 1;
    if (a.userMiles > b.userMiles)
        return -1;
    return 0;
}

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
