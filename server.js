const cors = require('cors-express');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 8081;
const options = {
      allow : {
          origin: '*',
          methods: 'GET,PATCH,PUT,POST,DELETE,HEAD,OPTIONS',
          headers: 'Content-Type, Authorization, Content-Length, X-Requested-With, X-HTTP-Method-Override'
      } 
    }
//require db connection
require('./models');

// import saved db
const Saved = require('./saved');


app.use(cors(options));
// configure app to use bodyparser to extract JSON from POST
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

// Make static assets available to UI
// app.use(express.static('./client/'));

const router = express.Router();
// Serve the UI over express server
router.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './client/public/index.html'))
});

//Initialize API
router.get('/api', function(req, res){
  res.send('API initialized');
})

//Register API routes
app.use('/api', router);

// Route for all records in collection
router.route('/saved')

  // Add a favortie entry to the database
  .post(function(req, res){
    // Create an entry
    const saved = new Saved();
    saved.title = req.body.title,
    saved.authors = req.body.authors,
    saved.rating = req.body.rating,
    saved.publisher = req.body.publisher,
    saved.publishedDate = req.body.publishedDate,
    description = req.body.description,
    saved.thumbnail = req.body.thumbnail,
    saved.price = req.body.price,
    saved.purchase = req.body.purchase;

    // Save the entry and check for errors
    saved.save(function(err){
      if(err) {
        res.send(err);
      } else {
        res.json({
          message: 'Save added',
          saved: saved
        });
      }
    })    
  })
  
  // Retrieve all saved from the database
    .get(function(req, res){
      Saved.find(function(err, saved){
        if(err){
          res.send(err);
        } else {
          res.json(saved);
        }
      });
    })

// Route for specific records
router.route('/saved/:id')

    // Remove a record permanently
    .delete(function(req, res) {
        Saved.remove({_id: req.params.id}, function(err){
          if(err){
            res.send(err);
          } else {
            res.send("Record Removed");
          }
        })
        res.status(204).end();
    })

// Start the API server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}.`);
});