require('dotenv').config()
const express = require("express");
var session = require('express-session')
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const mongoose = require( 'mongoose');
const app = express();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

app.use(session({
  secret: '123456cat',
  resave: false,
  saveUninitialized: true,
  cookie: {  }
}));

app.use(express.static('public'));
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
//create a schema for posts containing various information such as title, content, likes etc
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!");
});
const loginSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    confirmPassword: String
});

//Create a model for the schema to run commands on it(CRUD)

const loginModel = mongoose.model('Login', loginSchema);


app.get("/", (req, res) => {
    if(req.session.emailAddress != null) {
        res.render('html/mainpage', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: ""});
      } else {
        res.render('html/mainpage', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
      }
});


app.get("/register", (req, res) => {
  if(req.session.emailAddress != null) {
    res.render('html/mainpage', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: ""});
  } else {
    res.render('html/register', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
    }
    
});

app.post("/register", (req, res) => {
    var user = new loginModel({
        name: req.body.name, 
        email: req.body.email, 
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    loginModel.findOne({email: user.email}, (err, result) =>  {
        if(err) throw err;
            if(result) {
                res.render('html/register', {alertMsg: "account with that email already exists",signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
            }else if(user.confirmPassword != user.password){
                var msg ="Password & Confirm Password did not Match";
                res.render('html/register', {alertMsg: msg, signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
             }else {
                user.save(function (err) {
                    if (err) return handleError(err);
                    console.log("saved!");
                    res.render('html/login', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
                  });
            }
    });

});

app.get("/signin", (req, res) => {
  if(req.session.emailAddress != null) {
    res.render('html/mainpage', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: ""});
  } else {
    res.render('html/login', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
    }
    
});

app.post("/signin", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    loginModel.findOne({email: email, password: password}, (err, result) => {
        if(err) {
            console.log(error);
        } if(!result){
            res.render('html/login', {alertMsg: "Email or password incorrect. Try again",signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
           
        } else {
            req.session.loggedinUser= true;
            req.session.emailAddress= email;
            res.redirect("/");
        }
    });
});


app.get('/logout', function(req, res) {
    req.session.destroy();
    res.render('html/mainpage', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
  });

  app.get('/productPage', (req, res) => {
    if(req.session.emailAddress != null) {
      res.render('html/mockpage', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: ""});
    } else {
      res.render('html/mockpage', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
    }
  });

  app.get('/cart', (req, res) => {
    if(req.session.emailAddress != null) {
      res.render('html/cart', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: ""});
    } else {
      res.redirect("/signin");
    }
  });

  app.get("/help", (req, res) => {
    if(req.session.emailAddress != null) {
        res.render('html/faq', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: "", faqVisibility: "", faqResponse: ""});
      } else {
        res.render('html/faq', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden", faqVisibility: "hidden", faqResponse: ""});
      }
  });

  app.post("/help", (req, res) => {
    var content = req.body.faqContent;
    

    const msg = {
      to: 'rishabhajay24@gmail.com', // Change to your recipient
      from: 'rishabhajay24@gmail.com', // Change to your verified sender
      subject: 'Query from ' + req.session.emailAddress,
      text: 'Query: ' + content
}

    sgMail.send(msg).then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
    res.render('html/faq', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: "", faqVisibility: "", faqResponse: "successfully sent"});
  })
  .catch((error) => {
    console.error(error.response.body);
    res.render('html/login', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: "", faqVisibility: "", faqResponse: "retry"});
  })

  })

  app.get("/accessories", (req, res) => {
    if(req.session.emailAddress != null) {
        res.render('html/accessories', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: ""});
      } else {
        res.render('html/accessories', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden"});
      }
});

app.get("/about", (req, res) => {
    if(req.session.emailAddress != null) {
        res.render('html/about', {signinVisibility: "hidden", logoutVisibility: "", cartVisibility: "", registerVisibility: "hidden", mainVisibility: ""});
      } else {
        res.render('html/about', {signinVisibility: "", logoutVisibility: "hidden", cartVisibility: "hidden", registerVisibility: "", mainVisibility: "hidden"});
      }
  });
app.listen(3000, () => {
    console.log("server listening at port 3000");
})

