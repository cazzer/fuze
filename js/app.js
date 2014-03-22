var api =  {
	soundcloud: {
		name: "Soundcloud",
		class: function() {
			return "glyphicon-remove";
		},
		initialize: function() {
			SC.initialize({
					client_id: "1e954d18122fb00918262edc154ceae9",
					redirect_uri: "http://fuze.dayoftheduck.com/callbacks/soundcloud.html",
				});	
			if ($.cookie('soundcloud')) {
				SC.accessToken($.cookie('soundcloud'));
				$("#soundcloud-status").addClass('green');
			} else {
				$("#soundcloud-status").addClass('red');
			}	
		},
		connect: function() {
			SC.connect(function() {
				$.cookie('soundcloud', SC.accessToken(), {expires: 365});
				if (SC.isConnected()) {
					jQuery("#soundcloud-status").switchClass('red', 'green');
				} else {
					jQuery("#soundcloud-status").switchClass('green', 'red');
				}
			});
		},
		client_id: "7eadfcb24859c38770417ef858756544",
		getUrl: function(path, options) {
			var append = path.indexOf("?") !== -1 ? "&" : "?",
				token = SC.accessToken() ? "oauth_token=" + SC.accessToken() + "&" : "client_id=" + this.client_id + "&";
			return "https://api.soundcloud.com" 
					+ path + append + token + "format=json";
		},
		search: function(q, callback) {
			$.getJSON(this.getUrl("/tracks?q=" + q + "&limit=10")).then(function(data) {
				var normalized = [];
				jQuery.each(data, function(index, obj) {
					normalized.push({
						service: 'soundcloud',
						title: obj.title,
						url: obj.uri,
						image: obj.artwork_url ? obj.artwork_url : '',
						likes: obj.favoritings_count,
						plays: obj.playback_count
					});
				});
				callback(normalized);
			});	
		},
		play: function(content) {
			if (!this.widget) this.initializeWidget();
			this.widget.load(content.url, {
					auto_play: true,
					show_artwork: false,
					show_comments: false
				});	
		},
		stop: function() {
			this.widget.pause();
		},
		initializeWidget: function() {
			this.widget = SC.Widget('soundcloudPlayer');
			this.widget.bind(SC.Widget.Events.FINISH, playNextContent);	
		},
		widgetId: '#soundcloudPlayer',
		widget: null
	},
	youtube: {
		name: "Youtube",
		client_id: 'AIzaSyCq2WoAltPXHDhXuaTRhbkQDv3CkyrqCRA',
		get_url: function(path, options) {
			return "https://www.googleapis.com/youtube/v3/" + path + "&key=" + this.client_id;
		},
		search: function(q, callback) {
			$.getJSON(this.get_url("search?part=snippet&type=video&maxResults=10&q=" + q)).then(function(data) {
				var normalized = [];
				jQuery.each(data.items, function(index, obj) {
					normalized.push({
						service: 'youtube',
						title: obj.snippet.title,
						image: obj.snippet.thumbnails.default.url ? 
								obj.snippet.thumbnails.default.url : '',
						description: obj.snippet.description,
						id: obj.id.videoId
					});
				});
				callback(normalized);
			});
		},
		play: function(content) {
			if (!this.widget) this.initializeWidget(content);
			this.widget.loadVideoById(content.id);
		},
		stop: function() {
			this.widget.stopVideo();
		},
		onReady: function(event) {
			event.target.playVideo();
		},
		onStateChange: function(event) {
			if (event.data == 0) playNextContent();
		},
		initializeWidget: function(content) {
			this.widget = new YT.Player('youtubePlayer', {
				height: '320',
				width: '100%',
				videoId: content.id,
				events: {
					'onReady': this.onReady,
					'onStateChange': this.onStateChange
				}
			});
		},
		widgetId: '#youtubePlayer',
		widget: null
	}
};

jQuery(function($) {
	if (bootstrapState() == 'xs') {
		$("#playContainer").addClass('hidden');
		$("#queueContainer").addClass('hidden');
	}
	api.soundcloud.initialize();
	
	$(".mobile-nav-btn").click(function() {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		$(".site-section").addClass('hidden');
		$($(this).data("target")).removeClass('hidden');
	});
});

