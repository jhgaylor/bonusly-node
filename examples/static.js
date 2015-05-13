var Bonusly = require('../main');

// grab an api key from the environment.
var API_KEY = process.env.BONUSLY_API_KEY;

// Get all the bonuses for the current user (as determined by the api key)
// Bonusly calls return a promise for the results.
// Note that the is no instance of the Bonusly client. Authenticate will work, but
// you will be expected to track the results manually.
Bonusly.bonuses.getAll({access_token: API_KEY}).then(function (results) {
  console.log("Got data", results.data);
})
// error propogation is done though rejecting promises
.catch(function (err) {
  console.log("Experienced an error getting all bonuses.", err.stack);
});

Bonusly.authenticate.session({email: process.env.BONUSLY_EMAIL, password: process.env.BONUSLY_PASSWORD})
.then(function (results) {
  var api_key = results.response.headers['x-bonusly-authentication-token'];
  console.log("the api key found is", api_key);
});
