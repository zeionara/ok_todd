process.env.NODE_ENV = 'test';

const arrangement_validators = require('../arrangement_validators');
const date_converters = require('../date_converters');

//arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'sunday'), 'shaving').then(function(result){
//	console.log(result);
//});

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);
describe('arrangement_validators', () => {
	describe('invalid time', () => {
		it('it should say that time is invalid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 22:24:00'), 'sunday'), 'shaving').then(function(result){
				chai.expect(result.success).to.be.false;
				chai.expect(result.message).to.include('from 9am till 7pm');
				done();
			});
		});
		it('it should say that time of finishing is invalid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 17:24:00'), 'monday'), 'shaving').then(function(result){
				chai.expect(result.success).to.be.false;
				chai.expect(result.message).to.include('might take up to');
				done();
			});
		});
	});
	describe('invalid day', () => {
		it('it should say that day is invalid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2019 12:24:00'), 'sunday'), 'shaving').then(function(result){
				chai.expect(result.success).to.be.false;
				chai.expect(result.message).to.include("I am sorry, but we don't work on");
				done();
			});
		});
	});
	describe('correct arrangement', () => {
		it('it should say that day is invalid', (done) => {
			arrangement_validators.if_time_free(date_converters.fix_date(new Date('April 15, 2119 12:24:00'), 'friday'), 'shaving').then(function(result){
				chai.expect(result.success).to.be.true;
				done();
			});
		});
	});
});