var search,
	queue,
	play,
	services;
	
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
		active: null,
		services: services
	}
});

queue.on('play', function(e) {
	var content = this.get('queue')[e.node.getAttribute('data-index')];
	jQuery('.queue').find('li.active-content').removeClass('active-content');
	jQuery(e.node).addClass('active-content');
	playContent(content);
});

queue.on('remove', function(e) {
	this.get('queue').splice(e.node.parentNode.getAttribute('data-index'), 1);
});

queue.on('save', function(e) {
	e.original.preventDefault();
	alert("I can't do that yet.");
});

queue.on('clear', function(e) {
	this.set('queue', []);
});

function playNextContent() {
	var i = queue.get('queue').indexOf(play.get('content'));
	if (queue.get('queue').length > i + 1) {
		//TODO this code gets repeated later, bad
		jQuery('.queue').find('li.active-content').removeClass('active-content');
		jQuery(jQuery('.queue').find('li')[i + 1]).addClass('active-content');
	}
	playContent(queue.get('queue')[i + 1]);
}

function playContent(content) {
	if (play.get('content') && play.get('content').service != content.service) {
		api[play.get('content').service].stop();
		jQuery(api[play.get('content').service].widgetId).addClass('hidden');
	}
	play.set('content', content);
	jQuery(api[content.service].widgetId).removeClass('hidden');
	try {
		api[content.service].play(content);
	}
	catch (e) {
		console.log("Service " + content.service + " does not have a 'play' method.", e);
	}
}

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
	//setup result handlers
	this.set('results', []);
	results = [];
	calls = 2;
	//make calls
	api.soundcloud.search(this.get('query'), searchCallback);
	api.youtube.search(this.get('query'), searchCallback);
});

var results = [],
	calls = 0;
function searchCallback(data) {
	results = jQuery.merge(results, data);
	if (!--calls) {
		results = shuffle(results);
		search.set('results', results);
	}
}

function shuffle(o) {
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

search.on('addToQueue', function(e) {
	var content = this.get('results')[e.node.getAttribute('data-index')];
	queue.get('queue').push(content);
});

services = new Ractive({
	el: "servicesContainer",
	template: "#services",
	data: {
		services: [
			{name: "Soundcloud", slug: "soundcloud"},
			{name: "Youtube", slug: "youtube"}
		]
	}
});

services.on('connect', function(e) {
	try {
		api[e.node.getAttribute('data-service')].connect();
	}
	catch(e) {
		api.soundcloud.connect();
		console.log('Connecting to default service.', e);
	}
});

/* displayl logic - later
 * You should consider the following: Give a screen size a max-active tabs, but allow all screen
 * sizes to view as little as one at a time. When aa view is hidden, turn it into a togglable tab
 * at the top of the page...or something like that
 */
/*
var sections = {
	play: 0,
	queue: 0,
	search: 12
}

function updateView(newSections) {
	var total = 0;
	jQuery.each(newSections, function(section, size) {
		total += size;
	});
	if (total > 12) {
		var difference = total - 12;
		jQuery.each(newSections, function(section, size) {
			total += size;
		});
	}
	newSections = jQuery.extend(newSections, sections);
	if (sections.length != newSections.length) return console.log('Incorrect section definition.');
	jQuery.each(newSections, function(section, size) {
		if (size != sections[section]) {
			if (!size) {
				$("#" + section + "Container").addClass('hidden');
			} else {
				$("#" + section + "Container").removeClass('hidden');
			}
			$("#" + section + "Container").removeClass("col-md-" + sections[section]);
			$("#" + section + "Container").addClass("col-md-" + size);
		}
	});
	sections = newSections;
}

function openView(id) {
	jQuery("#" + id).removeClass('hidden');
}
*/

function bootstrapState() {
    var envs = ['xs', 'sm', 'md', 'lg'];

    $el = $('<div>');
    $el.appendTo($('body'));

    for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];

        $el.addClass('hidden-'+env);
        if ($el.is(':hidden')) {
            $el.remove();
            return env
        }
    };
}