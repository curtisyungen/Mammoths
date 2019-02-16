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

        var userName = mileageData[user].userName;
        var userMiles = Math.round((mileageData[user].userMiles)*100)/100;

        var userTotalMiles = $("<div>")
            .addClass("userTotalMiles")
            .text(userName + ": " + userMiles + " miles");

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

