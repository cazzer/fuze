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

var search,
	queue,
	play;

search = new Ractive({
	el: "searchContainer",
	template: "#search",
	data: {
		query: "",
		results: []
	}
});

search.on('search', function(e) {
	e.original.preventDefault();
	var queryString = "?q=" + this.get('query') + "&limit=20",
		ctrl = this;
	$.getJSON(services[0]
			.getUrl('/tracks' + queryString)).then(function(data) {
				ctrl.set('results', data);
			});
});

search.on('addToQueue', function(e) {
	var content = this.get('results')[e.node.getAttribute('data-index')];
	console.log(content);
	queue.get('queue').push(content);
});

queue = new Ractive({
	el: "queueContainer",
	template: "#queue",
	data: {
		queue: []
	}
});
