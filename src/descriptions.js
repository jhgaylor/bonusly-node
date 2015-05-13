// note: this uses strings with .'s - This does not allow access of this.bonuses.getAll, instead this['bonuses.getAll'] is required. bummer
module.exports = {
  'authenticate.session': {
    required: ["email", "password"],
    // optional: [],
    method: "POST",
    url: "sessions",
    cb: function (data, response) {
      if (response.headers['x-bonusly-authentication-token']) {
        // NOTE: the scope on api_key is the one from the closure.
        api_key = response.headers['x-bonusly-authentication-token']
      }
    },
    auth: false // default - true
  },
  'authenticate.oauth': {
    required: ["provider", "token"],
    // optional: [],
    method: "POST",
    url: "sessions/oauth",
    cb: function (data, response) {
      if (response.headers['x-bonusly-authentication-token']) {
        // NOTE: the scope on api_key is the one from the closure.
        api_key = response.headers['x-bonusly-authentication-token']
      }
    },
    auth: false // default - true
  },
	'bonuses.getAll': {
    required: [],
    // optional: ["limit", "start_time", "end_time", "non_zero", "top_level", "giver_email", "receiver_email", "user_email", "hashtag"],
    method: "GET",
    url: "bonuses"
  },
  'bonuses.getOne': {
    required: ["id"],
    // optional: [],
    method: "GET",
    url: "bonuses/{id}"
  },
  'bonuses.create': {
    required: ["receiver_email", "reason", "amount"],
    // optional: ["giver_email"],
    method: "POST",
    url: "bonuses"
  },
  'users.getAll': {
    required: [],
    // optional: [],
    method: "GET",
    url: "users"
  },
  'users.getOne': {
    required: ["id"],
    // optional: [],
    method: "GET",
    url: "users/{id}"
  },
  'users.create': {
    required: ["email", "first_name", "last_name"],
    // optional: ["custom_properties", "user_mode", "budget_boost", "external_unique_id"],
    method: "POST",
    url: "users"
  },
  'users.update': {
    required: ["id"],
    // optional: ["email", "first_name", "last_name", "custom_properties", "user_mode", "budget_boost", "external_unique_id"],
    method: "PUT",
    url: "users/{id}"
  },
  'users.delete': {
    required: ["id"],
    // optional: ["custom_properties", "user_mode", "budget_boost", "external_unique_id"],
    method: "DELETE",
    url: "users/{id}"
  },
  'users.redemptions.getAll': {
    required: ["id"],
    // optional: [],
    method: "GET",
    url: "users/{id}/redemptions"
  },
  'values.getAll': {
    required: [],
    // optional: [],
    method: "GET",
    url: "values"
  },
  'values.getOne': {
    required: ["id"],
    // optional: [],
    method: "GET",
    url: "values/{id}"
  },
  'companies.show': {
    required: [],
    // optional: [],
    method: "GET",
    url: "companies/show"
  },
  'companies.update': {
    required: ["id"],
    // TODO: how to do * here
    // optional: ["name", "* array of custom_user_properties"],
    method: "PUT",
    url: "companies/update"
  },
  'leaderboards.getStandouts': {
    required: [],
    // optional: ["role", "value", "custom_property_name", "custom_property_value"],
    method: "GET",
    url: "analytics/standouts"
  },
  'rewards.getAll': {
    required: [],
    // optional: ["catalog_country", "request_country"],
    method: "GET",
    url: "rewards"
  },
  'rewards.getOne': {
    required: ["id"],
    // optional: [],
    method: "GET",
    url: "rewards/{id}"
  },
  'rewards.create': {
    required: ["denomination_id", "user_id", "access_token"],
    // optional: [],
    method: "POST",
    url: "rewards"
  },
  'redemptions.getOne': {
    required: ["id"],
    // optional: [],
    method: "GET",
    url: "redemptions/{id}"
  }
}
