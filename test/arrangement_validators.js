'use strict';

const config = require('config-yml');
const arrangement_validators = require('../app/arrangement_validators');
const date_converters = require('../app/date_converters');
const db_api = require('../app/db_api');
const { contains_any } = require('./tools');

//arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'sunday'), 'shaving').then(function(result){
//	console.log(result);
//});

//console.log(config);

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);
describe('if_time_free', () => {
	/*before(function(done) {
		db_api.clear_base_info_collection().then(function(result){
			console.log('Base info deleted');
    		//console.log(result);
    		return db_api.clear_service_types_collection();
		}).then(function(result){
			console.log('Service types deleted');
    		//console.log(result);
    		return db_api.fill_up_base_info({
	    		'email': 'zeionara@gmail.com',
	    		'phone': '8 800 555 35 35'
	    	}, {
	    		'start_work': new Date('April 13, 2019 09:00:00'),
	    		'end_work': new Date('April 13, 2019 19:00:00'),
	    		'weekend': [new Date('April 13, 2019 12:24:00'), new Date('April 14, 2019 12:24:00')]
	    	});
		}).then(function(result){
    		console.log('Base info uploaded');
    		//console.log(result);
    		return db_api.fill_up_service_types([{
    			'name': 'shaving',
    			'duration': 3,
    			'masters': 1
    		}]);
    	}).then(function(result){
    		console.log('Service types uploaded');
    		//console.log(result);
    		done();
    	}).catch(function(error){
    		console.log(error);
    	});
  	});*/

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
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'sunday'), 'shaving').then(function(result){
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
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2119 12:24:00'), 'friday'), 'shaving').then(function(result){
				result.success.should.be.true;
				result.message.should.satisfy(function(message){
    				return contains_any(message, config.valid_arrangement_time);
				});
				done();
			});
		});
	});
});
