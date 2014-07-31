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
			$http({
				method: 'GET',
				url: '/api/artists',
				params: {q: q}
			})
				.success(function(data) {
					$scope.artists = data;
				});
		};
	}]);