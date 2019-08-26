import { baseData } from './data';
export default class {
    columns = [
        { key: 'name', title: '姓名' },
        { key: 'age', title: '年龄' },
        { key: 'date', title: '日期', headerTemplate: '<b>日期</b>' },
        {
            key: 'address', title: '地址',
            headerTemplate(column, index) {
                return `${index}: ${column.key} ${column.title}`;
            }
        },
    ];
    columns2 = [
        {
            key: 'name', title: '姓名', width: 150,
            headerTemplateUrl: 'nameHeaderTpl'
        },
        {
            key: 'age', title: '年龄', width: 150,
            headerTemplateUrl: () => 'ageHeaderTpl'
        },
        { key: 'date', title: '日期', width: 200 },
        {
            key: 'address', title: '地址', width: 400,
            templateUrl: 'addressTpl'
        }
    ];
    data = angular.copy(baseData);
    handleView() {
        alert('触发事件');
    }
}