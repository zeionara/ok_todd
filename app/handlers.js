'use strict';

const config = require('config-yml');
const db_api = require('./db_api.js');
const contexts = require('./contexts.js');
const date_converters = require('./date_converters.js');
const arrangement_validators = require('./arrangement_validators.js');
const repliers = require('./repliers.js');
const negative_experience = require('./negative_experience.js');
const random = require('./random');

exports.contacts_request = (agent) => {
	return new Promise((resolve, reject) => {
		db_api.read_contacts().then(function(contacts){
			return resolve(repliers.reply(agent, 
						random.randomly_select(config.contacts.start) + 
						contacts.email +
						random.randomly_select(config.contacts.middle) +
						contacts.email + 
						random.randomly_select(config.contacts.end)));
		}).catch(function(error){
	    	console.log('Error during requesting contacts');
	    	console.log(error);
	    	resolve(error);
	    });
	});
}
  
exports.write_order = (agent) => {
	return new Promise((resolve, reject) => {
		const additional_info = agent.parameters.additional_info;
	    //console.log(`[additional info handler] Additional info is ${additional_info}`);

	    const lastname = contexts.get_additional_info_context(agent).parameters['last-name'];
	    //console.log(`[additional info handler] Last name is ${lastname}`);

	    const service_type = contexts.get_arrangement_time_context(agent).parameters.service_type;
	    //console.log(`[additional info handler] Service type is ${service_type}`);

	    const arrangement_time = contexts.get_arrangement_time_context(agent).parameters.time;
	    const day_informal_description = contexts.get_arrangement_time_context(agent).parameters.day_informal_description;
	    //console.log(`[additional info handler] Arrangement time is ${arrangement_time}`);
	    
	    db_api.write_arrangement(service_type, date_converters.fix_date(new Date(arrangement_time), day_informal_description), lastname, agent, additional_info).then(function(result){
	    	contexts.clear_order_contexts(agent);
	    	if (result.success){
	    		repliers.reply(agent, random.randomly_select(config.arrangement_established));
	    	} else {
	    		repliers.reply(agent, random.randomly_select(config.arrangement_failed));
	    	}
	    	return resolve(result);
	    }).catch(function(error){
	    	console.log('Error during writing order');
	    	console.log(error);
	    	resolve(error);
	    });
	});	
}

exports.validate_arrangement_time = (agent) => {
	return new Promise((resolve, reject) => {
	    const arrangement_time = agent.parameters.time;
	    //console.log(`[arrangement time handler] Arrangement time is ${arrangement_time}`);

	    const day_informal_description = agent.parameters.day_informal_description;
	    //console.log(`[arrangement time handler] Day informal description is ${day_informal_description}`);
	    
	    //console.log('Agent in validate_arrangement_time');
		//console.log(agent);
	    const service_type = contexts.get_arrangement_time_context(agent).parameters.service_type;
	    //console.log(`[arrangement time handler] Service type is ${service_type}`);

		arrangement_validators.if_time_free(date_converters.fix_date(new Date(arrangement_time), day_informal_description), service_type, agent).then(function(result){
			if (result.success){
				repliers.reply(agent, result.message);
				contexts.start_getting_last_name(agent);
			} else {
				repliers.reply(agent, result.message);
				negative_experience.increase(agent, result.cause);
			}
			return resolve(result);
		}).catch(function(error){
	    	console.log('Error during validating arrangement');
	    	console.log(error);
	    	resolve(error);
	    });
	});
}
