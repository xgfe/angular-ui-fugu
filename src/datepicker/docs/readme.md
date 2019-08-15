# 日期选择框 datepicker
## Description

日期选择组件,可以选择时间,依赖于<a ui-sref="app.api.calendar" href="../../calendar/docs/readme.md">calendar</a>组件

## Usage

``` html
<uix-datepicker ng-model="date"
    [ min-date="date" ]
    [ max-date="date" ]
    [ placeholder="string" ]
    [ clear-btn="boolean" ]
    [ format="string" ]
    [ exceptions="array|date" ]
    [ auto-close="boolean" ]
    [ show-time="boolean" ]
    [ size="{{string}}" ]
    [ on-change="fn()" ]
    [ date-filter="function($date)" ]
    [ append-to-body="boolean" ]
    [ placement="{{string}}" ]
    [ ng-disabled="boolean" ]>
</uix-datepicker>
```
## Restrict
- 'E'

## Arguments
- ngModel:绑定数据
    - type:`date`
- minDate(optional):可显示的最大日期,比这个日期小的无法选择
    - type:`date`
- maxDate(optional):可显示的最大日期,比这个日期大的无法选择
    - type:`date`
- placeholder(optional):输入框placeholder
    - type:`string`
- clearBtn(optional):是否显示清空按钮
    - type:`boolean`
    - default:`false`
- format(optional):日期格式化,与angular自带的[dateFilter](https://docs.angularjs.org/api/ng/filter/date)可选的格式一样。
    - type:`string`
    - default:`yyyy-MM-dd HH:mm:ss`
- exceptions(optional):禁用日期内的例外日期,日期对象或者日期对象数组
    - type:`date`|`array`
- autoClose(optional):选择日期之后是否自动关闭面板
    - type:`boolean`
    - default:`true`
- showTime(optional):是否可以选择时间
    - type:`boolean`
    - default:`true`
- size(optional):指定尺寸,可选择`'sm'`,`'md'`,`'lg'`
    - type:`string`
    - default:`'md'`
- onChange(optional):日期变化之后的回调
    - type:`function`
- dateFilter(optional):时间的过滤器,方法的返回值为false的话表示时间不可选,接受参数$date
    - type:`function`
- appendToBody(optional):是否将日历插入到body中
    - type:`boolean`
    - default: `false`
- placement(optional):设定日期选择的弹出框位置，可取值参考<a ui-sref="app.api.position" href="../../position/docs/readme.md">position</a>组件
    - type:`string`
    - default:`"auto bottom-left"`
- ngDisabled(optional): 是否禁用
    - type:`boolean`
    - default:`false`
