//  GET ALL USERS ON SITE
// ======================================================

function getAllUsers() {
    $.ajax({
        url: "/api/allUsers",
        method: "GET"
    })
        .then(function (response) {
            displayAllUsers(response);
        });
}

// DISPLAY LIST OF ALL USERS ON SITE
// ======================================================

function displayAllUsers(userList) {
    // console.log(userList);

    for (var user in userList) {

        var userDiv = $("<div>")
            .addClass("userDiv")
            .text(userList[user].name);

        var addFriendBtn = $("<button>")
            .addClass("addFriendBtn btn btn-success")
            .text("Add Friend");

        userDiv.append(addFriendBtn);

        $("#usersOnSite").append(userDiv);
    }

}

getAllUsers();