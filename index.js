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

const mongoURL = process.env.MONGO_DB_URL || "mongodb://localhost/waiter_app";
mongoose.connect(mongoURL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
console.log('We are connected');
});

var testSchema = mongoose.Schema({
    user: String,
//    pass: String,
    days: {
        Sunday: Boolean,
        Monday: Boolean,
        Tuesday: Boolean,
        Wednesday: Boolean,
        Thursday: Boolean,
        Friday: Boolean,
        Saturday: Boolean
    }
});

var waiterModel = mongoose.model('waiterModel', testSchema);

//app.get('/login', function(req, res){
//    res.render('login');
//});
//
//app.get('/signUp', function(req, res){
//    res.render('signup');
//});

var status = false;
var onlineUser = "";

function statusMsg(stats) {
    if (stats == true) {
        return "Please select days before pressing the send button!";
    }
}

app.get('/waiter/:user', function(req, res){
    onlineUser = req.params.user;
    res.render('waiter', {msg: 'Welcome ' + req.params.user, selectError: statusMsg(status)});
});

app.post('/waiter/:user', function(req, res){
    var daysSelected = req.body.days;
    var user = req.params.user;
    var pushedDays = {};
    
    if(!Array.isArray (daysSelected)){
        daysSelected = [daysSelected]
    }
    daysSelected.forEach(function(day){
        pushedDays[day] = true;
    })
    
        waiterModel.findOneAndUpdate({
            user: user},
            {
            days: pushedDays
        },
        function(err, result){
            if(err){
                console.log(err)
            } else {
                if(!result){
                var newShift = new waiterModel({
                user: user,
                days: pushedDays
            })
            newShift.save(function(err){
            if (err) {
                console.log(err);
            } else {
                res.render('waiter', {daysSent: 'days sent successfully'});
            }
        })
    }  else {
    res.render('waiter', {daysSent: 'days updated successfully'})
    }
}    
})
});

app.get('/days', function(req, res){
    var workingDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    var waitersShifts = {
         Sunday: {
            waiter:  []
         },
         Monday: {
            waiter: []
        },
         Tuesday: {
             waiter: []
         },
         Wednesday: {
             waiter: []
         },
         Thursday: {
             waiter: []
         },
         Friday: {
             waiter: []
         },
         Saturday: {
             waiter: []
         }
        }
    
    waiterModel.find({}, function(err, results){
        if(err){
            console.log(err)
        } else {
            results.forEach(function(shift){
                workingDays.forEach(function(day){
                    if(shift.days[day]){
                        waitersShifts[day].waiter.push(shift.user)
                    }
                })
            })
        res.render('days', {waiterName: waitersShifts})
        }
    });
});