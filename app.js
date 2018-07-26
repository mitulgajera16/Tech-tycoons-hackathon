var createError = require("http-errors");
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const Graph = require('node-dijkstra');
var app = express();
var $ = require('jQuery');

var MongoClient = require("mongodb").MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = "mongodb://localhost:27017/hakathon";
var DB;
MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
  if (err) throw err;
  console.log("----------MONGO DBCONNECTION SUCCESS----------");
   DB = db.db("hakathon");
});
module.exports.DB=DB;
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get('/add_circle', function(req, res, next) {
    res.render('add_circle');
});
app.get('/add_neigh', function(req, res, next) {
    DB.collection('signals').find({}).toArray(function(err,docs){
      res.render('add_neigh',{ listSignals :docs});
    });
});
app.get('/add_hospital', function(req, res, next) {
    DB.collection('signals').find({}).toArray(function(err,docs){
      res.render('add_hospital',{ listSignals :docs});
    });
});
app.get('/get_path', function(req, res, next) {
    DB.collection('signals').find({}).toArray(function(err,docs){
      res.render('get_path',{ listSignals :docs});
    });
});
app.get('/add_station', function(req, res, next) {
    DB.collection('signals').find({}).toArray(function(err,docs){
      res.render('add_station',{ listSignals :docs});
    });
});
app.get('/', function(req, res, next) {
    res.render('index',{title:'HACKATHON'});
});
app.post('/add_circle', function(req, res, next) {
  DB.collection('signals').insertOne({
    name: req.body.c_name,
    location: {
      lat:req.body.c_lat,
      lng:req.body.c_lng
    },
    ngh:[

    ]
  });
  res.redirect('/');
});

app.post('/add_hospital', function(req, res, next) {
  DB.collection('hospitals').insertOne({
    name: req.body.c_name,
    location:req.body.n_circle,
    h_class :req.body.h_class,
    signal_list:[

    ]
  });
  res.redirect('/');
});

app.post('/add_station', function(req, res, next) {
  DB.collection('stations').insertOne({
    name: req.body.c_name,
    total_amb:req.body.total_amb,
    location :req.body.n_circle
  });
  res.redirect('/');
});

app.post('/add_neigh', function(req, res) {
  console.log('------------------------req-START------------------'+'\n'+(JSON.stringify(req.body.signal)));
  DB.collection('signals').update({'_id':ObjectID(req.body.signal)},
    {
      $push :{
           ngh:{
              id:req.body.neighbour,
              dis:req.body.distance,
              trafficRatio:req.body.trafficMargin,
              speedLimit:req.body.speedLimit
            }
      }
    }
  ,function(err,res)
    {
      if(err)
        throw err;
      console.log('update---------------------->');
    }
  );
res.redirect('/');
});
app.post('/get_path', function(req, res) {
  findPath(req.body.start,req.body.end);
  res.redirect('/');
});
function findPath(start,end) {
  console.log(start);
  console.log(end);
  const route = new Graph();
  console.log("--------------------------------------------------------");
  DB.collection('signals').find().toArray(function(err,docs)
    {
        if(err)
          {
            throw err;
          }
        ///
        var g = new Graph();
        var len=docs.length;
        for (var i = 0; i < docs.length; i++) {
            var ngh=array[i].ngh;
            var temp={};
            for (var ngh1 in ngh) {
            $.extend(temp,{'temp.ngh1.id':ngh1.dis});
            }
            g.addVertex(docs[i]._id, temp);
        }

        console.log(g.shortestPath(start, end));
        console.log("------------------------------------------------------");
      }
  );


}
//speed is in km/hour
//distance is in km
//trafficRatio in percent { trafficRatio will decrease speed by persent};
function getTimeToTravel(trafficRatio,speedLimit,distance) {
  return (3600*distance)/((100-trafficRatio) * speedLimit);
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


module.exports = app;
