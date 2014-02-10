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

App = Ember.Application.create();

//init services
if (window.location.host == "localhost") {
	SC.initialize({
		client_id: "7eadfcb24859c38770417ef858756544",
		redirect_uri: "localhost/fuze/callbacks/soundcloud.html",
	});	
} else {
	SC.initialize({
		client_id: "1e954d18122fb00918262edc154ceae9",
		redirect_uri: "http://fuze.dayoftheduck.com/callbacks/soundcloud.html",
	});	
}
if ($.cookie('soundcloud')) SC.accessToken($.cookie('soundcloud'));

App.Router.map(function() {
	
	this.resource('welcome');
	this.resource('play', {queryParams: ['content', 'queue', 'query']});
	this.resource('queue', {path: 'queue/:queue_id'});
	this.resource('search', {path: 'search/:query'});
	this.resource('playlists');
	this.resource('playlist', {path: 'playlist/:playlist_id'});
});

App.ApplicationRoute = Ember.Route.extend({
	
	model: function() {
		return {services: services};
	}
});

App.ApplicationController = Ember.ObjectController.extend({
	
	actions: {
		search: function() {
			this.transitionToRoute('play', {queryParams: {query: this.get('query')}});
		},
		connectTo: function(service) {
			service.connect();
		}
	}
});

App.PlayController = Ember.ArrayController.extend({
	queryParams: ['content', 'queue', 'query'],
	content: null,
	queue: null,
	query: null,
	
	
	contents: [],
	results: [],
	
	queryField: Ember.computed.oneWay('query'),
	actions: {
		search: function() {
			var ctrl = this;
			if (!this.query) return;
			this.transitionToRoute('play', {queryParams: {query: this.query}});
			var queryString = "?q=" + this.query + "&limit=20";
			$.getJSON(services.findBy('name', 'Soundcloud')
					.getUrl('/tracks' + queryString)).then(function(data) {
						ctrl.set('results', data);
					});
		},
		addToQueue: function(content) {
			var tempContents = this.contents;
			tempContents.push(content);
			this.set('contents', tempContents);
		}
	}
});

App.PlayRoute = Ember.Route.extend({
	/*
	model: function(params) {
		if (!params.query) return [];
		var query = "?q=" + params.query + "&limit=10";
		return {
			results: $.getJSON(services.findBy('name', 'Soundcloud')
							.getUrl('/tracks' + query)).then(function(data) {
								return data;
					})
		};
	},
	actions: {
		search: function() {
			this.refresh();
		},
		queryParamsDidChange: function() {
			this.refresh();
		}
	}
	*/
});

/**
App.PlayController = Ember.ArrayController.extend({
	queryParams: ['content', 'queue', 'query'],
	
	//queryField: Ember.computed.oneWay('query'),
	actions: {
		search: function() {
			this.set('query', this.get('queryField'));
		}
	}
});

App.PlayRoute = Ember.Route.extend({
	
	model: function(params) {
		return {
				content: $.getJSON(services.findBy('name', 'Soundcloud')
						.getUrl('/tracks/' + params.content_id + '.json'))
						.then(function(data) {
							return data;
						}),
				query: params.query
		}
	},
	actions: {
		queryParamsDidChange: function() {
			this.refresh();
		}
	},
	afterModel: function() {
	//	soundcloudPlayer = SC.Widget("soundcloud-player");
	}
});
*/

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


