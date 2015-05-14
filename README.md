# bonusly-node

## About

Node bindings for the [Bonusly](https://bonus.ly) HTTP Api.

Calls return a promise for the object represented by the JSON that the API returns.

## How it works

most of the code falls into one of three categories.

1) Descriptions of individual interactions with the HTTP api. This includes things like describing the URL and required parameters as well as registering a callback when the response is received.

2) A "description processer" that takes the provided descriptions and returns a callable that when called with options will return a promise for data from the API.

3) Creating callables from the descriptions and binding them to the public api of the module

## Why I used this pattern

The idea was to treat the HTTP api as a set of calls that could be described using a few common parameters. I was trying to get as close as I could to "generating" code. (I should learn a lisp!) Adding new endpoints becomes as simple as writing a POJO. This wouldn't work if the HTTP API didn't have internal consistency. I bet there is a higher abstraction for this that would allow it to be more easily used to build a client for a new API.

By describing the required parameters, we can give feedback to the developer without waiting for a round trip.  This comes at the expense of having to update the client library any time the http api changes. Depending on how "frozen" the api is, this may or may not be a good trade off. I built this to easily allow that feature to be removed.

Defining optional parameters allows for the library to log warnings if an unexpected parameter is found. Likewise, this can easily be removed.

## How is it used?

There are [examples in the repository](https://github.com/jhgaylor/bonusly-node/tree/master/examples) but this is the `general` example.

```js
var Bonusly = require('Bonusly');

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
```

It is possible to use this as a static object or able to track auth with an instance.

- the static version makes it easy to use if you already have an api key in memory.
- the instantiated version makes it fairly trivial to use the library to make an app that doesn't have to worry about the api key concept at all by using a login UI.


## What is next?

* log warnings if a parameter is found that isn't expected.
* revisit the resolution value of the promise

