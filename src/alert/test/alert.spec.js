describe('uix-alert', function () {

    //var compile, scope,rootScope, document, dropdownConfig, element;
    var element, scope, $compile, $templateCache, $timeout;

    beforeEach(module('ui.xg.alert'));
    beforeEach(module('alert/templates/alert.html'));

    beforeEach(inject(function ($rootScope, _$compile_, _$templateCache_, _$timeout_) {
        scope = $rootScope;
        $compile = _$compile_;
        $templateCache = _$templateCache_;
        $timeout = _$timeout_;

        element = angular.element(
            '<div>' +
            '<uix-alert ng-repeat="alert in alerts" type="{{alert.type}}"' +
            'close="true" close-func="removeAlert($index)" has-icon="true">{{alert.msg}}' +
            '</uix-alert>' +
            '</div>');

        scope.alerts = [
            {msg: 'foo', type: 'success'},
            {msg: 'bar', type: 'danger'},
            {msg: 'baz'}
        ];
    }));

    function createAlerts() {
        $compile(element)(scope);
        scope.$digest();
        return element.find('.alert');
    }

    function findIcon(index) {
        return element.find('.alert-icon span').eq(index);
    }

    function findCloseButton(index) {
        return element.find('.close').eq(index);
    }

    function findContent(index) {
        return element.find('div[ng-transclude] span').eq(index);
    }

    it('should expose the controller to the view', function () {
        $templateCache.put('templates/alert.html', '<div>{{alert.text}}</div>');

        element = $compile('<uix-alert></uix-alert>')(scope);
        scope.$digest();

        var ctrl = element.controller('uix-alert');
        expect(ctrl).toBeDefined();

        ctrl.text = 'foo';
        scope.$digest();

        expect(element.html()).toBe('foo');
    });

    it('should support custom templates', function () {
        $templateCache.put('foo/bar.html', '<div>baz</div>');

        element = $compile('<uix-alert template-url="foo/bar.html"></uix-alert>')(scope);
        scope.$digest();

        expect(element.html()).toBe('baz');
    });

    it('should generate alerts using ng-repeat', function () {
        var alerts = createAlerts();
        expect(alerts.length).toEqual(3);
    });

    it('should use correct classes for different alert types', function () {
        var alerts = createAlerts();
        expect(alerts.eq(0)).toHaveClass('alert-success');
        expect(alerts.eq(1)).toHaveClass('alert-danger');
        expect(alerts.eq(2)).toHaveClass('alert-warning');
    });

    it('should respect alert type binding', function () {
        var alerts = createAlerts();
        expect(alerts.eq(0)).toHaveClass('alert-success');

        scope.alerts[0].type = 'error';
        scope.$digest();

        expect(alerts.eq(0)).toHaveClass('alert-error');
    });

    it('should show the alert content', function () {
        var alerts = createAlerts(), i, len;

        for (i = 0, len = alerts.length; i < len; i++) {
            expect(findContent(i).text()).toBe(scope.alerts[i].msg);
        }
    });

    it('should show close buttons and have the dismissible class', function () {
        var alerts = createAlerts(), i, len;

        for (i = 0, len = alerts.length; i < len; i++) {
            expect(findCloseButton(i).css('display')).not.toBe('none');
            expect(alerts.eq(i)).toHaveClass('alert-dismissible');
        }
    });

    it('should fire callback when closed', function () {
        createAlerts();

        scope.$apply(function () {
            scope.removeAlert = jasmine.createSpy();
        });

        expect(findCloseButton(0).css('display')).not.toBe('none');
        findCloseButton(1).click();

        expect(scope.removeAlert).toHaveBeenCalledWith(1);
    });

    it('should not show close button and have the dismissible class if no close callback specified', function () {
        element = $compile('<uix-alert>No close</uix-alert>')(scope);
        scope.$digest();
        expect(findCloseButton(0)).toBeHidden();
        expect(element).not.toHaveClass('alert-dismissible');
    });

    it('should be possible to add additional classes for alert', function () {
        var element = $compile('<uix-alert class="alert-block" type="info">Default alert!</uix-alert>')(scope);
        scope.$digest();
        expect(element).toHaveClass('alert-block');
        expect(element).toHaveClass('alert-info');
    });

    it('should close automatically if dismiss-on-timeout is defined on the element', function () {
        scope.removeAlert = jasmine.createSpy();
        $compile('<uix-alert close="true" close-func="removeAlert()" ' +
            'dismiss-on-timeout="500">Default alert!</uix-alert>')(scope);
        scope.$digest();

        $timeout.flush();
        expect(scope.removeAlert).toHaveBeenCalled();
    });

    it('should not close immediately with a dynamic dismiss-on-timeout', function () {
        scope.removeAlert = jasmine.createSpy();
        scope.dismissTime = 500;
        $compile('<uix-alert close="true" close-func="removeAlert()" ' +
            'dismiss-on-timeout="{{dismissTime}}">Default alert!</uix-alert>')(scope);
        scope.$digest();

        $timeout.flush(100);
        expect(scope.removeAlert).not.toHaveBeenCalled();

        $timeout.flush(500);
        expect(scope.removeAlert).toHaveBeenCalled();
    });

    it('should have a default close function', function () {
        element = $compile('<uix-alert close="true">Default alert!</uix-alert>')(scope);
        scope.$digest();

        expect(findCloseButton(0).css('display')).not.toBe('none');
        findCloseButton(0).click();

        expect(element).toBeHidden();
    });

    it('should have close tips replace for icon', function () {
        element = $compile('<uix-alert close="true" close-text="点击关闭">Default alert!</uix-alert>')(scope);
        scope.$digest();

        var spanElement = element.find('.close').find('span');

        expect(spanElement).toHaveClass('cancel-text');

        expect(spanElement.html()).toBe('点击关闭');
    });

    it('should support icons', function () {
        createAlerts();

        expect(findIcon(0)).toHaveClass('glyphicon-ok-sign');
        expect(findIcon(1)).toHaveClass('glyphicon-remove-sign');
        expect(findIcon(2)).toHaveClass('glyphicon-exclamation-sign');

        var iconElement = element.find('.alert-icon').eq(0);
        expect(iconElement).not.toBeHidden();
    });

    xit('should support no icon', function (done) {
        element = $compile('<uix-alert close="true" has-icon="false">Default alert!</uix-alert>')(scope);
        scope.$digest();
        var iconElement = element.find('.alert-icon');
        expect(iconElement).toBeHidden();

    });

});
