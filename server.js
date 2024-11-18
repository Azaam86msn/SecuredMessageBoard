'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet'); // Import Helmet for security headers

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

// Use Helmet for setting various HTTP security headers
app.use(helmet());

// Prevent loading your site in an iframe on other websites (X-Frame-Options)
app.use(helmet.frameguard({ action: 'sameorigin' }));

// Disable DNS prefetching (X-DNS-Prefetch-Control)
app.use(helmet.dnsPrefetchControl({ allow: false }));

// Only allow your site to send the referrer for your own pages (Referrer-Policy)
app.use(helmet.referrerPolicy({ policy: 'same-origin' })); // Strict no referrer for external pages

// Serving static files from the /public directory
app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); // For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end routes
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });

app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start the server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
