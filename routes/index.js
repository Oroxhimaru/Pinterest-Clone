var express = require('express');
var router = express.Router();
const userModel = require("./users"); 
const passport = require("passport");

const localStrategy = require("passport-local"); //...
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

//  users.js data name here: req.body.input field of register name here 
router.post('/register', function(req, res, next) {
    const { username, email, contact } = req.body;
    const data = new userModel({ username, email, contact });

    userModel.register(data, req.body.password)
  .then(function () {
    passport.authenticate("local")(req,res,function (){
      res.redirect('/profile');
    })
  });
});

router.get('/profile', isLoggedIn , function(req, res, next) {
  res.render('profile');
});

router.post("/login", passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/',
}), function (req,res){ 
});  //passport.authenticate() is working as a middleware here between route and function

router.get('/logout', (req,res,next) => {
  req.logout(function(err){
   if (err) { return next(err); }
     res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){   //if we are logged in then it will go ahead.
    return next();
  }
  res.redirect('/');  //otherwise go to homepage
}


module.exports = router;
