var Bonusly = require('../main');

// You will need the user's email address and password
// in order to get their api key. This probably comes from the ui.
var user_email = "jake@example.com";
var user_password = "<password>";

// create an instance of the client with no API key set.
// in fact, without the api key tracking, it wouldn't
// even need to be instantiated.
var b = Bonusly();
console.log("the api key when starting is ", b.getApiKey())
// send the authentication request
// it will begin tracking the api key automatically
b.authenticate.session({
  email: user_email,
  password: user_password
})
.then(function (results) {
  // we pass through the response mostly for debugging. it makes the internal
  // api less awesome though because we have this wrapper object.
  var api_key = results.response.headers['x-bonusly-authentication-token'];
  console.log("the api key found is", api_key);
  console.log("the api key of the instance is", b.getApiKey())
})
.catch(function (err) {
  // error handler
  console.log(err.stack);
});