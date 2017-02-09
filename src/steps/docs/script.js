angular.module('uixDemo').controller('stepsDemoCtrl', ['$scope', function ($scope) {
    // your js code here
    $scope.objs = [{
        'title': '标题一',
        'desc': '我是描述一',
        'icon': 'fa-user',
        'status': 'wait'
    }, {
        'title': '标题二',
        'desc': '我是描述二',
        'icon': 'fa-user',
        'status': 'process'
    }, {
        'title': '标题三',
        'desc': '我是描述三',
        'icon': '',
        'status': 'finish'
    }];
}]);
