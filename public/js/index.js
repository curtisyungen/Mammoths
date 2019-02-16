// Get references to page elements
var $runList = $("#runList");


// Our signed in User info 
var user = {
  userId: localStorage.getItem("userId"),
  userEmail: localStorage.getItem("userEmail"),
  userName: localStorage.getItem("userName")
};
console.log("userid " + user.userId);

// APPEND USER NAME TO THE NAV BAR
$("#loggedInUser").append(user.userName)


var runTableDates = [];
var runTableDistances = [];

// refreshRuns gets new runs from the db and repopulates the list
var refreshRuns = function () {
  $.ajax({
    url: "api/runs/" + user.userId,
    type: "GET"
  })
    .then(function (data) {

      var length = 5;

      if (data.length < length) {
        length = data.length;
      }

      for (var i = length-1; i>=0; i--) {
        runTableDates.push(data[i].date);
        runTableDistances.push(data[i].distance);
      }

      // Bar Chart
      // =======================================================
      var ctx = document.getElementById("myChart").getContext('2d');
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: runTableDates,
          datasets: [{
            label: 'Miles',
            data: runTableDistances,
            backgroundColor: [
              'rgba(255, 0, 0, 0.3)',
              'rgba(0, 255, 0, 0.3)',
              'rgba(0, 0, 255, 0.3)',
              'rgba(75, 192, 192, 0.3)',
              'rgba(400, 175, 0, 0.3)',
            ],
            borderColor: [
              'red',
              'green',
              'blue',
              'rgba(75, 192, 192, 1)',
              'rgba(0, 100, 0, 0.3)'
            ],
            borderWidth: 1,
            hoverBorderWidth: 5
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Last Five Runs',
            fontColor: "white"
          },
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontColor: "white"
              },
              gridLines: {
                color: 'rgb(118, 40, 155)'
              }
            }],
            xAxes: [{
              barThickness: 55,
              ticks: {
                fontColor: "white"
              },
            }]
          },
        }
      });
    });
};

refreshRuns();




// Line Chart
// =======================================================

var lineC = document.getElementById("lineChart").getContext('2d');
var myChart = new Chart(lineC, {
  type: 'line',
  data: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: 'Joseph',
        data: [50, 60, 40, 80],
        borderColor: 'rgba(255, 0, 0, 0.3)',
        fill: false,
        pointBackgroundColor: 'red',
        pointHoverRadius: 7,
      },
      {
        label: 'Vahe',
        data: [22, 11, 44, 50],
        borderColor: 'rgba(0, 255, 0, 0.3)',
        fill: false,
        pointBackgroundColor: 'green',
        pointHoverRadius: 7,
      },
      {
        label: 'Curtis',
        data: [30, 70, 100, 90],
        borderColor: 'rgba(0, 0, 255, 0.3)',
        fill: false,
        pointBackgroundColor: 'blue',
        pointHoverRadius: 7,
      },
      {
        label: 'Bhavin',
        data: [74, 70, 30, 5],
        borderColor: 'rgba(75, 192, 192, 0.3)',
        fill: false,
        pointBackgroundColor: 'cyan',
        pointHoverRadius: 7,
      }
    ],
  },
  options: {
    title: {
      display: true,
      text: 'Weekly Goal Completion',
      fontColor: "white"
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: "% Completion",
          fontColor: "gray"
        },
        ticks: {
          beginAtZero: true,
          fontColor: "white"
        },
        gridLines: {
          color: 'rgb(118, 40, 155)'
        }
      }],
    }
  }
});

// Google Sign Out
// =======================================================
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

