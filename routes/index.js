var express = require('express');
var router = express.Router();
const userModel = require("./users"); 
const passport = require("passport");
const upload = require('./multer'); // import multer here 
const postModel = require("./post"); 

const localStrategy = require("passport-local"); //...
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function(req, res, next) {
  res.render('index', {nav: false});
});

router.get('/register', function(req, res, next) {
  res.render('register', {nav: false});
});

//  users.js data name here: req.body.input field of register name here 
router.post('/register', function(req, res, next) {
    const { username, email, contact, name } = req.body;
    const data = new userModel({ username, email, contact, name });

    userModel.register(data, req.body.password)
  .then(function () {
    passport.authenticate("local")(req,res,function (){
      res.redirect('/profile');
    })
  });
});

router.get('/profile', isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts")
  res.render('profile',{user, nav: true});
});

router.get('/show/posts', isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts")
  res.render('show',{user, nav: true});
});

router.get('/feed', isLoggedIn , async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    if (!user) {
      throw new Error('User not found'); // Handle the case where the user is not found
    }

    const posts = await postModel.find().populate('user');

    res.render('feed', { user, posts, nav: true });
  } catch (error) {
    console.error(error); // Log the error to the console
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }});


router.get('/add', isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('add',{user, nav: true});
});

router.post('/createpost',upload.single("postimage"), isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    desc: req.body.description,
    image: req.file.filename
  });

user.posts.push(post._id);
await user.save();
res.redirect('/profile');
});



router.post('/fileupload', isLoggedIn , upload.single("image") ,  async function(req, res, next) { //form input name = image therefore use upload.single('image)
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename; //uploaded file name  getting save in user's profileImage
  await user.save();
  res.redirect('/profile');
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
