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

getAllUsers();

// DISPLAY LIST OF ALL USERS ON SITE
// ======================================================

function displayAllUsers(userList) {
    //console.log(userList);

    for (var user in userList) {

        var userDiv = $("<div>")
            .addClass("userDiv")
            .text(userList[user].name);

        var addFriendBtn = $("<button>")
            .addClass("addFriendBtn btn btn-primary")
            .attr("data-userId", userList[user].id)
            .attr("data-requested", "false")
            .text("Add Friend");

        userDiv.append(addFriendBtn);

        $("#usersOnSite").append(userDiv);
    }
}

// SEND FRIEND REQUEST
// ======================================================

$("#usersOnSite").on("click", ".addFriendBtn", requestFriend);

function requestFriend(event) {
    event.preventDefault();

    // var thisUserId = $(this).attr("data-userId");

    if ($(this).attr("data-requested") == "false") {
        $(this)
            .removeClass("btn btn-primary")
            .addClass("requestedBtn")
            .attr("data-requested", "true")
            .text("Request Sent");
    }
    else {
        $(this)
            .removeClass("requestedBtn")
            .addClass("btn btn-primary")
            .attr("data-requested", "false")
            .text("Add Friend");
    }
}