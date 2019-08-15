export default class {
    static $inject = ['$scope', '$log'];
    constructor($scope, $log) {
        $scope.totalItems = 64;
        $scope.currentPage = 4;

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function () {
            $log.log('Page changed to: ' + $scope.currentPage);
        };

        $scope.maxSize = 5;
        $scope.bigTotalItems = 175;
        $scope.bigCurrentPage = 1;
        $scope.$on('uixPager:pageChanged', function (evt, arg) {
            $log.log('pageChanged event:' + arg);
        });
    }
}
