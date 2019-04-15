exports.get_times = (query_snapshot) => {
	return get_properties(query_snapshot, 'time');
}

exports.get_name = (query_snapshot) => {
	return get_properties(query_snapshot, 'name')[0];
}

function get_properties(query_snapshot, property_name){
	var times = [];
	query_snapshot.forEach(function(item){
		times.push(item.data()[property_name]);
	});
	return times;
}