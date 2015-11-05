var hitnApp = angular.module('hackInTNApp', []);

hitnApp.factory("Page", function() {
	var title = '';
	var cover = false;
	return {
		title: function() { return title; },
		cover: function(nVal) {
			return arguments.length ? cover = nVal : cover;
		},
		setTitle: function(newTitle) { title = newTitle; }
	};
});

hitnApp.factory("User", function($http, $log) {
	var logged = false;
	var level = 0;
	var user_id = 0;
	var token = '';
	var exercise_list = [];
	var length = 0;
	var get_continue = false;
	
	function get_exercise_list(num) {
		$http({
			method: 'GET',
			url: '/api/user/'+user_id+'/exercise',
			data: {
				'begin': length + num,
				'length': num
		}}).then(function successCallback(response) {
			exercise_list = response.data.exercises;
			length = response.data.length;
		}, function errorCallback(response) {
			get_continue = false;
		});
	}
	
	function clear_exercise_list() {
		exercise_list = [];
		length = 0;
		get_continue = false;
	}
	
	return {
		logged: function() { return logged; },
		user_id: function() { return user_id; },
		token: function() { return token; },
		exercises: function() { return exercise_list; },
		level: function() { return level; },
		loadExercises: function() {
			get_exercise_list(25);
		},
		setUser: function(nuser, ntoken) {
			user_id = nuser; token = ntoken; logged = true; get_continue = true;
			get_exercise_list();
		},
		logout: function() {
			user_id = 0; token = ''; logged = false;
		}
	};
});

hitnApp.controller("PageCtrl", function($scope, Page, User) {
	$scope.Page = Page;
	$scope.User = User;
});

hitnApp.controller("LoginFormCtrl", function($scope, $http, Page, User) {
	$scope.login = function() {
		Page.cover(false);
		$http({
			method: 'POST',
			url: '/api/token',
			data: {
				'username': $scope.username,
				'password': $scope.password
			}}
		).then(function successCallback(response) {
			User.setUser(response.data.user, response.data.token);
		}, function errorCallback(response) {
			User.logout();
		}
		);
		Page.cover(true);
	}
});

hitnApp.controller("ExListCtrl", function($scope) {
	$scope.getStatusClass = function(exercise) {
		return exercise.status ? "ok" : "nok";
	};
	
	$scope.getStartedClass = function(exercise) {
		return exercise.started == null ? "nok" : "ok";
	};
	
	$scope.getGlobalClass = function(exercise) {
		if(exercise.started == null) {
			if(exercise.status)
				return "finished";
			else
				return "stopped";
		}
		else {
			if(exercise.status)
				return "launchedok";
			else
				return "launched";
		}
	};
});
