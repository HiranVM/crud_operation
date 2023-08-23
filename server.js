const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser')
const session = require('express-session')

const nocache = require('nocache')
const mongoose = require('mongoose')
const userDB = require('./models/user');
const { name } = require('ejs')

const hostname = "127.0.0.1";
const port = process.env.PORT || 3001;

const credential = {
  email : "admin123@gmail.com",
  password : "123"
}

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Set the view engine to Handlebars
app.set('view engine', 'ejs');

app.use(nocache())

// Sessionc
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1800000 // 30 minutes in milliseconds
  }
}))

// Middleware to check if user is logged in
function check_session(req,res,next){
  if(req.session.authorized){
    next()
  }else{
    res.render('login');
}
}

 
// GET request for single file


app.get('/home',(req,res)=>{
  res.render('home',{name});
})
app.get('/admin',(req,res)=>{
  res.render('admin',{title:'Admin Page'});
})
app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Signup Page' });
});
app.get('/index',async(req,res)=>{
  const data=await userDB.find()
  console.log(data);
  res.render('index',{users:data})
 
})

// app.get('/login', (req, res) => {
//   res.render('login', { title: 'Login Page' });
// });

app.post('/admin', (req, res) => {
  if(req.body.email === credential.email && req.body.password === credential.password){
      req.session.user = req.body.email;   //creating a new session with username as session variable
      res.redirect('/index');    //redirects user to this dashboard
      // res.end("Login Sucessful....");
  }
  else {
      res.render('admin', {error: "please enter username & password"})
  }
})

app.post("/login", async (req, res) => {
  try {
    // Check that the email and password fields are present and not empty
    if (!req.body.email || req.body.email.trim() === "" || !req.body.password || req.body.password.trim() === "") {
      return res.status(400).render("login", { error: "Email and password are required." });
    }

    // Check that the email field matches the expected format
    if (!/\S+@\S+\.\S+/.test(req.body.email)) {
      return res.status(400).render("login", { error: "Email address is invalid." });
    }

    const check = await userDB.findOne({ email: req.body.email });
    if (check && check.password === req.body.password) {
      req.session.userDB = req.body.email;
      req.session.authorized = true; // set authorized to true
      return res.render('home');
    } else {
      return res.status(401).render("login", { error: "Wrong username or password." });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).send("Error logging in.")
  }
});


app.get('/login',check_session, (req, res) => {
  if(req.session.authorized){
    res.redirect('/home'); // redirect to home if authorized
  } else {
    res.render('login', { title: 'Login Page' });
  }
});


app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check that the name field is present and not empty
    if (!name || name.trim() === "") {
      return res.status(400).render('signup', { error: 'Name is required.' });
    }

    // Check that the email field is present and not empty, and matches a valid email format
    if (!email || email.trim() === "" || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).render('signup', { error: 'Email is invalid or missing.' });
    }

    // Check that the password field is present and has at least 8 characters
    if (!password || password.trim() === "" || password.length < 4) {
      return res.status(400).render('signup', { error: 'Password must be at least 4 characters.' });
    }

    // Check if the email already exists in the database
    const existingUser = await userDB.findOne({ email });
    if (existingUser) {
      return res.status(409).render('signup', { error: 'Email is already in use.' });
    }

    const user = new userDB({ name, email, password });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send('Error signing up.');
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/search', (req, res) => {
  const query = req.query.name; // Get the search query from the URL query parameters

  // Perform the search using Mongoose
  userDB.find({ name: { $regex: new RegExp(query, 'i') } })
    .then(users => {
      res.render('index', { users });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

// Serve static assets
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/j', express.static(path.join(__dirname, 'js')));



app.use('/',require('./routes'))

// Start the server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/login`);
});
