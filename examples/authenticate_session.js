var Bonusly = require('../main');

// You will need the user's email address and password
// in order to get their api key. This probably comes from the ui.
var user_email = process.env.BONUSLY_EMAIL;
var user_password = process.env.BONUSLY_PASSWORD;

// create an instance of the client with no API key set.
// in fact, if the api key tracking isn't desired, it wouldn't
// even need to be instantiated. `var b = Bonusly;`
var b = new Bonusly();
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
