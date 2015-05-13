// Makes extensive use of closures.
// TODO: make it so that it will work as a static object or able to track auth
// - the static version makes it easy to use if you already have an api key in memory.
// - the instantiated version makes it fairly trivial to use the library to make an app
//   that doesn't have to worry about the api key concept at all by using a login UI.

// a library of helper functions mostly related to working with collections
var _ = require('underscore');
// gives us a tool for replacing named and positional arguments in a string.
var format = require("string-template");
// a library for making http requests
var request = require('request');
// promises!
var Q = require('q');
// grab the descriptions
var Descriptions = require('./descriptions');

// The location of the API.
var BASE_URL = "https://bonus.ly/api/v1/";

// removes trailing forward slashes `/` for combining url partials
function trimSlashes (str) {
  // `^\/` - "does it start with a /"
  // `\/$` - "does it end with a /"
  return str.replace(/^\/|\/$/g, "");
}

// Combines `url_partial` with the base url and inflates the url template with `data`
// Note: it doesn't matter if url_partial has trailing `/`'s.
// Note: grab :params from data and copy them to the url. ie read the url and look for things to replace
// and then replace them. pattern is /bonuses/{id} for a parameter `id`
function buildUrl (url_partial, data) {
  url_partial = trimSlashes(url_partial);
  var expanded_url_partial = format(url_partial, data);
  var full_url = BASE_URL + expanded_url_partial;
  return full_url;
}

// TODO: revisit this signature. maybe positional arguments are better? depends on the new abstration
// returns a promise for the result of the http api call
function SendHTTPRequest (endpoint_options, data) {
  var method = endpoint_options.method;
  var url_partial = endpoint_options.url;
  // ensure that the endpoint's required parameters exist in the provided options
  // Note: only requires that the keys are set. the values can be falsey.
  var requiredKeysExist = _.every(endpoint_options.required, function (key) {
    return key in data;
  });
  if (! requiredKeysExist) {
    // bail because we're missing a required option
    return;
  }

  // TODO: remove the keys used in the url from the data object
  var url = buildUrl(url_partial, data);

  // Note: the docs suggest access_token *has* to be in the query string, but it appears it is safe to do it in the post body
  // so I'm just going to let it get encoded and transported the same was as the rest of the data depending on the HTTP method
  var request_options = {
    url: url,
    method: method,
  };
  switch (method.toLowerCase()) {
    case "get":
      request_options.qs = data;
      break;
    default:
      request_options.form = data;
      break;
  }
  // todo: re-evaluate this resolution value
  console.log(request_options);
  var def = Q.defer();
  request(request_options, function (err, res, body) {
    if (err) {
      def.reject(err);
      return
    }
    var result_data = JSON.parse(body);
    def.resolve({data: result_data, response: res});
  });
  return def.promise;
}

// returns a callable that accepts the options provided at runtime
// i guess this is basically currying.
function MakeEndpoint (endpoint_options) {
  // define the default values
  var BASE_OPTIONS = {
    required: [],
    optional: [],
    auth: true,
    method: "GET"
  };
  // set the default values
  endpoint_options = _.extend(BASE_OPTIONS, endpoint_options);

  // create a function that when called will return the result of SendHTTPRequest with some parameters.
  return function (opts) {
    // merge the access_token in at runtime so it will reflect the most recently authenticated user
    // by passing opts as the last parameter, if an access_token is specified in the options, the internal one isn't used.
    opts = _.extend({access_token: api_key}, opts);
    var promise = SendHTTPRequest(endpoint_options, opts);
    // if this endpoint has a callback registered
    if (endpoint_options.cb) {
      promise.then(function (results) {
        endpoint_options.cb(results.data, results.response);
      });
    }
    return promise;
  }
};


// Note: the scope of `api_key` is *very* important here.
// it is used sort of like a private member variable.
var Bonusly = function (api_key) {

};
// Lets us define the structure of the calls while also creating
//   the objects that handle the calls.
// It would probably be possible to do this at runtime
//   by iterating the keys of `Descriptions`.
Bonusly.authenticate = {
  session: MakeEndpoint(Descriptions['authenticate.session']),
  oauth: MakeEndpoint(Descriptions['authenticate.oauth'])
};
Bonusly.bonuses = {
  getAll: MakeEndpoint(Descriptions['bonuses.getAll']),
  getOne: MakeEndpoint(Descriptions['bonuses.getOne']),
  create: MakeEndpoint(Descriptions['bonuses.create'])
};
Bonusly.users = {
  getAll: MakeEndpoint(Descriptions['users.getAll']),
  getOne: MakeEndpoint(Descriptions['users.getOne']),
  create: MakeEndpoint(Descriptions['users.create']),
  update: MakeEndpoint(Descriptions['users.yodate']),
  delete: MakeEndpoint(Descriptions['users.delete']),
  getRedemptions: MakeEndpoint(Descriptions['users.redemptions.getAll'])
};
Bonusly.values = {
  getAll: MakeEndpoint(Descriptions['values.getAll']),
  getOne: MakeEndpoint(Descriptions['values.getOne'])
};
Bonusly.companies = {
  show: MakeEndpoint(Descriptions['companies.show']),
  update: MakeEndpoint(Descriptions['companies.update'])
};
Bonusly.leaderboards = {
  getStandouts: MakeEndpoint(Descriptions['leaderboards.getStandouts'])
};
Bonusly.rewards = {
  getAll: MakeEndpoint(Descriptions['rewards.getAll']),
  getOne: MakeEndpoint(Descriptions['rewards.getOne']),
  create: MakeEndpoint(Descriptions['rewards.create'])
};
Bonusly.redemptions = {
  getOne: MakeEndpoint(Descriptions['redemptions.getOne'])
};



var APIBindings = {
  getApiKey: function () {
    return api_key;
  },

};

module.exports = Bonusly;
