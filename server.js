//define some vars
var port = 3000;

var express = require('express');
var LastFmNode = require('lastfm').LastFmNode;
var config = require('./server/lastfm.config.js');

//the business
var api = express();
api.use(express.static(__dirname + '/ui/dist'));
var lastfm = new LastFmNode(config.lastfm);

//define some fun routes
api.get('', function(req, res) {
	res.send('..\\ui\\dist');
});

api.get('/api/artists', function(req, res) {
	lastfm.request('artist.search', {
		artist: req.query.q,
		handlers: {
			success: function(data) {
				var artists = data.results.artistmatches.artist

				res.send(artists);
			},
			error: function(error) {
				res.send(error);
			}
		}
	});
});

api.get('/api/toptracks', function(req, res) {
	lastfm.request('artist.getTopTracks', {
		artist: req.query.q,
		handlers: {
			success: function(data) {
				var tracks = data.toptracks.track

				res.send(tracks);
			},
			error: function(error) {
				res.send(error);
			}
		}
	});
});

//kick this puppy off
api.listen(port);
console.log('listenin\', bitch');