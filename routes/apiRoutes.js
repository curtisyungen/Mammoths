var db = require("../models");
var axios = require("axios");

module.exports = function (app) {
  // GET RECENT 5 RUNS
  app.get("/api/runs/:id", function (req, res) {
    //console.log(req.params.id)
    db.Runs.findAll({
      where: { UserId: req.params.id },
      order: [["updatedAt", "DESC"]],
      limit: 5
    }).then(function (dbRuns) {
      res.json(dbRuns);
    });
  });

  // Create a new run
  app.post("/api/runs", function (req, res) {
    db.Runs.create(req.body).then(function (dbRun) {
      res.json(dbRun);
    });
  });

  // Delete an example by id
  app.delete("/api/runs/:id", function (req, res) {
    db.Runs.destroy({ where: { id: req.params.id } }).then(function (dbRun) {
      res.json(dbRun);
    });
  });

  // Create new user with a validation to check if that user already exists in the database. It'll check against user's id. Return false if an user with same email has been found
  // var user = {};

  app.post("/api/login", function (req, res) {
    var newUser = {};
    //console.log(req.body);
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

  app.get("api/user/:id", function (req, res) {
    res.json(user);
    //console.log(user);
  });

  // Load a route from database
  app.get("/api/loadRoute/:name", function(req, res) {
    db.Routes.findOne({
      where: {name: req.params.name} 
    }).then(function(route) {
      res.json(route);
      console.log(route);
    });
  });

  // Load all routes
  app.get("/api/loadAllRoutes",function(req, res) {
    db.Routes.findAll({}).then(function(response) {
      // console.log(response);
      return res.json(response);
    });
  });

  // Save a new route to database
  app.post("/api/saveRoute", function (req, res) {
    db.Routes.create({
      name: req.body.name,
      distance: req.body.distance,
      wayPoints: req.body.wayPoints,
      startIcon: req.body.startIcon,
      endIcon: req.body.endIcon,
      UserId: req.body.UserId
    }).then(function (dbRoutes) {
      console.log(dbRoutes);
    });
  });

};
