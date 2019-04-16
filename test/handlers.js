'use strict';

const config = require('config-yml');
const handlers = require('../app/handlers');
const { contains_any } = require('./tools');
const sinon = require('sinon');
const db_api = require('../app/db_api');

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);
beforeEach(function(done) {
    db_api.clear_arrangements_collection().then(function(result){
        done();
    });
});
describe('contacts_request', () => {
	it('it returns message with contacts', (done) => {
		let fake_agent = { 
			add: function(message){
				console.log(message);
			}
		};
		let mock_agent = sinon.mock(fake_agent);
		mock_agent.expects('add').once();
		handlers.contacts_request(fake_agent).then(function(result){
			result.should.satisfy(function(message){
    			return contains_any(message, config.contacts.start);
			});
			mock_agent.verify();
			done();
		});
	});
});
describe('write_order', () => {
	it('it successfully writes order to the database', (done) => {
		var additional_info = 'comment';
		var last_name = 'ln';
		var service_type = 'shaving';
		var time = new Date('April 14, 2019 12:24:00');
		var fixed_time = new Date('April 16, 2019 12:24:00');
		var day_informal_description = 'tuesday';

		let fake_agent = {
			parameters: {
				'additional_info': additional_info,
			},
			getContext: function(context_name){
				if (context_name == config.contexts.getting_additional_info){
					return {
						parameters: {
							'last-name': 'ln',
						}
					}
				} else if (context_name == config.contexts.getting_arrangement_time){
					return {
						parameters: {
							'service_type': service_type,
							'time': time,
							'day_informal_description': day_informal_description
						}
					}
				}
			},
			add: function(message){
				console.log(message);
			},
			deleteContext: function(){
				return 0;
			}
		};
		let mock_agent = sinon.mock(fake_agent);
		mock_agent.expects('add').once();
		mock_agent.expects('deleteContext').atLeast(5);
		handlers.write_order(fake_agent).then(function(result){
			result.success.should.be.true;
			mock_agent.verify();
			return result.result.get();
		}).then(function(doc){
			doc.data().additional_info.should.equal(additional_info);
			doc.data().last_name.should.equal(last_name);
			doc.data().time.toDate().getDay().should.equal(fixed_time.getDay());
			return doc.data().service_type.get();
		}).then(function(service_type_object){
			service_type_object.data().name.should.equal(service_type);
			done();
		})
	});
});
describe('validate_arrangement_time', () => {
	it('it returns about good arrangement time', (done) => {
		var service_type = 'shaving';
		var time = new Date('April 14, 2019 12:24:00');
		var day_informal_description = 'tuesday';

		let fake_agent = {
			parameters: {
				'time': time,
				'day_informal_description': day_informal_description
			},
			getContext: function(context_name){
				if (context_name == config.contexts.getting_arrangement_time){
					return {
						parameters: {
							'service_type': service_type,
						}
					}
				}
			},
			add: function(message){
				console.log(message);
			},
			setContext: function(context_name){
				return 0;
			}
		};
		let mock_agent = sinon.mock(fake_agent);
		mock_agent.expects('setContext').once();
		mock_agent.expects('add').once();
		handlers.validate_arrangement_time(fake_agent).then(function(result){
			result.success.should.be.true;
			result.message.should.satisfy(function(message){
				return contains_any(message, config.valid_arrangement_time);
			});
			mock_agent.verify();
			done();
		});
	});
});
