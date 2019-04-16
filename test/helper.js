'use strict';

const db_api = require('../app/db_api');

before(function(done) {
    db_api.clear_negative_experiences_collection().then(function(result){
        console.log('Negative experiences deleted');
        return db_api.clear_arrangements_collection();
    }).then(function(result){
        console.log('Arrangements deleted');
        return db_api.clear_base_info_collection();
    }).then(function(result){
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
});