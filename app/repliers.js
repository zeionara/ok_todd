'use strict';

const random = require('./random'); 

var positive_arrangement_time = ['There is a free place! Then, tell me please your lastname', 'You are lucky! We are ready to serve you at this time! How could we call you?'];
var negative_arrangement_time = ['Unfortunately at that time our masters are busy. But you can select another time!', 'Well, I regret we cannot serve you at this time. But we will be happy to see you in other moment! Please, tell me, when you could come.'];

var bye = ['Well, now we finished. Thank you very much!', 'Ok, everything is perfect. See you soon!'];

exports.bye = (agent) => {
	agent.add(random.randomly_select(bye));
}

exports.error_bye = (agent) => {
	agent.add('Something went wrong while saving your arrangement. Suffering...');
}

exports.give_contacts = (agent, contacts) => {
	let message = `You could contact our managers via ${contacts.email} or call to ${contacts.phone} if you prefer verbal communication`;
	console.log(message);
	agent.add(message);
	return message;
}

exports.time_is_free = (agent, message) => {
	let response = 'Time is free! ' + (message ? message : random.randomly_select(positive_arrangement_time));
	agent.add(response);
	return response;
}

exports.time_is_busy = (agent, message) => {
	let response = 'Time is busy! ' +  (message ? message : random.randomly_select(negative_arrangement_time));
	agent.add(response);
	return response;
}