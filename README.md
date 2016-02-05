#FlexoCalendar.js
===

###概述
- 依赖jQuery
- 可展示日历、周历、月历
- 同时提供方法输入日期即可得知该日是该月的第几周以及每月的天数

===
###使用
在html中引入jQuery.js,FlexoCalendar.js以及FlexoCalendar.css，例如

```html

    <link rel="stylesheet" href="FlexoCalendar.css">
    <script src="jq.js"></script>
    <script src="FlexoCalendar.js"></script>

```

###调用方法

```JavaScript
    <script>
      $(function(){
        $(dom).flexoCalendar();
      })
    </script>
```

###参数列表

#### type  
    可选参数 normal | weekly | monthly 
    默认参数 normal
    * normal: 日历
    * weekly: 周历
    * monthly: 月历
    
#### id
    默认参数 ''
    自定义日历的id
    
#### className
    默认参数 ''
    自定义日历的样式名

#### dayNames
    默认参数 ['日', '一', '二', '三', '四', '五', '六']
    周名
    
#### numbers
    默认参数 ['一', '二', '三', '四', '五', '六']
    用于周历，修正数字显示

#### today
    默认参数 `true`
    是否高亮今天，如果选择`false`则不高亮今天
    被高亮的日期会有`current-day`的样式
    如果是周历还会拥有`current-week`的样式
    如果是月历则还会拥有`current-month`的样式
    
#### select
    默认参数 `true`
    是否可选中，如果选择`false`则不可选中日期
    如果被选中会获得样式`selected`
    
#### multi
    默认参数 `false`
    是否可多选，如果选择`true`则日期可被多选
    如果被选中会获得样式`selected`
    
#### disOtherMonth
    默认参数 `false`
    用于日历，是否禁用可选其他月份的日期，如果选择`true`则禁用可选其他月份的日期
    
#### setMonth
    默认参数 当前月
    可初始化日历展示月份
    
#### setYear
    默认参数 当前年
    可初始化日历展示年份
    
#### selectDate
    默认参数 `null`
    自定义高亮的日期
    格式 yyyy-mm-dd | yyyy-mm | yyyy-mm-weekn
    年月日均可被设为each
    yyyy/mm如被设置为each则被认为是日历展示的当前年/月
