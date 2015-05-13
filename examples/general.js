var Bonusly = require('../main');

// grab an api key from the environment.
var API_KEY = process.env.BONUSLY_API_KEY;

// create an api client with that key.
var b = new Bonusly(API_KEY);

// Get all the bonuses for the current user (as determined by the api key)
// Bonusly calls return a promise for the results.
b.bonuses.getAll({}).then(function (results) {
  console.log("Got data", results.data);
})
// error propogation is done though rejecting promises
.catch(function (err) {
	console.log("Experienced an error getting all bonuses.", err.stack);
});
