/*
AUTHOR : ELEANOR MAO
EMAIL : danningmao@outlook.com
2016-02-5
*/
+(function($){
	'use strict';

	//↓可选参数
	var CALENDAR_OPTION = {
		type : 'normal',//'normal','weekly','monthly'
		id : '',//日历的id
		className : '',//日历的样式
		dayNames : ['日', '一', '二', '三', '四', '五', '六'],//周名
		numbers : ['一', '二', '三', '四', '五', '六'],//数字标示
		today : true,//是否标志今天
		select : true,//是否单击选中
		multi : false,//是否单击可多选
		disOtherMonth : false,//其他月日期是否可选
		setMonth : null,//设定月
		setYear : null,//设定年
		selectDate : null, //format 'yyyy-mm-dd' or 'yyyy-mm-weekn' every element can be set to 'each';
		allowDate : null, //format [yyyy-mm-dd,yyyy-mm-dd]
		prev: 'icon-arrow-left',//向前的按钮
		next: 'icon-arrow-right',//向后的按钮
		onselect: function(){},//当选中的回调函数
		ongoprev: function(){},//当往前翻的回调函数
		ongonext: function(){} //当往后翻的回调函数
	}

	var Calendar = function( element, options){
		this.el = $(element);
		this.opt = null;
		this.date = null;
		this.type = null;
		this.calendar = '';

		this.init(element, options);
	}

	Calendar.prototype.init = function(element, options){
		this.date = this.getDate();
		var options = this.opt = this.getOptions( options, this.date );
		this.type = options.type;
		options.target = $(element);
		this.calendar = '<table class="flexoCalendar '+ options.className +'"  id="'+ options.id +'" cellspacing="0">';
		this.calendar += this.bulidCH(options);
		if( this.type == 'normal' ){
			this.calendar += this.bulidWeekBar(options);
			this.calendar += '</thead>';
			this.calendar += '<tbody>';
			this.calendar += this.bulidFull(options);
		}
		else if(this.type == 'weekly' ){
			this.calendar += '</thead><tbody>';
			this.calendar += this.bulidWeekly(options);
		} 
		else if(this.type == 'monthly' ){
			this.calendar += '</thead><tbody>';
			this.calendar += this.bulidMonthly(options);
		}
		this.calendar +='</tbody></table>';
		$(element).append(this.calendar).trigger('click');

		$(element).on('click', ".prev, .next", options, function(){
			var month = $(this).data('month').split('-')[1];
			var year = $(this).data('month').split('-')[0];
			var allowDate = options.allowDate;
			var calendar = '';
			if ( $.isArray(allowDate) && (( year == allowDate[0].split('-')[0] && month == allowDate[0].split('-')[1] ) || ( year == allowDate[1].split('-')[0] && month == allowDate[1].split('-')[1])) ) return;
			if(options.type == 'normal'){
				calendar = Calendar.prototype.bulidFull(options, year, month);
			}
			else if(options.type == 'monthly'){
				calendar = Calendar.prototype.bulidMonthly(options, year, month);
			}
			else if(options.type == 'weekly'){
				calendar = Calendar.prototype.bulidWeekly(options, year, month);
			}
			$(options.target).find('table.flexoCalendar tbody').empty().append(calendar).trigger('el.create');			
			Calendar.prototype.changeCH(this,options);

			if( this.className == 'prev' && options.ongoprev ){
				options.ongoprev.call(options.target, $(this).next('.current-year').data('year'), $(this).data('month'));
			}
			if( this.className == 'next' && options.ongonext ){
				options.ongonext.call(options.target, $(this).next('.current-year').data('year'), $(this).data('month'));
			}

		})

		if( options.select ){
			$(element).on('click', 'table>tbody>tr>td', options, function(){
				if( !options.multi ){
					$(this).parents("tbody").find("td.selected").removeClass('selected');
				}

				if( options.disOtherMonth ){
					if( this.className.split(' ')[0] != 'other-month'){ $(this).addClass('selected'); };
				}
				else{
					$(this).addClass('selected');
				}

				if( options.onselect ){
					options.onselect.call(options.target, $(this).data('time'));
				}
			})
		}
		
	}

	Calendar.prototype.bulidCH = function(options){
		var calendar='';
		var year = options.setYear;
		var month = options.setMonth;
		var prevdate = this.getPrev(year, month, this.type);
		var nextdate = this.getNext(year, month, this.type);
		var prev = options.prev;
		var next = options.next; 
		if( this.type == 'normal' ){
			calendar +='<thead><tr class="calendar-hd"><th class="prev" data-month="'+prevdate+'"><i class="'+prev+'"></i></th><th class="current-year" data-year="'+year+'-'+this.dispose(month)+'" colspan="5">'+year+'年'+this.dispose(month)+'月</th><th class="next" data-month="'+nextdate+'"><i class="'+next+'"></i></th></tr>';
		}
		else if(this.type == 'weekly' ){
			var prevMonth = prevdate.split('-')[1];
			var prevYear = prevdate.split('-')[0];
			var nextMonth = nextdate.split('-')[1];
			var nextYear = nextdate.split('-')[0];
			var prevWeek = this.forWeek(prevYear ,prevMonth);
			var nextWeek = this.forWeek(nextYear ,nextMonth);
			calendar +='<thead><tr class="calendar-hd"><th class="prev" data-month="'+prevdate+'" data-week="'+prevWeek+'"><i class="'+prev+'"></i></th><th class="current-year" data-year="'+year+'-'+this.dispose(month)+'" colspan="5">'+year+'年'+this.dispose(month)+'月</th><th class="next" data-month="'+nextdate+'" data-week="'+nextWeek+'"><i class="'+next+'"></i></th></tr></thead>';
		} 
		else if(this.type == 'monthly' ){
			calendar +='<thead><tr class="calendar-hd"><th class="prev" data-month="'+prevdate+'" colspan="2"><i class="'+prev+'"></i></th><th class="current-year" data-year="'+year+'-'+this.dispose(month)+'" colspan="4">'+year+'年</th><th class="next" data-month="'+nextdate+'" colspan="2"><i class="'+next+'"></i></th></tr></thead>';
		}

		return calendar;
	}

	Calendar.prototype.changeCH = function(element,options){
		var month = $(element).data('month').split('-')[1];
		var year = $(element).data('month').split('-')[0];
		month = parseInt(month);
		year = parseInt(year);
		var type = options.type;
		var prevdate = this.getPrev(year, month, type);
		var nextdate = this.getNext(year, month, type);
		var crtdate = year + '-' + this.dispose(month);
		var header = $(options.target).find(".current-year");
		if(type == 'weekly'){
			var prevMonth = prevdate.split('-')[1];
			var prevYear = prevdate.split('-')[0];
			var nextMonth = nextdate.split('-')[1];
			var nextYear = nextdate.split('-')[0];
			var prevWeek = this.forWeek(prevYear ,prevMonth);
			var nextWeek = this.forWeek(nextYear ,nextMonth);
			$(options.target).find(".prev").data('month', prevdate).attr('data-month', prevdate).data('week', prevWeek).attr('data-week', prevWeek);
			$(options.target).find(".next").data('month', nextdate).attr('data-month', nextdate).data('week', nextWeek).attr('data-week', nextWeek);
		}else{
			$(options.target).find(".prev").data('month', prevdate).attr('data-month', prevdate);
			$(options.target).find(".next").data('month', nextdate).attr('data-month', nextdate);
		}

		$(options.target).find(".current-year").data('year', crtdate).attr('data-year', crtdate);

		if(type == 'monthly' ){
			header.text(year+'年');
		}else{
			header.text(year+'年'+ this.dispose(month) +'月');
		}
	}

	Calendar.prototype.bulidWeekBar = function(options){
		var calendar = '<tr class="weekday">';
		for(var i = 0; i < 7; i++){
			calendar += '<th data-day=day'+i+'>'+options.dayNames[i]+'</th>';
		}
		calendar += '</tr></thead>';
		return calendar;
	}

	Calendar.prototype.bulidFull = function(options, year, month){
		var calendar = '';
		var month = month ? parseInt(month) : parseInt(options.setMonth);
		var year = year ? parseInt(year) : parseInt(options.setYear);
		var prevdate = this.getPrev(year, month, 'normal');
		var nextdate = this.getNext(year, month, 'normal');
		var monthLen = eli.getMonthLen(year, month);
		var prevMonthLen = eli.getMonthLen(prevdate.split('-')[0], prevdate.split('-')[1]);
		var firDay = new Date(year,month-1,1).getDay();
		var selectDate = options.selectDate;
		selectDate = typeof selectDate == 'string' ? selectDate.indexOf('-') != -1 ? selectDate.split('-')  : null : null;
		if( selectDate ){
			selectDate[0] = selectDate[0] == 'each' ? year : parseInt(selectDate[0]);
			selectDate[1] = selectDate[1] == 'each' ? month : parseInt(selectDate[1]);
			selectDate[2] = selectDate[2] == 'each' ? 1 : parseInt(selectDate[2]);
		}
		for(var j = 0; j < 42; j++){
			if( j % 7 == 0 && j != 41 ){
				if( j != 0){
					calendar +="</tr><tr>";
				}
				else{
					calendar +="<tr>";
				}
			}
			//当前月
			if( j >= firDay && ( j < (firDay + monthLen)) ){
				if( options.today ){
					if( j == parseInt(options.crtdate) + firDay - 1 && options.realyear == year && parseInt(options.realmonth) == month){
						if( selectDate && selectDate[0] == year && selectDate[1] == month && selectDate[2] == parseInt(options.crtdate) ){
							calendar += '<td class="current-month current-day selected-day tdday day'+(j % 7)+'" data-time="'+year+'-'+this.dispose(month)+'-'+this.dispose((j - firDay + 1))+'"><span class="day">'+(j-firDay+1)+'</span></td>';								
						}else{
							calendar += '<td class="current-month current-day tdday day'+(j % 7)+'" data-time="'+year+'-'+this.dispose(month)+'-'+this.dispose((j - firDay + 1))+'"><span class="day">'+(j-firDay+1)+'</span></td>';
						}
					}else{
						if( selectDate && selectDate[0] == year && selectDate[1] == month && selectDate[2] == ( j -firDay + 1 )){
							calendar +='<td class="current-month selected-day tdday day'+(j % 7)+'" data-time="'+year+'-'+this.dispose(month)+'-'+this.dispose((j - firDay + 1))+'"><span class="day">'+(j-firDay+1)+'</span></td>';
						}else{
							calendar +='<td class="current-month tdday day'+(j % 7)+'" data-time="'+year+'-'+this.dispose(month)+'-'+this.dispose((j - firDay + 1))+'"><span class="day">'+(j-firDay+1)+'</span></td>';
						}
					}
				}else{
					if( selectDate && selectDate[0] == year && selectDate[1] == month && selectDate[2] == ( j -firDay + 1 )){
						calendar +='<td class="current-month selected-day tdday day'+(j % 7)+'" data-time="'+year+'-'+this.dispose(month)+'-'+this.dispose((j - firDay + 1))+'"><span class="day">'+(j-firDay+1)+'</span></td>';
					}else{
						calendar +='<td class="current-month tdday day'+(j % 7)+'" data-time="'+year+'-'+this.dispose(month)+'-'+this.dispose((j - firDay + 1))+'"><span class="day">'+(j-firDay+1)+'</span></td>';
					}
				}
			}	
			//上个月
			else if( j < firDay ){
				if( selectDate && ( selectDate[0] + '-' + selectDate[1] ) == prevdate && selectDate[2] == (prevMonthLen - (firDay - j - 1)) ){
					calendar +='<td class="other-month selected-day prev-month day'+(j % 7)+'" data-time="'+prevdate+'-'+this.dispose((prevMonthLen - (firDay - j - 1)))+'"><span class="day">'+(prevMonthLen - (firDay - j - 1))+'</span></td>';						
				}else{
					calendar +='<td class="other-month prev-month day'+(j % 7)+'" data-time="'+prevdate+'-'+this.dispose((prevMonthLen - (firDay - j - 1)))+'"><span class="day">'+(prevMonthLen - (firDay - j - 1))+'</span></td>';	
				}
			}
			//下个月
			else if( j >= (firDay + monthLen)){
				if( selectDate && ( selectDate[0] + '-' + selectDate[1] ) == nextdate && selectDate[2] == (j - monthLen - firDay + 1) ){
					calendar += '<td class="other-month selected-day next-month day'+(j % 7)+'" data-time="'+nextdate+'-'+this.dispose((j - monthLen - firDay + 1))+'"><span class="day">'+(j - monthLen - firDay + 1)+'</span></td>';					
				}else{
					calendar += '<td class="other-month next-month day'+(j % 7)+'" data-time="'+nextdate+'-'+this.dispose((j - monthLen - firDay + 1))+'"><span class="day">'+(j - monthLen - firDay + 1)+'</span></td>';					
				}
			}
			

		}
		calendar +='</tr>';
		return calendar;
	}

	Calendar.prototype.bulidWeekly = function(options, year ,month){
		var calendar = '';
		var numbers = options.numbers;
		var month  = month ? parseInt(month) : parseInt(options.setMonth);
		var year = year ? parseInt(year) : parseInt(options.setYear);
		var prevdate = this.getPrev(year, month, 'weekly');
		var nextdate = this.getNext(year, month, 'weekly');
		var monthLen = eli.getMonthLen(year, month);
		var prevMonth = prevdate.split('-')[1];
		var nextMonth = nextdate.split('-')[1];
		var prevMonthLen = eli.getMonthLen(prevdate.split('-')[0], prevMonth);
		var firDay = new Date(year,month-1,1).getDay();
		firDay = firDay == 0 ? 7 : firDay;
		var startDay  = firDay != 1 ? prevMonthLen - firDay + 2 : 1 ;
		var startMonth  = startDay != 1? prevMonth : month ;
		var endDay  = parseInt(startDay) + 6 > parseInt(prevMonthLen)? parseInt(startDay) + 6 - parseInt(prevMonthLen) : parseInt(startDay) + 6;
		var startYear  = startMonth > month ? year - 1 : year ;
		var endYear  = startMonth == 12 ? startYear + 1 : startYear ;
		var selectDate = options.selectDate;
		selectDate = typeof selectDate == 'string' ? selectDate.indexOf('-') != -1 ? selectDate.split('-')  : null : null;
		if( selectDate ){
			selectDate[0] = selectDate[0] == 'each' ? year : parseInt(selectDate[0]);
			selectDate[1] = selectDate[1] == 'each' ? month : parseInt(selectDate[1]);
			selectDate[2] = selectDate[2] == 'each' ? 'week1' : selectDate[2].indexOf('week') != -1 ? selectDate[2] : parseInt(selectDate[2]);
			if( typeof selectDate[2] == 'number'){ selectDate[2] = eli.getMonthWeek(selectDate[0], selectDate[1], selectDate[2])}
		}
		var crt;
		for(var j = 0; j < 5; j++ ){
			if( j != 0 && parseInt(startDay) >= parseInt(endDay) ){
				if( selectDate ){
					crt = 'week' + ( j + 1 );
					if( ($.isArray(selectDate[2]) && (year == selectDate[2][0][0] && month == selectDate[2][0][1] && selectDate[2][0][2] == crt)) || ( year == selectDate[0] && month == selectDate[1] && selectDate[2] == crt ) ){
						calendar += '<tr><td class="selected-week tweek week'+(j + 1)+'" data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(month)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(nextMonth)+'/'+this.dispose(endDay)+'</span></div></td></tr>';					
					}
					else{
					    calendar += '<tr><td class="tweek week'+(j + 1)+'" data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(nextMonth)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(nextMonth)+'/'+this.dispose(endDay)+'</span></div></td></tr>';											
					}
				}else{
					calendar += '<tr><td class="tweek week'+(j + 1)+'" data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(nextMonth)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(nextMonth)+'/'+this.dispose(endDay)+'</span></div></td></tr>';					
				}
			}
			else if( options.today && ( (parseInt(options.realmonth) == startMonth && startDay <= parseInt(options.crtdate)) || ( parseInt(options.realmonth) != startMonth && startDay >= parseInt(options.crtdate)) ) && parseInt(options.crtdate) <= endDay && options.realyear == year && options.realmonth == month){
				if( selectDate ){
					crt = 'week' + ( j + 1 );
					if( ($.isArray(selectDate[2]) && ((year == selectDate[2][0][0] && month == selectDate[2][0][1] && selectDate[2][0][2] == crt) || ( selectDate[2][1] && year == selectDate[2][1][0] && month == selectDate[2][1][1] && selectDate[2][1][2] == crt))) ||  ( year == selectDate[0] && month == selectDate[1] && selectDate[2] == crt )  ){
						calendar += '<tr><td class="current-week current-day selected-week tweek week'+(j + 1)+'" data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(month)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(month)+'/'+this.dispose(endDay)+'</span></div></td></tr>';						
					}else{
						calendar += '<tr><td class="current-week current-day tweek week'+(j + 1)+'" data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(month)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(month)+'/'+this.dispose(endDay)+'</span></div></td></tr>';
					}
				}else{
					calendar += '<tr><td class="current-week current-day tweek week'+(j + 1)+'" data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(month)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(month)+'/'+this.dispose(endDay)+'</span></div></td></tr>';
				}
			}
			else if( selectDate ){
				crt = 'week' + ( j + 1 );
				if( ($.isArray(selectDate[2]) && ((year == selectDate[2][0][0] && month == selectDate[2][0][1] && selectDate[2][0][2] == crt) || ( selectDate[2][1] && year == selectDate[2][1][0] && month == selectDate[2][1][1] && selectDate[2][1][2] == crt))) ||  ( year == selectDate[0] && month == selectDate[1] && selectDate[2] == crt )  ){
					calendar += '<tr><td class="selected-week tweek week'+(j + 1)+'" data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(month)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(month)+'/'+this.dispose(endDay)+'</span></div></td></tr>';					
				}else{
					calendar += '<tr><td class="tweek week'+(j + 1)+'"  data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(month)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(month)+'/'+this.dispose(endDay)+'</span></div></td></tr>';
				}
			}
			else{
				calendar += '<tr><td class="tweek week'+(j + 1)+'"  data-time="'+startYear+'-'+this.dispose(startMonth)+'-'+this.dispose(startDay)+','+endYear+'-'+this.dispose(month)+'-'+this.dispose(endDay)+'" colspan="7"><div><span class="week">第'+ numbers[j] +'周</span><span class="process">'+this.dispose(startMonth)+'/'+this.dispose(startDay)+'~'+this.dispose(month)+'/'+this.dispose(endDay)+'</span></div></td></tr>';
			}

			if( j == 0 && firDay != 1){
				startMonth = parseInt(startMonth) + 1 > 12 ? '1' : parseInt(startMonth) + 1 ; 
				startDay = parseInt(endDay) + 1;
			}else{
				startDay += 7;
			}
			
			endDay = startDay + 6 > monthLen ? startDay + 6 - monthLen : startDay + 6;
			startYear = startMonth > month ? year - 1 : year ;
			endYear = startMonth == 12 ? startYear + 1 : startYear ;
			
		}
		return calendar;

	}

	Calendar.prototype.forWeek = function (year ,month){
		var endMonth = parseInt(month) ;
		var year = parseInt(year) ;
		var prevdate = this.getPrev(year, month, 'weekly');
		var monthLen = eli.getMonthLen(year, month);
		var prevMonth = prevdate.split('-')[1];
		var prevMonthLen = eli.getMonthLen(prevdate.split('-')[0], prevMonth);
		var firDay = new Date(year, month - 1, 1).getDay();
		firDay = firDay == 0 ? 7 : firDay;
		var startDay = firDay != 1 ? prevMonthLen - firDay + 2 : 1 ;
		var startMonth = startDay != 1? prevMonth : month ;
		var endDay = parseInt(startDay) + 6 > parseInt(prevMonthLen)? parseInt(startDay) + 6 - parseInt(prevMonthLen) : parseInt(startDay) + 6;
		var startYear = parseInt(startMonth) > month ? year - 1 : year ;
		var endYear = startMonth == 12 ? startYear + 1 : startYear ;
		var data = startYear +'-'+ this.dispose(startMonth) + '-' +this.dispose(startDay) +',' + endYear +'-' + this.dispose(month) + '-'+ this.dispose(endDay);
		return data;
	}

	Calendar.prototype.bulidMonthly = function(options, year ,month){
		var calendar = '';
		var month = month ? parseInt(month) : parseInt(options.setMonth);
		var year = year ? parseInt(year) : parseInt(options.setYear);
		var selectDate = options.selectDate;
		selectDate = typeof selectDate == 'string' ? selectDate.indexOf('-') != -1 && selectDate.indexOf('week') == -1 ?  selectDate.split('-') : null : null;
		if(selectDate){
			selectDate[0] = selectDate[0] == 'each' ? year : parseInt(selectDate[0]);
			selectDate[1] = selectDate[1] == 'each' ? 1 : parseInt(selectDate[1]);
		}
		for(var j = 0; j < 12; j++){
			if( j % 4 == 0 && j !=12 ){
				if( j != 0){
					calendar +="</tr><tr>";
				}
				else{
					calendar +="<tr>";
				}
			}
			if( options.today && (j + 1) == options.realmonth && options.realyear == year){
				if( selectDate && selectDate[0] == year && selectDate[1] == (j + 1)){
					calendar += '<td colspan=2 class="current-month current-day selected-month selected-day tmonth month'+this.dispose(( j + 1 ))+'" data-time="'+year+'-'+this.dispose(( j + 1 ))+'"><span class="month">'+(j + 1)+'月</span></td>';
				}else{
					calendar += '<td colspan=2 class="current-month current-day tmonth month'+this.dispose(( j + 1 ))+'" data-time="'+year+'-'+this.dispose(( j + 1 ))+'"><span class="month">'+(j + 1)+'月</span></td>';
				}
			}else if( selectDate && selectDate[0] == year && selectDate[1] == (j + 1)){
				calendar += '<td colspan=2 class="selected-month selected-day tmonth month'+this.dispose(( j + 1 ))+'" data-time="'+year+'-'+this.dispose(( j + 1 ))+'"><span class="month">'+(j + 1)+'月</span></td>'
			}else{
				calendar += '<td colspan=2 class="tmonth month'+this.dispose(( j + 1 ))+'" data-time="'+year+'-'+this.dispose(( j + 1 ))+'"><span class="month">'+(j + 1)+'月</span></td>'
			}
		}
		calendar +='</tr>';
		return calendar;

	}

	Calendar.prototype.getNext = function(year, month, type){
		var nextdate;
		if(type == 'monthly'){
			nextdate = parseInt(year) + 1 + '-';
		}else{
			nextdate = parseInt(month) == 12 ? parseInt(year) + 1 + '-01' : year + '-' + this.dispose((parseInt(month) + 1));
		}
		return nextdate;
	}

	Calendar.prototype.getPrev = function(year, month, type){
		var prevdate;
		if(type == 'monthly'){
			prevdate = parseInt(year) - 1 + '-';
		}else{
			prevdate = parseInt(month) == 1 ? parseInt(year) - 1 + '-12' : year + '-' + this.dispose((parseInt(month) - 1));
		}
		return prevdate;
	}

	Calendar.prototype.getDate = function(){
		var now = new Date();
		var crtdate = now.getDate();
		var setMonth = now.getMonth() + 1 ;
		var setYear = now.getYear() + 1900;
		crtdate = this.dispose(crtdate);
		setMonth = this.dispose(setMonth);
		var date = {
			crtdate : crtdate,
			realmonth : setMonth,
			setMonth : setMonth,
			realyear : setYear,
			setYear : setYear
		}
		return date;
	}

	Calendar.prototype.dispose = function(val){
		var value = (parseInt(val)+100);
		value=value.toString();
		value=value.substring(1);
		return value;
	}

	Calendar.prototype.getOptions = function(options, date){
		if(options && typeof options == 'object'){
			$.each(options , function(key, value){
				if(value == void 0){
					delete options[key];
				}
			})
		}
		var option = $.extend({target : null }, CALENDAR_OPTION, date, options);
		return option;
	}

	var Plugin = function( option ){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data( 'ellie.calendar' );
			var options = typeof option == 'object' && option;
			if( !data ) $this.data( 'ellie.calendar', ( data = new Calendar(this, option) ) )
		})
	}

	$.fn.flexoCalendar = Plugin;
	$.fn.flexoCalendar.Constructor = Calendar;

	var old = $.fn.flexoCalendar;

  // calendarWidget no conflict

	$.fn.flexoCalendar.noConflict = function () {
	  	$.fn.flexoCalendar = old;
    	return this;
	}

})(jQuery)

