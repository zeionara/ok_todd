const db_api = require('./db_api.js');
const date_converters = require('./date_converters.js');
const negative_experience = require('./negative_experience.js');

var NUMBER_OF_DAYS_PLANNING = 7;

function get_ticks(start_time, end_time, date, hms_step){
	// get array of datetime ticks with given step starting from given date in given bounds
	let result = [];
	let end_hms = date_converters.get_hms_from_date(end_time);
	let start_hms = date_converters.get_hms_from_date(start_time);
	while ((date_converters.get_hms_from_date(date) <= end_hms) && (date_converters.get_hms_from_date(date) >= start_hms)){
		result.push(date);
		date = date_converters.add_hms_step(date, hms_step);
	}
	return result;
}

function get_ticks_list(start_time, end_time, first_date, number_of_days, hms_step, weekend){
	// get array of datetime ticks with given step starting from given date in given bounds for the given number of days
	var days_counter = 0;
	var result = [];
	date_converters.ceil_hms(first_date, hms_step);
	while (days_counter <= number_of_days){
      	if (weekend.includes(first_date.getDay())){
			first_date = date_converters.add_days(first_date, 1);
			days_counter += 1;
			continue;
		}
		if (days_counter === 0){
			first_date = date_converters.ceil_hms(first_date, hms_step);
		} else {
			first_date.setHours(start_time.getHours());
		}
		result = result.concat(get_ticks(start_time, end_time, first_date, hms_step));
		days_counter += 1;
		first_date = date_converters.add_days(first_date, 1);
	}
	return result;
}

function validate_ticks(all_ticks, arrangement_ticks, end_time, duration){
	// calculate number of available masters for each tick
	var high_time_bound = date_converters.get_hms_from_date(date_converters.add_hours(end_time, -duration));
	all_ticks.forEach(function(tick){
		if (date_converters.get_hms_from_date(tick.time) > high_time_bound){
			tick.masters = 0;
		} else {
			arrangement_ticks.forEach(function(arrangement){
				if ((arrangement['start'] <= tick['time']) && (arrangement['end'] >= tick['time']) || 
					(arrangement['start'] <= date_converters.add_hours(tick['time'], duration)) && 
					(arrangement['end'] >= date_converters.add_hours(tick['time'], duration)) && (tick['masters'] > 0)){
					tick['masters'] -= 1;
				};
			});
		}		
	});
	return all_ticks.filter(function(item){return item['masters'] > 0}).map(function(tick){return tick['time']});
}

function get_closest(ticks, date, count){
	// considering that client might be free at the same time on other days get the most related datetimes
	var control_time = date.getTime();
	var second_day_time = date_converters.add_days(date, 1).getTime();
	var third_day_time = date_converters.add_days(date, 2).getTime();
	var closest = [];
	ticks.forEach(function(tick){
		closest.push({'time': tick, 'closeness': Math.abs(tick.getTime() - control_time)});
		closest.push({'time': tick, 'closeness': Math.abs(tick.getTime() - second_day_time) + 1});
		closest.push({'time': tick, 'closeness': Math.abs(tick.getTime() - third_day_time) + 2});
	});
	closest.sort(function(first_item, second_item){return first_item['closeness'] - second_item['closeness']});
	return closest.slice(0, count).map(function(item){return item['time']});
}

function formulate_suggestion(ticks){
	// get suggestion for giving to the user
	var base = 'Possibly, you are free at this time: ';
	var stringified_ticks = ticks.map(function(tick){
		var prefix = '';
		if ((tick['weekday'] != date_converters.TODAY_INFORMAL_DESCRIPTION) && (tick['weekday'] != date_converters.TOMORROW_INFORMAL_DESCRIPTION)){
			prefix = 'on ';
		}
		return prefix + tick['weekday'] + ' at ' + tick['time'];
	});
	return base + stringified_ticks.slice(0, stringified_ticks.length - 1).join(', ') + ' or ' + stringified_ticks[stringified_ticks.length - 1];
}

function get_suggestion(arrangements, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend){
	// filter out unrelated arrangements
	var filtered = arrangements.filter(function(item){
		return (desired_service_type == item.name);
	});

	// make list of ticks looking like {start_date, end_date}
	var ticks = filtered.map(function(item){return {'start': item['time'], 'end': date_converters.add_hms(new Date(item['time']), duration*3600)}});
	ticks.sort();

	// get available slots in the schedule
	var all_ticks = get_ticks_list(start_work, end_work, new Date(), NUMBER_OF_DAYS_PLANNING, [1,0,0], weekend)
					.map(function(item){return {'time': item, 'masters': masters}});

	// validate ticks and thow out busy slots
	var validated_ticks = validate_ticks(all_ticks, ticks, end_work, duration);
  
  	//print_dates(validated_ticks);

	// define closest ticks
	var closest_ticks = get_closest(validated_ticks, desired_time, 4).map(function(item){
		return {'weekday': date_converters.shortify_date(item), 'time': date_converters.convert_to_ampm_format(item)};
	});

	// formulate and return suggestion
	return formulate_suggestion(closest_ticks);
}

