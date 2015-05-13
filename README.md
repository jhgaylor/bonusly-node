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
