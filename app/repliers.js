'use strict';

exports.reply = (agent, message) => {
	agent.add(message);
	return message;
}