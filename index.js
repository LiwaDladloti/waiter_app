var express = require('express');
var body_parser = require('body-parser');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var app = express();

app.use(express.static('public'));
app.use(body_parser.urlencoded({extended: false}));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.listen(8081, function(){
    console.log('app running on port 8081')
});

const mongoURL = process.env.MONGO_DB_URL || "mongodb://waiter:waiter@ds149373.mlab.com:49373/waiter_app";
mongoose.connect(mongoURL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
console.log('We are connected');
});

var testSchema = mongoose.Schema({
    user: String,
    pass: String,
    days: String
});

var waiterModel = mongoose.model('waiterModel', testSchema);


app.get('/login', function(req, res){
    res.render('login');
});

app.get('/signUp', function(req, res){
    res.render('signup');
});

var status = false;
var onlineUser = "";

function statusMsg(stats) {
    if (stats == true) {
        return "Yaa!";
    }
}

app.get('/waiter/:user', function(req, res){
    onlineUser = req.params.user;
    res.render('waiter', {msg: 'Welcome ' + req.params.user, selectError: statusMsg(status)});
});

app.post('/waiter', function(req, res){
    var daysSelected = req.body.days;
    console.log(daysSelected);
    if(daysSelected){
        var newUser = new waiterModel ({
            days: daysSelected
        });
        newUser.save(function(err){
        if (err) {
                console.log(err);
        }
        res.render('waiter', {daysSent: 'days sent successfully :)'});
    }); 
    } else {
      console.log('error');
      status = true;
      res.redirect('/waiter/' + onlineUser);
    }
});

//app.post('/login', function(req, res){
//    var username = req.body.username;
//    var password = req.body.password;
//    
//    
//});
//
//app.post('/signUp', function(req, res){
//    var setUsername = req.body.setUsername;
//    var setPassword = req.body.setPassword;
//    var confirmPassword = req.body.confirmPassword;
//    
//    if(setPassword === confirmPassword){
//        var newUser = new waiterModel ({
//            user: setUsername,
//            pass: confirmPassword
//        });
//        newUser.save(function(err){
//        if (err) {
//                console.log(err);
//            }
//        });
//        res.render('login', {successlogin: 'your signUp was successful, login here:'});
//    } else if (setPassword !== confirmPassword) {
//        console.log('Error');
//        res.render('signup', {signupfail: 'password should match, plaese try again'})
//    }
//});