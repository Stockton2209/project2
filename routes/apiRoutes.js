// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    res.json("/profile");
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    console.log(req.body);
    db.User.create({
      email: req.body.email,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber
    }).then(function() {
      res.redirect(307, "/api/login");
    }).catch(function(err) {
      console.log(err);
      res.json(err);
      // res.status(422).json(err.errors[0].message);
    });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  app.get("/api/allpets", isAuthenticated, function (req, res) {
    db.Pet.findAll({}).then(function(results){
      res.json(results);
    });
  });
  app.post("/api/search", isAuthenticated, function (req, res) {
    db.Pet.findAll({
      where: req.body
    }).then(function(results){
      res.json(results);
    });
  });
  // working on the post and getting an error startitng the server - var Pet = sequelize.define("pet", is not a function
  app.post("/api/registerpet", isAuthenticated, function(req, res) {
    console.log(req.body);
    // Take the request...
    var pet = req.body;

    db.Pet.create({
      //routeName: routeName,
      name: pet.name,
      age: pet.age,
      status: pet.status,
      petType: pet.petType,
      sex: pet.sex,
      chip: pet.chip,
      collartag: pet.collartag,
      size: pet.size,
      color: pet.color,
      hair: pet.hair,
      breed: pet.breed,
      missingDays: pet.missingDays,
      location: pet.location,
      special: pet.special,
      photolink: pet.photolink

    }).then(function(){
      res.status(204).end();
    });


  });

};
