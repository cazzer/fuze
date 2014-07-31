//define some vars
var express = require('express');
var LastFmNode = require('lastfm').LastFmNode;

//the business
var api = express();
api.use(express.static(__dirname + '/ui/dist'));
var lastfm = new LastFmNode(require('./server/lastfm.config.js'));

//define some fun routes
api.get('', function(req, res) {
	res.send('..\\ui\\dist');
});

api.get('/api/search', function(req, res) {

});

//kick this puppy off
api.listen(3000);
console.log('listenin\', bitch');