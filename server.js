const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config({path:'secrets.env'});

const moment = require('moment');

app.engine('html', require('ejs').renderFile);
app.use(express.static('public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('favicon.ico', express.static('/public/favicon.ico'));

app.use(session({
    secret: 'work hard',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } // Enable with HTTPS
    store: new MongoStore({
        url: process.env.DB_URL, // Re-using the 'db' database instance causes sessions to silently fail.
        // Placing app.use(session()) within the MongoClient.connect() callback does not solve this issue.
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default.
        touchAfter: 24 * 36000 // Update session only once a day regardless of # of requests, unless a request changes session data.
    })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(username, done) {
    done(null, username);
  });
passport.deserializeUser(function(username, done) {
    done(null, username);
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        db.collection('users').findOne({ username: username }, function(err, user) {
            if (err) return done(err);
            if (user === null) {
                return done(null, null);
            } else {
                bcrypt.compare(password, user.password, function(err, passwordCorrect) {
                    if (err) return done(err);
                    if (passwordCorrect) {
                        return done(null, username);
                    } else {
                        return done(null, false)
                    }
                });
            }
        });
    }
));

let usersCollectionExists = false;
let pollsCollectionExists = false;
function startListening() {
    if (usersCollectionExists && pollsCollectionExists) {
        let listener = app.listen(process.env.PORT || 3000, function () {
        console.log('Good to go! Node listening on port ' + listener.address().port + '.');
        });
    }
}

let db;
MongoClient.connect(process.env.DB_URL, function(err, client) {
    if (err) throw err;
    db = client.db('voting-app-database-2');
    db.listCollections({name: 'users'}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length === 0) {
            db.createCollection('users', function(err) {
                if (err) throw err;
                console.log('"users" collection created.');
                db.createIndex('users', {username: 1}, {unique: true}, function(err) {
                    if (err) throw err;
                    console.log('Unique index created.');
                    usersCollectionExists = true;
                    startListening();
                });
            });
        } else {
            usersCollectionExists = true;
            startListening();
        }
    });
    db.listCollections({name: 'polls'}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length === 0) {
            db.createCollection('polls', function(err) {
                if (err) throw err;
                console.log('"polls" collection created.');
                pollsCollectionExists = true;
                startListening();
            });
        } else {
            pollsCollectionExists = true;
            startListening();
        }
    });
});

app.get('', function(req, res) {
    if (!req.user) {
        // TODO: Initialise guest session. Based on IP address?
    }
    db.collection('polls').find().toArray(function(err, result) {
        if (err) throw err;
        res.render('index.ejs', {authenticated: req.isAuthenticated(), polls: result, user: req.user, moment: moment});
    });
});

app.get('/register', function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('register.ejs');
    }
});

app.post('/register', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (typeof username === 'undefined' || typeof password === 'undefined' || username.length < 4 || username.length > 100 || password.length < 8 || password.length > 100) {
        return res.status(500).send(); // Only users attempting to get around client-side validation should get these errors. No detailed response required.
    } else {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) throw err;
            db.collection('users').insertOne({username: username, password: hash}, function(err) {
                if (err) {
                    if (err.code === 11000) {
                        // Duplicate error from unique username index.
                        res.status(401).send();
                    } else {
                        throw err;
                    }
                } else {
                    if (req.user !== 'Admin') {
                        req.login(username, function(err) {
                            if (err) throw err;
                            res.send();
                        });
                    } else {
                        res.send();
                    }
                }
            });
        });
    }
});

app.post('/delete-user', function(req, res) {
    if (!req.isAuthenticated()) {
        res.status(401).send();
    } else {
        let username = req.body.username;
        if (typeof username === 'undefined') {
            return res.status(500).send();
        } else {
            db.collection('users').find({username: username}).toArray(function(err, result) {
                if (err) throw err;
                if (req.user === result[0].username || req.user === 'Admin') {
                    db.collection('users').remove({username: username}, function(err) {
                        if (err) throw err;
                        res.send(username);
                    });
                } else {
                    res.status(403).send();
                }
            });
        }
    }
});

app.get('/login', function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('login.ejs');
    }
});

app.post('/login', function(req, res) {
    if (typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined') {
        res.status(500).send();
    } else {
        passport.authenticate('local', function(err, user) { // Custom authenticate callback.
            if (err) {
                res.status(500).send();
            } else if (!user) { // null: no username in database, false: incorrect password.
                res.status(401).json({error: "Incorrect username or password."});
            } else {
                req.login(user, function(err) { // login() is not called automatically when using a custom callback.
                    if (err) throw err;
                    res.send();
                });
            }
        })(req, res);
    }
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.redirect('/');
});

app.get('/new-poll', function(req, res) {
    if (req.isAuthenticated()) {
        res.render('new-poll.ejs', {authenticated: true, user: req.user});
    } else {
        res.redirect('/login');
    }
});

