App = Ember.Application.create();

//init services
SC.initialize({
	client_id: "1e954d18122fb00918262edc154ceae9",
	redirect_uri: "http://localhost/fuze/callbacks/soundcloud.html",
});
if ($.cookie('soundcloud')) SC.accessToken($.cookie('soundcloud'));

App.Router.map(function() {
	this.resource('welcome');
	this.resource('play', {path: 'play/:content_id'}, function() {
		this.resource('queue', {path: 'queue/:queue_id'});
		this.resource('search', {path: 'search/:query'});
		this.resource('playlists');
		this.resource('playlist', {path: 'playlist/:playlist_id'});
	});
	
});

App.ApplicationRoute = Ember.Route.extend({
	model: function() {
		return {services: services};
	}
});

App.ApplicationController = Ember.ObjectController.extend({
	
	actions: {
		search: function() {
			this.transitionToRoute('search', this.get('query'));
		},
		connectTo: function(service) {
			service.connect();
		}
	}
});

App.SearchRoute = Ember.Route.extend({

	model: function(params) {
		if (!params.query) return [];
		var query = "?q=" + params.query + "&limit=10";
		return $.getJSON(services.findBy('name', 'Soundcloud')
				.getUrl('/tracks' + query)).then(function(data) {
			return data;
		});
	}
});

App.PlayRoute = Ember.Route.extend({
	model: function(params) {
		return $.getJSON(services.findBy('name', 'Soundcloud')
				.getUrl('/tracks/' + params.content_id + '.json')).then(function(data) {
			SC.stream('/tracks/' + params.content_id, {autoPlay: false},
				function(content) {
					if (the_content.playState == 1) {
						the_content.stop();
					}
					the_content = content;
					the_content.play();
				});
			return data;
		});
	}
});

App.PlaylistsRoute = Ember.Route.extend({
	model: function() {
		return $.getJSON(services.findBy('name', 'Soundcloud')
				.getUrl('/me/playlists.json')).then(function(data) {
			return data;
		});
	}
});

App.PlaylistRoute = Ember.Route.extend({
	model: function(params) {
		return $.getJSON(services.findBy('name', 'Soundcloud')
				.getUrl('/playlists/' + params.playlist_id + '.json'))
				.then(function(data) {
			return data;
		});
	}
});

var the_content = {playState: 0};

var services =  [
	{
		name: "Soundcloud",
		class: function() {
			return "glyphicon-remove";
		},
		connect: function() {
			SC.connect(function() {
				$.cookie('soundcloud', SC.accessToken(), {expires: 365});
			});
		},
		getUrl: function(path, options) {
			var append = path.indexOf("?") !== -1 ? "&" : "?";
			return "https://api.soundcloud.com" 
					+ path + append + "oauth_token=" + SC.accessToken() + "&format=json";
		}
	},
	{
		name: "Youtube",
		class: "glyphicon-remove",
		connect: function() {
			return "glyphicon-remove";
		}
	}
];
