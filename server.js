// init project
const express = require('express');
const app = express();
//set the env
const dotenv = require('dotenv');
dotenv.config();
//set image engine
const gis = require('g-i-s');
//require/import the mongodb native drivers
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
// using Node.js `require()`
const mongoose = require('mongoose');
// connection URL
const url = process.env.MONGOLAB_URI;      
// connection
const promise_connection = mongoose.connect(url, {
	useMongoClient: true
});
const db = mongoose.connection;
/***************************/

// if connection is success
promise_connection.then(function(db){
	console.log('Connected to mongodb');
});

/***************************/

// describe the schema
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
const searchSeries = new Schema({
    name: String,
    date: Date 
});

// get the model
const ModelSearch = mongoose.model('searchs', searchSeries);

/***************************/
app.use(express.static('public'));
/***************************/
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
/***************************/
app.get("/api/:search", function (request, response) {
    gis(request.params.search, logResults);

function logResults(error, results) {
  if (error) {
    response.send(error);
  }
  else {
    response.json(results);
    // delete first item in the collection
        ModelSearch.deleteOne({"name": {$exists: true}}, (err) => {
         if (!err) console.log("deleted");
       }
     );
    // create a search_item
        let obj = {name: request.params.search, date: new Date()};
        let search_item = new ModelSearch(obj);
        search_item.save(function (err) {
          if (!err) console.log('Success!');
        });
  }
}
});
/***************************/
app.get("/latest", function (request, response) {
   ModelSearch.find({"name": {$exists: true}} , (err, docs) => { if(!err) 
     docs.reverse();
     let arr = [];                
    for(let i = 0; i < docs.length; i++) {
      arr[i] = {
        name: docs[i].name,
        date: docs[i].date
      }
    }
    response.json(arr);
   });
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
