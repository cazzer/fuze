angular.module('Fuze', [
	'ui.bootstrap',
	'ngRoute',
	'ngAnimate'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'views/player.tpl.html',
			controller: 'player'
		});

		$routeProvider.otherwise({redirectTo: '/'});
	}])
	.controller('navigation', [function() {

	}])
	.controller('player', ['$scope', '$http', function($scope, $http) {

		$scope.search = function(q) {
			$scope.tracks = [];
			$http({
				method: 'GET',
				url: '/api/artists',
				params: {q: q}
			})
				.success(function(data) {
					$scope.artists = data;
				});
		};

		$scope.getArtistTracks = function(q) {
			$scope.$broadcast('getArtistTopTracks');
			$http({
				method: 'GET',
				url: '/api/toptracks',
				params: {q: q}
			})
				.success(function(data) {
					$scope.tracks = data;
				});
		};
	}])
	.directive('cdbFx', [function() {

		return {
			restrict: 'A',
			scope: false,
			link: function(scope, element, attributes) {

				//effects
				function effects(effectParams) {
					switch (effectParams[0]) {
						case 'removeClass':
							return function() {
								element.removeClass(effectParams[1]);
							};
						case 'addClass':
							return function() {
								element.addClass(effectParams[1]);
							};
						default:
							console.error('Effect ' + effectParams[0] + ' is not defined.');
							break;
					}
				}

				element.addClass('animate');

				angular.forEach(attributes.cdbFx.split(';'), function(rawEffect) {
					var options = rawEffect.split(','),
						effect = effects(options[0].split(':'));

					//trigger
					var triggerParams = options[1].split(':') || [null];
					switch (triggerParams[0]) {
						case 'after':
							setTimeout(effect, parseFloat(triggerParams[1]) * 1000);
							break;
						case 'on':
							scope.$on(triggerParams[1], effect);
							break;
						default:
							effect();
							break;
					}
				});
			}
		};
	}]);