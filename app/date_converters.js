'use strict';

const config = require('config-yml');

exports.fix_date = (date, informal_description) => {
	var fixed_date = new Date();
	if (informal_description == config.day_informal_description.tomorrow){
		fixed_date = this.add_days(fixed_date, 1);
	} else if (informal_description != config.day_informal_description.today){
		fixed_date = this.add_days(fixed_date, get_distance(fixed_date.getDay(), get_weekday_index(informal_description)));
	}
	fixed_date.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), 0);
	return fixed_date;
}

// hms_step stands for [hour, minute, second]

exports.add_hms_step = (date, hms_step) => {
   var new_date = new Date();
   new_date.setTime(date.getTime() + (hms_step[0]*60*60*1000) + (hms_step[1]*60*1000) + (hms_step[2]*1000)); 
   return new_date;
}

exports.get_hms_from_date = (date) => {
	return date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds();
}

exports.get_hms_from_array = (array) => {
	return array[0]*3600 + array[1]*60 + array[2];
}

exports.add_hms = (date, hms) => {
	var hours = Math.floor(hms/3600);
	hms -= hours * 3600;
	var minutes = Math.floor(hms/60);
	hms -= minutes * 60;
	date.setHours(date.getHours() + hours, date.getMinutes() + minutes, date.getSeconds() + hms, 0);
	return date;
}

exports.ceil_hms = (date, hms_step) => {
	var hms = this.get_hms_from_array(hms_step);
	return this.add_hms(date, hms - this.get_hms_from_date(date) % hms);
}

exports.add_days = (date, days) => {
	var new_date = new Date();
   	new_date.setTime(date.getTime()); 
	new_date.setDate(date.getDate() + days);
	return new_date;
}

exports.add_hours = (date, h) => {
   var new_date = new Date();
   new_date.setTime(date.getTime() + (h*60*60*1000)); 
   return new_date;
}

//

exports.add_time_offset = (date, offset) => {
    var utc = date.getTime() + (0 * 60000);
    var nd = new Date(utc + (3600000*offset));
    //console.log(nd + '');
    return nd;
}

exports.convert_to_ampm_format = (date) => {
  date = this.add_time_offset(date, config.timezone_offset);
  var hours = date.getHours();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var strTime = hours + ampm;
  return strTime;
}

exports.is_today = (date) => {
	if(new Date(date).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)) {
    	return true;
	}
	return false;
}

exports.is_tomorrow = (date) => {
	if(new Date(date).setHours(0,0,0,0) == this.add_days(new Date(), 1).setHours(0,0,0,0)) {
    	return true;
	}
	return false;
}

exports.get_weekday_from_index = (weekday_index) => {
	//console.log(weekday_index);
  switch (weekday_index) {
  		case 0:
    		return config.day_informal_description.sunday;
  		case 1:
  			return config.day_informal_description.monday;
  		case 2:
  			return config.day_informal_description.tuesday;
  		case 3:
  			return config.day_informal_description.wednesday;
  		case 4:
  			return config.day_informal_description.thursday;
  		case 5:
  			return config.day_informal_description.friday;
  		case 6:
  			return config.day_informal_description.saturday;
  		default:
    		throw new RangeError('incorrect day of week');
	}
}

exports.shortify_date = (date) => {
	if (this.is_today(date)){
		return config.day_informal_description.today;
	} else if (this.is_tomorrow(date)){
		return config.day_informal_description.tomorrow;
	}
	return this.get_weekday_from_index(date.getDay());
}

exports.get_weekdays_list = (weekdays, day_prefix, separator, last_separator) => {
	var mapped_weekdays = weekdays.map(function(weekday){
    var prefix = '';
		if ((weekday != config.day_informal_description.today) && (weekday != config.day_informal_description.tomorrow)){
			prefix = day_prefix;
		}
		return prefix + weekday;
	});
	return mapped_weekdays.slice(0, mapped_weekdays.length - 1).join(separator) + last_separator + mapped_weekdays[mapped_weekdays.length - 1];
}

function get_distance(first_weekday_index, second_weekday_index){
	if (second_weekday_index <= first_weekday_index){
		second_weekday_index += 7;
	}
	return second_weekday_index - first_weekday_index;
}

function get_weekday_index(weekday){
	switch (weekday) {
  		case config.day_informal_description.sunday:
    		return 0;
  		case config.day_informal_description.monday:
  			return 1;
  		case config.day_informal_description.tuesday:
  			return 2;
  		case config.day_informal_description.wednesday:
  			return 3;
  		case config.day_informal_description.thursday:
  			return 4;
  		case config.day_informal_description.friday:
  			return 5;
  		case config.day_informal_description.saturday:
  			return 6;
  		default:
    		throw new RangeError('incorrect day of week');
	}
}

