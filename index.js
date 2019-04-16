'use strict';

const config = require('config-yml');
const { WebhookClient } = require('dialogflow-fulfillment');
const handlers = require('./app/handlers.js');

console.log(config);
/*
const date_converters = require('./app/date_converters');
const arrangement_validators = require('./app/arrangement_validators.js');
arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 22:24:00'), 'sunday'), 'shaving').then(function(result){
	console.log(result);
});
*/

exports.main = (request, response) => {
	const agent = new WebhookClient({ request, response });

	let intentMap = new Map();
	
	intentMap.set(config.intents.contacts, handlers.contacts_request);
	intentMap.set(config.intents.arrangement_time, handlers.validate_arrangement_time);
  	intentMap.set(config.intents.establish_arrangement_with_additional_info, handlers.write_order);
  	intentMap.set(config.intents.establish_arrangement, handlers.write_order);

	agent.handleRequest(intentMap);
};