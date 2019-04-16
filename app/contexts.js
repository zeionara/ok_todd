'use strict';

const config = require('config-yml');

exports.clear_order_contexts = (agent) => {
	//set_context(agent, {'name':'negative_arrangement_experienced','lifespan': 0});
	clear_context(agent, config.contexts.negative_arrangement_experienced);
	//set_context(agent, {'name':'getting_client_desire','lifespan': 0});
	clear_context(agent, config.contexts.getting_client_desire);
	//set_context(agent, {'name':'getting_additional_info','lifespan': 0});
	clear_context(agent, config.contexts.getting_additional_info);
	//set_context(agent, {'name':'getting_arangement_time','lifespan': 0});
	clear_context(agent, config.contexts.getting_arrangement_time);
	//set_context(agent, {'name':'getting_lastname','lifespan': 0});
	clear_context(agent, config.contexts.getting_lastname);
}

exports.start_getting_last_name = (agent) => {
	set_context(agent, config.contexts.getting_lastname);
}

exports.update_negative_experience = (agent, negative_experience_degree) => {
	set_context(agent, {
    	'name': config.contexts.negative_arrangement_experienced,
    	'lifespan': config.lifespan.negative_arrangement_experienced.initial,
    	'parameters':{
    		'negative_experience': negative_experience_degree
    	}
    });
}

exports.get_negative_experience_degree = (agent) => {
	let negative_experience_context = this.get_negative_arrangement_experienced_context(agent);
	if (negative_experience_context){
		return negative_experience_context.parameters.negative_experience; 
	} else {
		return 0;
	}
}

exports.get_arrangement_time_context = (agent) => {
	//console.log('Agent in get_arrangement_time_context');
	//console.log(agent);
	return get_context(agent, config.contexts.getting_arrangement_time);
}

exports.get_additional_info_context = (agent) => {
	return get_context(agent, config.contexts.getting_additional_info);
}

exports.get_negative_arrangement_experienced_context = (agent) => {
	return get_context(agent, config.contexts.negative_arrangement_experienced);
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
