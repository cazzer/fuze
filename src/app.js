(function() {
	"use strict";

	angular.module("fuze", ["ngRoute", "ui.bootstrap"])
		.config(["$routeProvider", function($routeProvider) {
			$routeProvider.otherwise({
				templateUrl: "templates/search.html",
				controller: "Search"
			});
		}])
		.factory("Soundcloud", ["$http", function($http) {
			var url = function(params) {
				return "https://api.soundcloud.com/" + params
					+"&client_id=7eadfcb24859c38770417ef858756544&format=json";
			};

			var defaults = {
				limit: 10,
				offset: 0
			};


			var soundcloud = {
				search: function(query, limit, offset) {
					if (!limit) limit = defaults.limit;
					if (!offset) offset = defaults.offset;

					var promise = $http.get(url("tracks?q=" + query + "&limit=" + limit)).then(function(response) {
						//normalize response
						angular.forEach(response.data, function(track) {
							track.service = "soundcloud";
							track.url = track.uri;
							track.image = track.artwork_url ? track.artwork_url : track.user.avatar_url;
							track.likes = track.favoritings_count;
							track.plays = track.playback_count;
							track.id = track.id;
						});
						return response.data;
					});

					return promise;
				}
			};

			return soundcloud;
		}])
		.controller("Search", ["$scope", "Soundcloud", function($scope, Soundcloud) {
			function getFuzzy(query, tracks) {
				var magicNumber = 0.5,
					titles = [];
				angular.forEach(tracks, function(track) {
					titles.push(track.title);
				});

				var fuzzySet = FuzzySet(titles),
					result = fuzzySet.get(query);

				if (result[0][0] > magicNumber) {
					var index = titles.indexOf(result[0][1]);

					$scope.fuzzyTrack = $scope.results[index];
				}
			}

			$scope.search = function() {
				$scope.queries = 1;
				Soundcloud.search($scope.query).then(function(data) {
					--$scope.queries;
					$scope.results = data;

					getFuzzy($scope.query, $scope.results);

					$scope.query = "";
				});
			};
		}]);
})();