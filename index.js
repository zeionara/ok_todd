'use strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const handlers = require('./handlers.js');

exports.main = (request, response) => {
	const agent = new WebhookClient({ request, response });

	let intentMap = new Map();
	
	intentMap.set('Give contact with real person', handlers.contacts_request);
	intentMap.set('Get arrangement time', handlers.validate_arrangement_time);
  	intentMap.set('Get additional info', handlers.write_order);
  	intentMap.set('No additional info', handlers.write_order);

	agent.handleRequest(intentMap);
};