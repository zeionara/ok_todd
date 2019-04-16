'use strict';

const config = require('config-yml');
const arrangement_validators = require('../app/arrangement_validators');
const date_converters = require('../app/date_converters');
const db_api = require('../app/db_api');
const { contains_any } = require('./tools');
const sinon = require('sinon');

//arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'sunday'), 'shaving').then(function(result){
//	console.log(result);
//});

//console.log(config);

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

console.log('ok');
console.log(sinon.fake());

chai.use(chaiHttp);
describe('write_arrangement', () => {
	describe('valid arrangement', () => {
		it('it should say that time is invalid', (done) => {
			let fake_agent = { 
				getContext: sinon.stub().returns({
					'parameters':{
						'negative_experience':2
					}
				})
			};
			//let fake_agent = sinon.mock(agent_api);
			//console.log(fake_agent);
			//console.log(fake_agent.getContext(config.contexts.negative_arrangement_experienced));
			//console.log(fake_agent.getContext(config.contexts.negative_arrangement_experienced));
			//fake_agent.expects('getContext').withArgs(config.contexts.negative_arrangement_experienced).returns({'parameters':{'negative_experience':2}});
			db_api.write_arrangement('shaving', date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'monday'), 
									'lastname', fake_agent, 'additional_info').then(function(result){
				//console.log(result);
				result.success.should.be.true;
				done();
			});
		});
	});
	describe('incorrect arrangement', () => {
		it('it should say that time is busy', (done) => {
			let fake_agent = {
				getContext: sinon.stub().returns({
					'parameters':{
						'negative_experience':2
					}
				})
			};
			db_api.write_arrangement('shaving', date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'tuesday'), 
									'lastname', fake_agent, 'additional_info').then(function(result){
				//console.log(result);
				result.success.should.be.true;
				db_api.write_arrangement('shaving', date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'tuesday'), 
										'lastname', fake_agent, 'additional_info').then(function(result){
					//console.log(result);
					result.success.should.be.false;
					done();
				});
			});
		});
	});
});
