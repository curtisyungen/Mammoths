var db = require("../models");

module.exports = function (app) {

  // Login Page
  app.get("/", function(req, res) {
    res.render("login")
  });

  // Home Page
  app.get("/home", function(req, res) {
    res.render("index")
  });

  app.get("/leaderboard", function(req, res) {
    res.render("leaderboard");
  });

  // Contact Page
  app.get("/contact", function(req, res) {
    res.render("contact");
  })

  // About Page
  app.get("/about", function(req, res) {
    res.render("about");
  })

  // Terms of Service Page
  app.get("/terms", function(req, res) {
    res.render("terms");
  })

  // Load example page and pass in an example by id
  app.get("/runs/:id", function (req, res) {
    db.Runs.findOne({ where: { id: req.params.id } }).then(function (dbRun) {
      res.render("run", {
        run: dbRun
      });
    });
  });

  // View All Runs Page
  app.get("/viewRuns", function (req, res) {
      res.render("viewRuns"); 
  });

  // Post Activity Page
  app.get("/post-activity", function (req, res) {
    res.render("post-activity");
  });

  // app.get("api-user", function (req, res) {
  //   //res.render("post-activity");
  // });

  // Get Plan page
  app.get("/plan", function (req, res) {
    res.render("plan");
  });

  // Get History page
  app.get("/history", function (req, res) {
    res.render("history");
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });

  // Submit new activity to database
  app.post("/home", function(req, res) {
    res.render("index");
  });

};
