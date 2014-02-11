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
		},
		widget: null
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

function initSoundcloud() {
	services[0].widget = SC.Widget('soundcloudPlayer');
	services[0].widget.bind(SC.Widget.Events.FINISH, function() {
		var i = queue.get('queue').indexOf(play.get('content'));
		if (queue.get('queue').length > i + 1) {
			play.set('content', queue.get('queue')[i + 1]);
			playSoundcloud(play.get('content').uri);
			//TODO this code gets repeated later, bad
			jQuery('.queue').find('li.active-content').removeClass('active-content');
			jQuery(jQuery('.queue').find('li')[i + 1]).addClass('active-content');
		}
	});
}

function playSoundcloud(uri) {
	if (!services[0].widget) initSoundcloud();
	services[0].widget.load(uri, {
			auto_play: true,
			show_artwork: false,
			show_comments: false
		});
}

var search,
	queue,
	play;
	
play = new Ractive({
	el: "playContainer",
	template: "#play",
	data: {
		content: null
	}
});

queue = new Ractive({
	el: "queueContainer",
	template: "#queue",
	data: {
		queue: [],
		active: null
	}
});

queue.on('play', function(e) {
	var content = this.get('queue')[e.node.getAttribute('data-index')];
	jQuery('.queue').find('li.active-content').removeClass('active-content');
	jQuery(e.node).addClass('active-content');
	play.set('content', content);
	console.log(content.uri);
	playSoundcloud(content.uri);
});

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
				openView('queueContainer');
			});
});

search.on('addToQueue', function(e) {
	var content = this.get('results')[e.node.getAttribute('data-index')];
	queue.get('queue').push(content);
	openView('playContainer');
});

function openView(id) {
	jQuery("#" + id).removeClass('hidden');
}