+(function($){
	var root=this;
	var eli = function(obj) {
    	if (obj instanceof eli) return obj;
    	if (!(this instanceof eli)) return new eli(obj);
    	this.eliwrapped = obj;
  	};

  	root.eli = eli;

	eli.getMonthLen = function(year, month){
		var year = parseInt(year);
		var month = parseInt(month);
		var monthLen=[,31,28,31,30,31,30,31,31,30,31,30,31];
		if ((month == 2)&&(year % 4 == 0)&&((year % 100 != 0)||(year % 400 == 0))){
		  return 29;
		}else{
		  return monthLen[month];
		}
	}

	eli.getMonthWeek = function(year, month, day){
		var year = parseInt(year),
			month = parseInt(month),
			day = parseInt(day);
		var that = [year, month,],
			firDay = new Date(year, month - 1, 1).getDay(),
			start = 1,
			next = 8,
			monthLen = eli.getMonthLen(year, month),
		    nextfirDay = new Date(year , month, 1 ).getDay(),
		    another; 
		firDay = firDay == 0 ? 7 : firDay;
		next = firDay == 1 ? next : ( 9 - firDay );
		
		for ( var i = 0; i < 5 ; i++){
			if( start <= day && day < next){
				that[2] = 'week' + ( i + 1 );
			}
			start = next ;
			next += 7;
			next = next > monthLen ? monthLen : next;
		}
		if( nextfirDay !=1 ){
			another = [,,'week1'];
			another[1] = month + 1 == 13 ? 1 : month + 1;
			another[0] = another[1] == 1 ? year + 1 : year;
		}
		var output = [that, another];
		return output
	}
})(jQuery)
