'use strict';

const tools = require('./tools.js');
const admin = require('firebase-admin');

admin.initializeApp({
    apiKey: process.env.TODD_API_KEY,
    authDomain: process.env.TODD_AUTH_DOMAIN,
    databaseURL: process.env.TODD_DATABASE_URL,
    projectId: process.env.TODD_PROJECT_ID,
    storageBucket: process.env.TODD_STORAGE_BUCKET,
    messagingSenderId: process.env.TODD_MESSAGING_SENDER_ID,
});
var db = admin.firestore();

exports.write_arrangement = (service_type, arrangement_time, lastname, agent, additional_info) => {
	var new_order = {
		'service_type': service_type,
		'last_name': lastname,
		'time': arrangement_time
	};
    
    if (agent.getContext('negative_arrangement_experienced')){
		new_order.negative_experience = agent.getContext('negative_arrangement_experienced').parameters.negative_experience;
		//agent.setContext({'name':'negative_arrangement_experienced','lifespan': 0});
	}
    
    if (additional_info){
		new_order.additional_info = additional_info;
	}

	return new Promise((resolve, reject) => {
		db.collection("service_types").where('name', '==', service_type).get().then(function(query_snapshot) {
        	query_snapshot.forEach(function(doc) {
            	new_order.service_type = doc._ref;
          	});
          	return db.collection('arrangements').add(new_order);
        }).then(function(ref){
			console.log('Added a new document with reference:');
			console.log(ref);
			//agent.add(randomly_select(bye));
          	//clear_order_contexts(agent);
			resolve({'result': ref, 'success': true});
		}).catch(function(error){
			console.log('There is some error');
			//agent.add('Something went wrong. Suffering...');
			resolve({'result': error, 'success': false});
		});
	});
}

exports.read_contacts = () => {
	return new Promise((resolve, reject) => {
		db.collection("base_info").doc('contacts').get().then(function(contacts){
			let email = contacts.data().email;
			let phone = contacts.data().phone;
			return resolve({'email': email, 'phone': phone});
		});
	});
}

exports.read_schedule = () => {
	return new Promise((resolve, reject) => {
		db.collection("base_info").doc('schedule').get().then(function(schedule){
			return resolve({
				'start_work': schedule.data().start_work.toDate(),
				'end_work': schedule.data().end_work.toDate(),
				'weekend': schedule.data().weekend.map(function(item){return item.toDate().getDay()})
			});
		});
	});
}

exports.read_service_type = (service_type) => {
	return new Promise((resolve, reject) => {
		db.collection("service_types").where('name', '==', service_type).get().then(function(query_snapshot){
			var result = {'masters': 1, 'duration': 1};
			query_snapshot.forEach(function(doc) {
	          	result.masters = doc.data().masters;
	        	result.duration = doc.data().duration;
	        });
			return resolve(result);
		});
	});
}

exports.read_arrangement_times = () => {
	return new Promise((resolve, reject) => {
		db.collection('arrangements').get().then(function(arrangements_query_snapshot){
			var promises = [];
			arrangements_query_snapshot.forEach(function(doc){
				promises.push(db.collection('service_types').get(doc.data().service_type.path.split('/')[1]));
			});
			promises.push(arrangements_query_snapshot);
			return Promise.all(promises);
		}).then(function(docc){

			var res = [];

			var arrangements_query_snapshot = docc[docc.length - 1];
			var service_types_query_snapshot = docc.slice(0, docc.length - 1);

			var times = tools.get_times(arrangements_query_snapshot);
			var names = docc.slice(0, docc.length - 1).map(tools.get_name);

			var result = times.map(function(item, index){
				return {'time' : item.toDate(), 'name': names[index]};
			});

			return resolve(result);
		});
	});
}

exports.write_negative_experience = (cause) => {
  var new_entry = {
    'date': new Date(),
    'cause': cause
  };

  return new Promise((resolve, reject) => {
  	db.collection('negative_experiences').add(new_entry).then(function(ref){
      console.log('Added a new negative_experience with reference:');
      console.log(ref);
      resolve(ref);
    }).catch(function(error){
      console.log('There is some error on negative_experience writing');
      resolve(error);
    });
  });
}
