'use strict';

const db_api = require('./db_api');
const contexts = require('./contexts');

exports.increase = (agent, cause) => {
    contexts.update_negative_experience_degree(agent, contexts.get_negative_experience(agent) + 1)
    db_api.write_negative_experience(cause);
}