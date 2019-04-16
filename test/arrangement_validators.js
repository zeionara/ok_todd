'use strict';

const config = require('config-yml');
const arrangement_validators = require('../app/arrangement_validators');
const date_converters = require('../app/date_converters');
const db_api = require('../app/db_api');
const { contains_any } = require('./tools');

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);
beforeEach(function(done) {
    db_api.clear_arrangements_collection().then(function(result){
        done();
    });
});
describe('if_time_free', () => {
	describe('invalid time', () => {
		it('it should say that time is invalid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 22:24:00'), 'sunday'), 'shaving').then(function(result){
				//console.log(result);
				result.success.should.be.false;
				result.message.should.satisfy(function(message){
    				return contains_any(message, config.out_of_schedule_time.start);
				});
				done();
			});
		});
		it('it should say that time of finishing is invalid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 17:24:00'), 'monday'), 'shaving').then(function(result){
				//console.log(result);
				result.success.should.be.false;
				result.message.should.satisfy(function(message){
    				return contains_any(message, config.end_out_of_schedule_time.start);
				});
				done();
			});
		});
	});
	describe('invalid day', () => {
		it('it should say that day is invalid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 15:24:00'), 'sunday'), 'shaving').then(function(result){
				result.success.should.be.false;
				result.message.should.satisfy(function(message){
    				return contains_any(message, config.out_of_schedule_day.start);
				});
				done();
			});
		});
	});
	describe('correct arrangement', () => {
		it('it should say that day is valid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2119 15:24:00'), 'friday'), 'shaving').then(function(result){
				result.success.should.be.true;
				result.message.should.satisfy(function(message){
    				return contains_any(message, config.valid_arrangement_time);
				});
				done();
			});
		});
	});
});
