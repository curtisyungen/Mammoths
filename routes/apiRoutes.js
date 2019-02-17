var db = require("../models");
var axios = require("axios");

module.exports = function (app) {

  // ==========================================
  // GET
  // ==========================================


  // Get recent runs by ID
  app.get("/api/runs/:id", function (req, res) {
    db.Runs.findAll({
      where: { UserId: req.params.id },
      order: [["date", "DESC"]]
    }).then(function (dbRuns) {
      //console.log(dbRuns);
      res.json(dbRuns);
    });
  });
  
  // Load all runs for all users
  app.get("/viewAllRuns", function (req, res) {
    db.Runs.findAll({
      order: [["date", "DESC"]]
    }).then(function (dbRuns) {
      res.json(dbRuns);
    });
  });

  // Get user by ID
  app.get("api/user/:id", function (req, res) {
    res.json(user);
  });

  // Get all users in database
  app.get("/api/allUsers", function(req, res) {
    db.Users.findAll({}).then(function(dbUsers) {
      return res.json(dbUsers);
    });
  });

  //Load a route from database
  app.get("/api/loadRoute/:name", function (req, res) {
    db.Routes.findOne({
      where: { name: req.params.name }
    }).then(function (route) {
      res.json(route);
    });
  });

  // Load all routes specific to user
  app.get("/api/loadAllRoutes/:id", function (req, res) {
    db.Routes.findAll({ where: { UserId: req.params.id } }).then(function (response) {
      return res.json(response);
    });
  });

  // Load route by Route ID
  app.get("/api/loadRouteById/:id", function(req, res) {
    db.Routes.findOne({ where: { id: req.params.id } }).then(function(response) {
      return res.json(response);
    });
  });

  // ==========================================
  // POST
  // ==========================================

  // Save new run to database
  app.post("/api/runs", function (req, res) {
    db.Runs.create({
      date: req.body.date,
      distance: req.body.distance,
      route: req.body.route,
      duration: req.body.duration,
      location: req.body.location,
      surface: req.body.surface,
      RouteId: req.body.RouteId,
      UserId: req.body.UserId
    }).then(function (dbRun) {
      res.json(dbRun);
    });
  });

  // Save a new route to database
  app.post("/api/saveRoute", function (req, res) {
    db.Routes.create({
      name: req.body.name,
      location: req.body.location,
      distance: req.body.distance,
      wayPoints: req.body.wayPoints,
      startIcon: req.body.startIcon,
      endIcon: req.body.endIcon,
      UserId: req.body.UserId
    }).then(function (dbRoutes) {
      console.log(dbRoutes);
    });
  });
  
  // Create new user with a validation to check if that user's ID already exists in the database. 
  // Return false if an user with same email has been found
  app.post("/api/login", function (req, res) {

    var newUser = {};

    axios
      .get(
        "https://oauth2.googleapis.com/tokeninfo?id_token=" + req.body.idtoken
      )
      .then(function (response) {
        res.json(response.data);
        
        newUser = {
          name: response.data.name,
          email: response.data.email,
          id: response.data.sub
        };

      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
        db.Users.findOrCreate({
          where: { id: newUser.id },
          defaults: {
            name: newUser.name,
            email: newUser.email
          }
        })
          .spread(user, created)
          .then(function (dbUser) {
            res.end(dbUser);
          });
      });
  });

  // ==========================================
  // DELETE
  // ==========================================
  
  // Delete an example by id
  app.delete("/api/runs/:id", function (req, res) {
    db.Runs.destroy({ where: { id: req.params.id } }).then(function (dbRun) {
      res.json(dbRun);
    });
  });
};