exports.if_time_free = (desired_time, desired_service_type) => {
	return new Promise((resolve, reject) => {
		var masters = 1;
		var duration = 1;
	  	var start_work = new Date();
		var end_work = new Date();
	  	var weekend = [];
		
		db_api.read_schedule().then(function(schedule){
			start_work = schedule.start_work;
			end_work = schedule.end_work;
			weekend = schedule.weekend;
			//var { start_work, end_work, weekend } = schedule;
			return db_api.read_service_type(desired_service_type);
		}).then(function(service_type_object) {
	        masters = service_type_object.masters;
	        duration = service_type_object.duration;
	        //var { masters, duration } = service_type_object;
	        return db_api.read_arrangement_times();
	    }).then(function(result){
	    	//console.log(start_work + '');
			//console.log(end_work + '');
	        let desired_time_hms = date_converters.get_hms_from_date(desired_time);
	        //console.log(`weekend = ${weekend}`);
			//console.log(`weekday = ${desired_time.getDay()}`);
	        //console.log(new Date());
	        //console.log(desired_time);
				
			if ((date_converters.get_hms_from_date(start_work) > desired_time_hms) || (date_converters.get_hms_from_date(end_work) < desired_time_hms)){
				//agent.add(`Umm, I am sorry, but we are working only from ${convert_to_ampm_format(start_work)} till ${convert_to_ampm_format(end_work)}. ` + 
				//	get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend));
	            //negative_experience.increase(agent, `schedule does not include ${convert_to_ampm_format(desired_time)}`);
	           	return resolve({
	           		'success': false, 
	           		'message': `Umm, I am sorry, but we are working only from ${date_converters.convert_to_ampm_format(start_work)} till ${date_converters.convert_to_ampm_format(end_work)}. ` + 
					get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend),
	           		'cause': `schedule does not include ${date_converters.convert_to_ampm_format(desired_time)}`
	           	});
			} else if (date_converters.get_hms_from_date(date_converters.add_hours(end_work, -duration)) < desired_time_hms){
				//db_api.write_negative_experience(`schedule does not include ${convert_to_ampm_format(add_hours(desired_time, duration))}`);
	            //agent.add(`I regret your service might take up to ${duration} hours but we are working only from ${convert_to_ampm_format(start_work)} till ${convert_to_ampm_format(end_work)}. ` + 
				//	get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend));
	            //negative_experience.increase(agent, `schedule does not include ${convert_to_ampm_format(add_hours(desired_time, duration))}`);
				return resolve({
					'success': false, 
					'message': `I regret your service might take up to ${duration} hours but we are working only from ${date_converters.convert_to_ampm_format(start_work)} till ${date_converters.convert_to_ampm_format(end_work)}. ` + 
					get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend),
					'cause': `schedule does not include ${date_converters.convert_to_ampm_format(date_converters.add_hours(desired_time, duration))}`
				});
			} else if (weekend.includes(desired_time.getDay())){
				//agent.add(`Oh, I am sorry, but we don't work ${get_weekdays_list(weekend.map(function(item){return get_weekday_from_index(item)}), ' and ')}. ` + 
				//	get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend));
	            //negative_experience.increase(agent, `weekend includes ${get_weekday_from_index(desired_time.getDay())}`);
				return resolve({
					'success': false, 
					'message': `Oh, I am sorry, but we don't work ${date_converters.get_weekdays_list(weekend.map(function(item){return date_converters.get_weekday_from_index(item)}), ' and ')}. ` + 
					get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend),
					'cause': `weekend includes ${date_converters.get_weekday_from_index(desired_time.getDay())}`
				});
	        }

	        var min_time = date_converters.add_hours(desired_time, -duration);
			var max_time = desired_time;

			var filtered = result.filter(function(item){
				return ((min_time <= item.time) && (max_time >= item.time) && (desired_service_type == item.name));
			});

			if (filtered.length < masters){
				//return resolve({'success': true});
				//agent.add(randomly_select(positive_arrangement_time));
	            //agent.setContext('getting_lastname');
				return resolve({'success': true});
			} else {
				//agent.add(randomly_select(negative_arrangement_time) + ' ' + get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend));
	            //increase_negative_experience(agent, `not enough masters for ${desired_service_type}`);
				return resolve({
					'success': false, 
					'message': 'Unfortunately there is not a free place. ' + get_suggestion(result, duration, masters, desired_time, desired_service_type, start_work, end_work, weekend),
					'cause': `not enough masters for ${desired_service_type}`
				});
			}
		}).catch(function (error){
			console.log(error);
			resolve(error);
		});
	});
}