app.post('/new-poll', function(req, res) {
    if (!req.isAuthenticated()) {
        res.status(401).send();
    } else {
        let title = req.body.title;
        let options = req.body.options;
        if (typeof title === 'undefined' || typeof options === 'undefined' || title.length < 1 || options.length < 1) {
            res.status(500).send();
        } else {
            db.collection('polls').find({title: title}).toArray(function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    res.status(409).send();
                } else {
                    let votes = [];
                    for (var i = 0; i < options.length; i++) {
                        votes[i] = 0;
                    }
                    let id = Math.random().toString(16).slice(2, 10); // Random 8-digit hexadecimal number.
                    db.collection('polls').insertOne({
                        id: id,
                        title: title,
                        author: req.user,
                        options: options,
                        votes: votes,
                        voters: {},
                        timestamp: new Date().getTime()
                    }, function(err) {
                        if (err) throw err;
                        res.send(id);
                    });
                }
            });
        }
    }
});

app.get('/polls/:pollId', function(req, res) {;
    db.collection('polls').find({id: req.params.pollId}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            res.render('poll.ejs', {authenticated: req.isAuthenticated(), polls: result, user: req.user, moment: moment});
        } else {
            res.redirect('/');
        }
    });
});

app.post('/vote', function(req, res) {
    let pollId = req.body.id;
    let optionIndex = req.body.optionIndex;
    if (typeof pollId === 'undefined' || typeof optionIndex === 'undefined') {
        req.status(500).send();
    } else {
        let user;
        if (typeof req.user === 'undefined') {
            user = req.ip; // TODO: Initialise guest session.
        } else {
            user = req.user;
        }
        db.collection('polls').find({id: pollId}).toArray(function(err, result) {
            if (err) throw err;
            poll = result[0]
            let voters = poll.voters;
            let alreadyVoted = false;
            if (voters[user]) {
                alreadyVoted = true;
            }
            if (alreadyVoted) {
                if (poll.voters[user] === optionIndex) { // Duplicate vote.
                    res.status(409).send();
                } else { // Change vote.
                    poll.votes[poll.voters[user]]--;
                    poll.votes[optionIndex]++;
                    poll.voters[user] = optionIndex;
                    db.collection('polls').update({id: pollId}, poll, function(err, result) {
                        if (err) throw err;
                        res.send();
                    });
                }
            } else { // New vote.
                poll.votes[optionIndex]++;
                poll.voters[user] = optionIndex;
                db.collection('polls').update({id: pollId}, poll, function(err) {
                    if (err) throw err;
                    res.send();
                });
            }
        });
    }
});

app.post('/add-option', function(req, res) {
    if (!req.isAuthenticated()) {
        res.status(401).send();
    } else {
        let pollId = req.body.id;
        let option = req.body.option;
        if (typeof pollId === 'undefined' || typeof option === 'undefined') {
            res.status(500).send();
        }
        db.collection('polls').update({id: pollId}, {$push: {options: option, votes: 0}}, function(err) {
            if (err) throw err;
            res.send();
        });
    } 
});

app.post('/delete-poll', function(req, res) {
    if (!req.isAuthenticated()) {
        res.status(401).send();
    } else {
        let id = req.body.id;
        if (typeof id === 'undefined') {
            res.status(500).send();
        } else {
            db.collection('polls').find({id: id}).toArray(function(err, result) {
                if (err) throw err;
                if (req.user === result[0].author || req.user === 'Admin') {
                    db.collection('polls').remove({id: id}, function(err) {
                        if (err) throw err;
                        res.send();
                    });
                } else {
                    res.status(403).send();
                }
            });
        }
    }
});

app.get('/my-polls', function(req, res) {
    if (req.isAuthenticated()) {
        let author = req.user;
        db.collection('polls').find({author: author}).toArray(function(err, result) {
            if (err) throw err;
            res.render('my-polls.ejs', {authenticated: req.isAuthenticated(), user: req.user, moment: moment, polls: result});
        });
    } else {
        res.redirect('/login');
    }
});

app.post('/my-polls', function(req, res) {
    let author = req.body.author;
    if (typeof author === 'undefined') {
        return res.status(400).json({error: "Unexpected server error. Please try again."});
    } else {
        db.collection('polls').find({author: author}).toArray(function(err, result) {
            if (err) throw err;
            res.json({result});
        });
    }
});

app.get('/admin', function(req, res) {
    if (req.isAuthenticated() && req.user === "Admin") {
        db.collection('polls').find().toArray(function(err, result) {
            if (err) throw err;
            let polls = result;
            db.collection('users').find().toArray(function(err, result) {
                if (err) throw err;
                let users = result;
                res.render('admin.ejs', {authenticated: req.isAuthenticated(), user: req.user, polls: polls, users: users});
            });
        }); 
    } else {
        res.redirect('/login');
    }
});
