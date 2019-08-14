/**
 * datatable
 * datatable directive
 * Author: yjy972080142@gmail.com
 * Date:2019-08-13
 */
(function () {
    let rowKey = 1;
    let columnKey = 1;
    // set forTableHead to true when convertToRows, false in normal cases like table.vue
    const getAllColumns = (cols, forTableHead = false) => {
        const columns = angular.copy(cols);
        const result = [];
        columns.forEach((column) => {
            if (column.children) {
                if (forTableHead) {
                    result.push(column);
                }
                result.push.apply(result, getAllColumns(column.children, forTableHead));
            } else {
                result.push(column);
            }
        });
        return result;
    };
    const getRandomStr = function (len = 32) {
        const $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        const maxPos = $chars.length;
        let str = '';
        for (let i = 0; i < len; i++) {
            str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    };
    const convertColumnOrder = (columns, fixedType) => {
        let list = [];
        let other = [];
        columns.forEach((col) => {
            if (col.fixed && col.fixed === fixedType) {
                list.push(col);
            } else {
                other.push(col);
            }
        });
        return list.concat(other);
    };
    const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
    const MOZ_HACK_REGEXP = /^moz([A-Z])/;
    function camelCase(name) {
        return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        }).replace(MOZ_HACK_REGEXP, 'Moz$1');
    }
    function getStyle(element, styleName) {
        if (!element || !styleName) {
            return null;
        }
        styleName = camelCase(styleName);
        if (styleName === 'float') {
            styleName = 'cssFloat';
        }
        try {
            // eslint-disable-next-line angular/document-service
            const computed = document.defaultView.getComputedStyle(element, '');
            return element.style[styleName] || computed ? computed[styleName] : null;
        } catch (evt) {
            return element.style[styleName];
        }
    }
    function getScrollBarSize() {
        // eslint-disable-next-line angular/document-service
        const inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '200px';

        // eslint-disable-next-line angular/document-service
        const outer = document.createElement('div');
        const outerStyle = outer.style;

        outerStyle.position = 'absolute';
        outerStyle.top = 0;
        outerStyle.left = 0;
        outerStyle.pointerEvents = 'none';
        outerStyle.visibility = 'hidden';
        outerStyle.width = '200px';
        outerStyle.height = '150px';
        outerStyle.overflow = 'hidden';

        outer.appendChild(inner);

        // eslint-disable-next-line angular/document-service
        document.body.appendChild(outer);

        const widthContained = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        let widthScroll = inner.offsetWidth;

        if (widthContained === widthScroll) {
            widthScroll = outer.clientWidth;
        }

        // eslint-disable-next-line angular/document-service
        document.body.removeChild(outer);

        return widthContained - widthScroll;
    }

    angular.module('ui.xg.datatable', [])
        .controller('uixDatatableCtrl', ['$scope', '$timeout', '$element', '$attrs',
            function ($scope, $timeout, $element, $attrs) {
                const $table = this;
                $table.scrollBarWidth = getScrollBarSize();
                $table.scrollPosition = 'left';

                function findEl(selector) {
                    return angular.element($element[0].querySelector(selector));
                }

                $table.fixedBody = () => {
                    let header = $element[0].querySelector('.uix-datatable-header');
                    if (header) {
                        $table.headerWidth = header.offsetWidth;
                        $table.headerHeight = header.offsetHeight;
                    }

                    if (!$table.data || $table.data.length === 0) {
                        $table.showVerticalScrollBar = false;
                    } else {
                        let bodyContentEl = $element[0].querySelector('.uix-datatable-tbody');
                        let bodyEl = bodyContentEl.parentElement;
                        let bodyContentHeight = bodyContentEl.offsetHeight;
                        let bodyHeight = bodyEl.offsetHeight;


                        this.showHorizontalScrollBar = bodyEl.offsetWidth < bodyContentEl.offsetWidth + (this.showVerticalScrollBar ? this.scrollBarWidth : 0);
                        this.showVerticalScrollBar = this.bodyHeight ? bodyHeight - (this.showHorizontalScrollBar ? this.scrollBarWidth : 0) < bodyContentHeight : false;
                        if (this.showVerticalScrollBar) {
                            angular.element(bodyEl).addClass('uix-datatable-overflowY');
                        } else {
                            angular.element(bodyEl).removeClass('uix-datatable-overflowY');
                        }
                        if (this.showHorizontalScrollBar) {
                            angular.element(bodyEl).addClass('uix-datatable-overflowX');
                        } else {
                            angular.element(bodyEl).removeClass('uix-datatable-overflowX');
                        }
                    }
                };
                $table.fixedHeader = () => {
                    if ($table.height || $table.maxHeight) {
                        $timeout(() => {
                            const headerHeight = parseInt(getStyle($element[0].querySelector('.uix-datatable-header'), 'height'), 10) || 0;
                            const footerHeight = parseInt(getStyle($element[0].querySelector('.uix-datatable-footer'), 'height'), 10) || 0;
                            if ($table.height) {
                                $table.bodyHeight = $table.height - headerHeight - footerHeight;
                            } else if ($table.maxHeight) {
                                $table.bodyHeight = $table.maxHeight - headerHeight - footerHeight;
                            }
                            $timeout(() => $table.fixedBody(), 0);
                        }, 0);
                    } else {
                        $table.bodyHeight = 0;
                        $timeout(() => $table.fixedBody(), 0);
                    }
                };

                // 获取左侧固定列的宽度
                function getLeftFixedWidth() {
                    let width = 0;
                    ($table.leftFixedColumns || []).forEach((col) => {
                        if (col.fixed && col.fixed === 'left') {
                            width += col._width;
                        }
                    });
                    return width;
                }
                // 获取右侧固定列的宽度
                function getRightFixedWidth() {
                    let width = 0;
                    ($table.rightFixedColumns || []).forEach((col) => {
                        if (col.fixed && col.fixed === 'right') {
                            width += col._width;
                        }
                    });
                    return width;
                }

                $table.handleBodyScroll = (event) => {
                    findEl('.uix-datatable-header.middle-header')[0].scrollLeft = event.target.scrollLeft;
                    if (event.target.scrollLeft <= 0) {
                        $table.scrollPosition = 'left';
                    } else if (event.target.scrollLeft >= $table.tableWidth - $element[0].offsetWidth) {
                        $table.scrollPosition = 'right';
                    } else {
                        $table.scrollPosition = 'middle';
                    }
                    $scope.$digest();
                    if ($table.isLeftFixed()) {
                        findEl('.uix-datatable-fixed-left .uix-datatable-fixed-body')[0].scrollTop = event.target.scrollTop;
                    }
                    if ($table.isRightFixed()) {
                        findEl('.uix-datatable-fixed-right .uix-datatable-fixed-body')[0].scrollTop = event.target.scrollTop;
                    }
                    // this.hideColumnFilter();
                };
                $table.handleResize = () => {
                    //let tableWidth = parseInt(getStyle(this.$el, 'width')) - 1;
                    let tableWidth = $element[0].offsetWidth - 1;
                    let columnsWidth = {};
                    let sumMinWidth = 0;
                    let hasWidthColumns = [];
                    let noWidthColumns = [];
                    let maxWidthColumns = [];
                    let noMaxWidthColumns = [];
                    this.cloneColumns.forEach((col) => {
                        if (col.width) {
                            hasWidthColumns.push(col);
                        }
                        else {
                            noWidthColumns.push(col);
                            if (col.minWidth) {
                                sumMinWidth += col.minWidth;
                            }
                            if (col.maxWidth) {
                                maxWidthColumns.push(col);
                            }
                            else {
                                noMaxWidthColumns.push(col);
                            }
                        }
                        col._width = null;
                    });


                    let unUsableWidth = hasWidthColumns.map(cell => cell.width).reduce((a, b) => a + b, 0);
                    let usableWidth = tableWidth - unUsableWidth - sumMinWidth - (this.showVerticalScrollBar ? this.scrollBarWidth : 0) - 1;
                    let usableLength = noWidthColumns.length;
                    let columnWidth = 0;
                    if (usableWidth > 0 && usableLength > 0) {
                        columnWidth = parseInt(usableWidth / usableLength, 10);
                    }


                    for (let i = 0; i < this.cloneColumns.length; i++) {
                        const column = this.cloneColumns[i];
                        let width = columnWidth + (column.minWidth ? column.minWidth : 0);
                        if (column.width) {
                            width = column.width;
                        }
                        else {
                            if (column._width) {
                                width = column._width;
                            }
                            else {
                                if (column.minWidth > width) {
                                    width = column.minWidth;
                                }
                                else if (column.maxWidth < width) {
                                    width = column.maxWidth;
                                }

                                if (usableWidth > 0) {
                                    usableWidth -= width - (column.minWidth ? column.minWidth : 0);
                                    usableLength--;
                                    if (usableLength > 0) {
                                        columnWidth = parseInt(usableWidth / usableLength, 10);
                                    }
                                    else {
                                        columnWidth = 0;
                                    }
                                }
                                else {
                                    columnWidth = 0;
                                }
                            }
                        }

                        column._width = width;

                        columnsWidth[column._index] = {
                            width: width
                        };

                    }
                    if (usableWidth > 0) {
                        usableLength = noMaxWidthColumns.length;
                        columnWidth = parseInt(usableWidth / usableLength, 10);
                        for (let i = 0; i < noMaxWidthColumns.length; i++) {
                            const column = noMaxWidthColumns[i];
                            let width = column._width + columnWidth;
                            if (usableLength > 1) {
                                usableLength--;
                                usableWidth -= columnWidth;
                                columnWidth = parseInt(usableWidth / usableLength, 10);
                            }
                            else {
                                columnWidth = 0;
                            }

                            column._width = width;

                            columnsWidth[column._index] = {
                                width: width
                            };

                        }
                    }

                    this.tableWidth = this.cloneColumns
                        .map(cell => cell._width)
                        .reduce((item, prev) => item + prev, 0) + (this.showVerticalScrollBar ? this.scrollBarWidth : 0) + 1;
                    this.columnsWidth = columnsWidth;
                    this.fixedHeader();
                };

                $table.makeColumnRows = (fixedType, columns) => {
                    const originColumns = fixedType
                        ? fixedType === 'left'
                            ? angular.copy(convertColumnOrder(columns, 'left'))
                            : angular.copy(convertColumnOrder(columns, 'right'))
                        : angular.copy(columns);
                    let maxLevel = 1;
                    const traverse = (column, parent) => {
                        if (parent) {
                            column.level = parent.level + 1;
                            if (maxLevel < column.level) {
                                maxLevel = column.level;
                            }
                        }
                        if (column.children) {
                            let colSpan = 0;
                            column.children.forEach((subColumn) => {
                                traverse(subColumn, column);
                                colSpan += subColumn.colSpan;
                            });
                            column.colSpan = colSpan;
                        } else {
                            column.colSpan = 1;
                        }
                    };

                    originColumns.forEach((column) => {
                        column.level = 1;
                        traverse(column);
                    });

                    const rows = [];
                    for (let i = 0; i < maxLevel; i++) {
                        rows.push([]);
                    }

                    const allColumns = getAllColumns(originColumns, true);

                    allColumns.forEach((column) => {
                        if (!column.children) {
                            column.rowSpan = maxLevel - column.level + 1;
                        } else {
                            column.rowSpan = 1;
                        }
                        rows[column.level - 1].push(column);
                    });

                    return rows;
                };
                // 修改列，设置一个隐藏的 id，便于后面的多级表头寻找对应的列，否则找不到
                $table.makeColumnsId = (columns) => {
                    return columns.map(item => {
                        if ('children' in item) {
                            $table.makeColumnsId(item.children);
                        }
                        item.__id = getRandomStr(6);
                        return item;
                    });
                };
                $table.makeColumns = (cols) => {
                    // 在 data 时，$table.allColumns 暂时为 undefined
                    let columns = angular.copy(getAllColumns(cols));
                    let left = [];
                    let right = [];
                    let center = [];

                    columns.forEach((column, index) => {
                        column._index = index;
                        column._columnKey = columnKey++;
                        column.width = parseInt(column.width, 10);
                        column._width = column.width ? column.width : '';    // update in handleResize()
                        column._sortType = 'normal';
                        column._filterVisible = false;
                        column._isFiltered = false;
                        column._filterChecked = [];

                        if ('filterMultiple' in column) {
                            column._filterMultiple = column.filterMultiple;
                        } else {
                            column._filterMultiple = true;
                        }
                        if ('filteredValue' in column) {
                            column._filterChecked = column.filteredValue;
                            column._isFiltered = true;
                        }

                        if ('sortType' in column) {
                            column._sortType = column.sortType;
                        }

                        if (column.fixed && column.fixed === 'left') {
                            left.push(column);
                        } else if (column.fixed && column.fixed === 'right') {
                            right.push(column);
                        } else {
                            center.push(column);
                        }
                    });
                    return left.concat(center).concat(right);
                };
                $table.makeObjData = () => {
                    let data = {};
                    $scope.data.forEach((row, index) => {
                        const newRow = angular.copy(row);// todo 直接替换
                        newRow._isHover = false;
                        if (newRow._disabled) {
                            newRow._isDisabled = newRow._disabled;
                        } else {
                            newRow._isDisabled = false;
                        }
                        if (newRow._checked) {
                            newRow._isChecked = newRow._checked;
                        } else {
                            newRow._isChecked = false;
                        }
                        if (newRow._expanded) {
                            newRow._isExpanded = newRow._expanded;
                        } else {
                            newRow._isExpanded = false;
                        }
                        if (newRow._highlight) {
                            newRow._isHighlight = newRow._highlight;
                        } else {
                            newRow._isHighlight = false;
                        }
                        data[index] = newRow;
                    });
                    return data;
                };
                $table.filterData = (data, column) => {
                    return data.filter((row) => {
                        //如果定义了远程过滤方法则忽略此方法
                        if (angular.isFunction(column.filterRemote)) {
                            return true;
                        }

                        let status = !column._filterChecked.length;
                        for (let i = 0; i < column._filterChecked.length; i++) {
                            status = column.filterMethod(column._filterChecked[i], row);
                            if (status) {
                                break;
                            }
                        }
                        return status;
                    });
                };
                $table.makeData = () => {
                    let data = angular.copy($scope.data);
                    data.forEach((row, index) => {
                        row._index = index;
                        row._rowKey = rowKey++;
                    });
                    return data;
                };
                $table.makeDataWithSort = () => {
                    let data = this.makeData();
                    this.cloneColumns.forEach(col => {
                        data = this.filterData(data, col);
                    });
                    return data;
                };
                $table.makeDataWithSortAndFilter = () => {
                    let data = this.makeDataWithSort();
                    this.cloneColumns.forEach(col => {
                        data = this.filterData(data, col);
                    });
                    return data;
                };
                $table.setCellWidth = (column) => {
                    let width = '';
                    if (column.width) {
                        width = column.width;
                    } else if ($table.columnsWidth[column._index]) {
                        width = $table.columnsWidth[column._index].width;
                    }
                    if (width === '0') {
                        width = '';
                    }
                    return width;
                };
                $table.handleMouseIn = (_index) => {
                    if ($table.disabledHover) {
                        return;
                    }
                    if ($table.objData[_index]._isHover) {
                        return;
                    }
                    $table.objData[_index]._isHover = true;
                };
                $table.handleMouseOut = (_index) => {
                    if ($table.disabledHover) {
                        return;
                    }
                    $table.objData[_index]._isHover = false;
                };
                $table.rowClassName = function (index) {
                    return $scope.rowClassName({
                        $row: $table.objData[index],
                        $index: index
                    });
                };
                $table.alignCls = (column, row = {}) => {
                    let cellClassName = '';
                    if (row.cellClassName && column.key && row.cellClassName[column.key]) {
                        cellClassName = row.cellClassName[column.key];
                    }
                    return [
                        cellClassName,
                        column.className
                    ];
                };
                $table.getStyles = () => {
                    let style = {};
                    if ($table.height) {
                        style.height = `${$table.height}px`;
                    }
                    if ($table.maxHeight) {
                        style.maxHeight = `${$table.maxHeight}px`;
                    }
                    if ($table.width) {
                        style.width = `${$table.width}px`;
                    }
                    return style;
                };
                $table.bodyStyle = () => {
                    let style = {};
                    if ($table.bodyHeight !== 0) {
                        const height = $table.bodyHeight;
                        if ($table.height) {
                            style.height = `${height}px`;
                        } else if ($table.maxHeight) {
                            style.maxHeight = `${height}px`;
                        }
                    }
                    return style;
                };
                $table.isLeftFixed = () => {
                    return $table.columns.some(col => col.fixed && col.fixed === 'left');
                };
                $table.isRightFixed = () => {
                    return $table.columns.some(col => col.fixed && col.fixed === 'right');
                };
                $table.fixedBodyStyle = () => {
                    let style = {};
                    if ($table.bodyHeight !== 0) {
                        let height = $table.bodyHeight - ($table.showHorizontalScrollBar ? $table.scrollBarWidth : 0);
                        style.height = $table.showHorizontalScrollBar ? `${height}px` : `${height - 1}px`;
                    }
                    return style;
                };
                $table.fixedLeftTableStyle = () => {
                    let style = {};
                    let width = getLeftFixedWidth();
                    style.width = `${width}px`;
                    return style;
                };
                $table.tableHeaderStyle = () => {
                    let style = {};
                    if ($table.tableWidth !== 0) {
                        let width = '';
                        width = $table.tableWidth;
                        style.width = `${width}px`;
                    }
                    return style;
                };
                $table.tableStyle = () => {
                    let style = {};
                    if ($table.tableWidth !== 0) {
                        let width = '';
                        if ($table.bodyHeight === 0) {
                            width = $table.tableWidth;
                        } else {
                            width = $table.tableWidth - ($table.showVerticalScrollBar ? $table.scrollBarWidth : 0);
                        }
                        style.width = `${width}px`;
                    }
                    return style;
                };
                $table.fixedRightTableStyle = () => {
                    let style = {};
                    let width = getRightFixedWidth();
                    //width += this.scrollBarWidth;
                    style.width = `${width}px`;
                    style.right = `${$table.showVerticalScrollBar ? $table.scrollBarWidth : 0}px`;
                    return style;
                };
                $table.getLeftFixedColumns = () => {
                    return convertColumnOrder($table.cloneColumns, 'left');
                };
                $table.getRightFixedColumns = () => {
                    return convertColumnOrder($table.cloneColumns, 'right');
                };
                $table.bindEvents = () => {
                    findEl('.uix-datatable-body').on('scroll', $table.handleBodyScroll);
                };
                $table.unbindEvents = () => {
                    findEl('.uix-datatable-body').off('scroll', $table.handleBodyScroll);
                };
                // 初始化
                $table.init = function () {
                    const colsWithId = $table.makeColumnsId($scope.columns);
                    $table.cloneColumns = $table.makeColumns(colsWithId);
                    $table.columnRows = $table.makeColumnRows(false, colsWithId);
                    $table.leftFixedColumnRows = $table.makeColumnRows(false, colsWithId);
                    $table.rightFixedColumnRows = $table.makeColumnRows(false, colsWithId);
                    $table.leftFixedColumns = $table.getLeftFixedColumns();
                    $table.rightFixedColumns = $table.getRightFixedColumns();
                    $table.allColumns = getAllColumns(colsWithId);
                    $table.objData = $table.makeObjData();
                    $table.rebuildData = $table.makeDataWithSortAndFilter();
                    console.log($attrs);
                    $table.handleResize();
                    $table.bindEvents();
                };
            }])
        .directive('uixDatatable', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/datatable.html',
                replace: true,
                require: ['uixDatatable'],
                scope: {
                    columns: '=',
                    data: '=',
                    rowClassName: '&'
                },
                controllerAs: '$table',
                controller: 'uixDatatableCtrl',
                link: function (scope, el, $attrs, ctrls) {
                    var $table = ctrls[0];
                    $table.scope = scope;
                    $table.columns = scope.columns;
                    $table.data = scope.data;

                    $table.isStriped = 'stripe' in $attrs;
                    $table.isBordered = 'bordered' in $attrs;

                    ['height', 'maxHeight', 'width'].forEach(attr => {
                        if ($attrs[attr]) {
                            $table[attr] = parseInt($attrs[attr], 10);
                        }
                    });
                    scope.$watch('data', function (val, old) {
                        if (val !== old && angular.isDefined(val)) {
                            $table.columns = scope.columns;
                        }
                        $table.init();
                    });
                    $table.init();
                }
            };
        })
        .directive('uixDatatableHead', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/datatable-head.html',
                replace: true,
                scope: {},
                require: '^uixDatatable',
                link: function ($scope, el, attrs, $table) {
                    let fixed = attrs.fixed || '';
                    $scope.$table = $table;
                    $scope.columns = $table.scope.$eval(attrs.columns);
                    $scope.headRows = getHeadRows();
                    function getHeadRows() {
                        const isGroup = $table.columnRows.length > 1;
                        if (isGroup) {
                            return fixed ? ($table.scope.$eval(attrs.fixedColumnRows) || []) : $table.columnRows;
                        } else {
                            return [$scope.columns];
                        }
                    }

                    $scope.cellClasses = (column) => {
                        return [
                            !fixed && column.fixed && (column.fixed === 'left' || column.fixed === 'right') ? 'uix-datatable-hidden' : '',
                            column.type === 'selection' ? 'uix-datatable-cell-with-selection' : ''
                        ];
                    };
                    let styleObj = $table.scope.$eval(attrs.styleObj);
                    const styles = Object.assign({}, styleObj);
                    const width = parseInt(styleObj.width, 10);
                    styles.width = `${width}px`;
                    $scope.styles = styles;
                    $scope.scrollBarCellClass = () => {
                        let hasRightFixed = false;
                        for (let i in $scope.headRows) {
                            for (let j in $scope.headRows[i]) {
                                if ($scope.headRows[i][j].fixed === 'right') {
                                    hasRightFixed = true;
                                    break;
                                }
                                if (hasRightFixed) {
                                    break;
                                }
                            }
                        }
                        return hasRightFixed ? 'uix-datatable-hidden' : '';
                    };
                }
            };
        })
        .directive('uixDatatableBody', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/datatable-body.html',
                replace: true,
                require: '^uixDatatable',
                link: function ($scope, el, attrs, $table) {
                    $scope.handleMouseIn = function (evt, _index) {
                        evt.stopPropagation();
                        $table.handleMouseIn(_index);
                    };
                    $scope.handleMouseOut = function (evt, _index) {
                        evt.stopPropagation();
                        $table.handleMouseOut(_index);
                    };
                    let fixed = attrs.fixed || '';
                    $scope.alignCls = (column, row = {}) => {
                        let cellClassName = '';
                        if (row.cellClassName && column.key && row.cellClassName[column.key]) {
                            cellClassName = row.cellClassName[column.key];
                        }
                        return [
                            cellClassName,
                            column.className,
                            (fixed === 'left' && column.fixed !== 'left') ||
                                (fixed === 'right' && column.fixed !== 'right') ||
                                (!fixed && column.fixed && (column.fixed === 'left' || column.fixed === 'right'))
                                ? 'uix-datatable-hidden' : ''
                        ];
                    };
                    let styleObj = $table.scope.$eval(attrs.styleObj);
                    const styles = Object.assign({}, styleObj);
                    const width = parseInt(styleObj.width, 10);
                    styles.width = `${width}px`;
                    $scope.styles = styles;
                    $scope.columns = $table.scope.$eval(attrs.columns);
                }
            };
        })
        .directive('uixDatatableTr', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/datatable-tr.html',
                replace: true,
                require: '^uixDatatable',
                transclude: true,
                scope: {
                },
                link: function (scope, el, attrs, ctrls) {
                }
            };
        })
        .directive('uixDatatableCell', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/datatable-cell.html',
                replace: true,
                require: '^uixDatatable',
                scope: {
                    column: '=',
                    row: '=',
                    key: '@'
                },
                link: function ($scope, el, attrs, ctrls) {
                    let column = $scope.column || {};
                    if (column.type === 'index') {
                        $scope.renderType = 'index';
                    } else if (column.type === 'selection') {
                        $scope.renderType = 'selection';
                    } else if (column.type === 'html') {
                        $scope.renderType = 'html';
                    } else if (column.type === 'expand') {
                        $scope.renderType = 'expand';
                    } else if (column.render) {
                        $scope.renderType = 'render';
                    } else if (column.slot) {
                        $scope.renderType = 'slot';
                    } else {
                        $scope.renderType = 'normal';
                    }
                }
            };
        })
        .directive('uixDatatableFoot', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/datatable-foot.html',
                replace: true,
                require: ['^uixDatatable'],
                scope: {
                },
                link: function (scope, el, attrs, ctrls) {
                }
            };
        });
})();