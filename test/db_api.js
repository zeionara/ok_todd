'use strict';

const config = require('config-yml');
const arrangement_validators = require('../app/arrangement_validators');
const date_converters = require('../app/date_converters');
const db_api = require('../app/db_api');
const { contains_any } = require('./tools');
const sinon = require('sinon');

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);
beforeEach(function(done) {
    db_api.clear_arrangements_collection().then(function(result){
        done();
    });
});
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
			db_api.write_arrangement('shaving', date_converters.fix_date(new Date('April 15, 2019 09:24:00'), 'monday'), 'lastname', fake_agent, 'additional_info').then(function(result){
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
			db_api.write_arrangement('shaving', date_converters.fix_date(new Date('April 15, 2019 09:24:00'), 'tuesday'), 'lastname', fake_agent, 'additional_info').then(function(result){
				result.success.should.be.true;
				return db_api.write_arrangement('shaving', date_converters.fix_date(new Date('April 15, 2019 09:24:00'), 'tuesday'), 'lastname', fake_agent, 'additional_info');
			}).then(function(result){
				result.success.should.be.false;
				done();
			});
		});
	});
});
