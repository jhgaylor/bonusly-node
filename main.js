// About: A library for making requests to the Bonus.ly HTTP api.
// Makes extensive use of closures.

// a library of helper functions mostly related to working with collections
var _ = require('underscore');
// gives us a tool for replacing named and positional arguments in a string.
var format = require("string-template");
// a library for making http requests
var request = require('request');
// promises!
var Q = require('q');

// The location of the API.
var BASE_URL = "https://bonus.ly/api/v1/";

// Note: url_partial should *NOT* start with a slash.
// TODO: use the url library to combine them smartly.
// Note: grab :params from data and copy them to the url. ie read the url and look for things to replace
// and then replace them. pattern is /bonuses/{id} for a parameter `id`
// Combines `url_partial` with the base url (TODO: while removing duplicate /'s)
function buildUrl (url_partial, data) {
  var expanded_url_partial = format(url_partial, data);
  var full_url = BASE_URL + expanded_url_partial;
  return full_url;
}

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
  // todo: return a promise for the data as an object
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

// Note: the scope of `api_key` is *very* important here. 
// it is used sort of like a private member variable.
var Bonusly = function (api_key) {
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
      opts = _.extend(opts, {access_token: api_key});
      var promise = SendHTTPRequest(endpoint_options, opts);
      // if this call needs to update the api key
      if (endpoint_options.auth === false) {
        // this is an enpoint that is doing authentication
        // store the results
        // NOTE: the scope on api_key is the one from the closure.
        promise.then(function (results) {
          if (results.response.headers['x-bonusly-authentication-token']) {
            api_key = results.response.headers['x-bonusly-authentication-token']
          }
        });
      }
      return promise;
    }
  }

  // lets us define the structure of the calls while also creating the objects that handle the calls.
  var Endpoints = {
    getApiKey: function () {
      return api_key;
    },
    // TODO: how do i attach a callback that will modify api_key basically for free.
    authenticate: {
      session: MakeEndpoint({
        required: ["email", "password"],
        // optional: [],
        method: "POST",
        url: "sessions",
        auth: false // default - true
      }),
      oauth: MakeEndpoint({
        required: ["provider", "token"],
        // optional: [],
        method: "POST",
        url: "sessions/oauth",
        auth: false // default - true
      })
    },
    bonuses: {
      getAll: MakeEndpoint({
        required: [],
        // optional: ["limit", "start_time", "end_time", "non_zero", "top_level", "giver_email", "receiver_email", "user_email", "hashtag"],
        method: "GET",
        url: "bonuses"
      }),
      getOne: MakeEndpoint({
        required: ["id"],
        // optional: [],
        method: "GET",
        url: "bonuses/{id}"
      }),
      create: MakeEndpoint({
        required: ["receiver_email", "reason", "amount"],
        // optional: ["giver_email"],
        method: "POST",
        url: "bonuses"
      })
    },
    users: {
      getAll: MakeEndpoint({
        required: [],
        // optional: [],
        method: "GET",
        url: "users"
      }),
      getOne: MakeEndpoint({
        required: ["id"],
        // optional: [],
        method: "GET",
        url: "users/{id}"
      }),
      create: MakeEndpoint({
        required: ["email", "first_name", "last_name"],
        // optional: ["custom_properties", "user_mode", "budget_boost", "external_unique_id"],
        method: "POST",
        url: "users"
      }),
      update: MakeEndpoint({
        required: ["id"],
        // optional: ["email", "first_name", "last_name", "custom_properties", "user_mode", "budget_boost", "external_unique_id"],
        method: "PUT",
        url: "users/{id}"
      }),
      delete: MakeEndpoint({
        required: ["id"],
        // optional: ["custom_properties", "user_mode", "budget_boost", "external_unique_id"],
        method: "DELETE",
        url: "users/{id}"
      }),
      getRedemptions: MakeEndpoint({
        required: ["id"],
        // optional: [],
        method: "GET",
        url: "users/{id}/redemptions"
      })
    },
    values: {
      getAll: MakeEndpoint({
        required: [],
        // optional: [],
        method: "GET",
        url: "values"
      }),
      getOne: MakeEndpoint({
        required: ["id"],
        // optional: [],
        method: "GET",
        url: "values/{id}"
      })
    },
    companies: {
      show: MakeEndpoint({
        required: [],
        // optional: [],
        method: "GET",
        url: "companies/show"
      }),
      update: MakeEndpoint({
        required: ["id"],
        // TODO: how to do * here
        // optional: ["name", "* array of custom_user_properties"],
        method: "PUT",
        url: "companies/update"
      })
    },
    leaderboards: {
      getStandouts: MakeEndpoint({
        required: [],
        // optional: ["role", "value", "custom_property_name", "custom_property_value"],
        method: "GET",
        url: "analytics/standouts"
      })
    },
    rewards: {
      getAll: MakeEndpoint({
        required: [],
        // optional: ["catalog_country", "request_country"],
        method: "GET",
        url: "rewards"
      }),
      getOne: MakeEndpoint({
        required: ["id"],
        // optional: [],
        method: "GET",
        url: "rewards/{id}"
      }),
      create: MakeEndpoint({
        required: ["denomination_id", "user_id", "access_token"],
        // optional: [],
        method: "POST",
        url: "rewards"
      })
    },
    redemptions: {
      getOne: MakeEndpoint({
        required: ["id"],
        // optional: [],
        method: "GET",
        url: "redemptions/{id}"
      })
    }
  }
  return Endpoints;
};

module.exports = Bonusly

// Usage: Returns promises for the data
// var b = Bonusly(process.env.BONUSLY_API_KEY || "29bdd0dd4b63be1fde85629b8c956ba4");
// b.bonuses.getAll({}).then(function (data) {
//   console.log("Got data", data);
// })
// b.rewards.getAll({}).then(function (d) {
//   console.log("got data", d)
// }).catch(function(e) {
//   console.log("err", e, e.stack);
// });
// or
// var b = Bonusly();
// b.authenticate.session({...});
// b.bonuses.getAll();
