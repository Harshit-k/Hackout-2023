if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  const mysql = require('mysql')
  
  const initializePassport = require('./passport-config')
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )

  //DB Stuff
  const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'medx'
  });

  //Connect
  db.connect((err) => {
    if(err){throw err}
    console.log('MySQL Connected...')
  })
  
  const users = []
  const data = []
  
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  
  app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { firstname: req.user.firstname, lastname: req.user.lastname })
  })
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    }catch {
      res.redirect('/register')
    }
  })
  
  app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err){
            return next(err)
        }
    })
    res.redirect('/start')
  })

//Start Page

  app.get('/start', (req,res) => {
    res.render('start.ejs')
  })

  app.post('/start', (req,res) => {
    try {
      
      res.redirect('/register')
    } catch {
      res.redirect('/start')
    }
  })

//Profile

  app.get('/profile', (req, res) => {
    res.render('profile.ejs')
  })

  app.post('/profile', checkNotAuthenticated, (req,res) => {
    try {
      data.push({
        id: Date.now().toString(),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        dob: req.body.dob,
        gender: req.body.gender,
        allergies: req.body.allergies,
        chronic_conditions: req.body.chronic_conditions,
        medications: req.body.medications
      })
      console.log(req.body.gender)
      res.redirect('/')
    } catch {
      res.redirect('/profile', { firstname: req.user.firstname, lastname: req.user.lastname })
    }
  })

  //Upload

  app.get('/upload', (req, res) => {
    res.render('upload.ejs')
  })

  app.post('/upload', checkNotAuthenticated, (req,res) => {
    try {
      
      res.redirect('/')
    } catch {
      res.redirect('/profile', { firstname: req.user.firstname, lastname: req.user.lastname })
    }
  })

  //Blood Sugar

  app.get('/blood_sugar', (req, res) => {
    res.render('blood_sugar.ejs')
  })

  app.post('/blood_sugar', checkNotAuthenticated, (req,res) => {
    try {
      
      res.redirect('/blood_sugar')
    } catch {
      res.redirect('/blood_sugar')
    }
  })

  //Analytics

  app.get('/analytics', (req, res) => {
    res.render('analytics.ejs')
  })

  app.post('/analytics', checkNotAuthenticated, (req,res) => {
    try {
      
      res.redirect('/analytics')
    } catch {
      res.redirect('/analytics')
    }
  })

  //Graph

  app.get('/graph', (req, res) => {
    res.render('graph.ejs')
  })

  app.post('/profile', checkNotAuthenticated, (req,res) => {
    try {
      
      res.redirect('/graph')
    } catch {
      res.redirect('/graph')
    }
  })

  //Profile View

  app.get('/view_profile', (req, res) => {
    res.render('view_profile.ejs')
  })

  app.post('/view_profile', checkNotAuthenticated, (req,res) => {
    try {
      
      res.redirect('/')
    } catch {
      res.redirect('/view_profile')
    }
  })

  //Check Auth
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  
  app.listen(3000)