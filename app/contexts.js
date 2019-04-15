exports.clear_order_contexts = (agent) => {
	//set_context(agent, {'name':'negative_arrangement_experienced','lifespan': 0});
	clear_context(agent, 'negative_arrangement_experienced');
	//set_context(agent, {'name':'getting_client_desire','lifespan': 0});
	clear_context(agent, 'getting_client_desire');
	//set_context(agent, {'name':'getting_additional_info','lifespan': 0});
	clear_context(agent, 'getting_additional_info');
	//set_context(agent, {'name':'getting_arangement_time','lifespan': 0});
	clear_context(agent, 'getting_arangement_time');
	//set_context(agent, {'name':'getting_lastname','lifespan': 0});
	clear_context(agent, 'getting_lastname');
}

exports.start_getting_last_name = (agent) => {
	set_context(agent, 'getting_lastname');
}

exports.update_negative_experience = (agent, negative_experience_degree) => {
	set_context(agent, {
    	'name':'negative_arrangement_experienced',
    	'lifespan': 7,
    	'parameters':{
    		'negative_experience': negative_experience_degree
    	}
    });
}

exports.get_negative_experience_degree = (agent) => {
	let negative_experience_context = get_context(agent, 'negative_arrangement_experienced');
	if (negative_experience_context){
		return negative_experience_context.parameters.negative_experience; 
	} else {
		return 0;
	}
}

exports.get_arrangement_time_context = (agent) => {
	//console.log('Agent in get_arrangement_time_context');
	//console.log(agent);
	return get_context(agent, 'getting_arangement_time');
}

exports.get_additional_info_context = (agent) => {
	return get_context(agent, 'getting_additinal_info');
}

function get_context(agent, context_name){
	return agent.getContext(context_name);
}

function set_context(agent, context_object){
	return agent.setContext(context_object);
}

function clear_context(agent, context_name){
	return agent.deleteContext(context_name);
}
