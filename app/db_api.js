'use strict';

const config = require('config-yml');
const tools = require('./tools.js');
const admin = require('firebase-admin');
const contexts = require('./contexts');
const arrangement_validators = require('./arrangement_validators');

admin.initializeApp({
    apiKey: config.firebase_admin.todd_api_key,
    authDomain: config.firebase_admin.todd_auth_domain,
    databaseURL: config.firebase_admin.todd_database_url,
    projectId: config.firebase_admin.todd_project_id,
    storageBucket: config.firebase_admin.todd_storage_bucket,
    messagingSenderId: config.firebase_admin.todd_messaging_sender_id,
});
var db = admin.firestore();

exports.write_arrangement = (service_type, arrangement_time, lastname, agent, additional_info) => {
	var new_order = {
		'service_type': service_type,
		'last_name': lastname,
		'time': arrangement_time
	};
    
    if (contexts.get_negative_arrangement_experienced_context(agent)){
		new_order.negative_experience = contexts.get_negative_experience_degree(agent);
	}
    
    if (additional_info){
		new_order.additional_info = additional_info;
	}

	return new Promise((resolve, reject) => {
		arrangement_validators.if_time_free(arrangement_time, service_type).then(function(result){
			if (!result.success){
				throw new Error('arrangement time is invalid');
			} else {
				return db.collection(config.collections.service_types).where('name', '==', service_type).get();
			}
		}).then(function(query_snapshot) {
        	query_snapshot.forEach(function(doc) {
            	new_order.service_type = doc._ref;
          	});
          	return db.collection(config.collections.arrangements).add(new_order);
        }).then(function(ref){
			//console.log('Added a new document with reference:');
			//console.log(ref);
			resolve({'result': ref, 'success': true});
		}).catch(function(error){
			console.log('There is some error');
			resolve({'result': error, 'success': false});
		});
	});
}

exports.read_contacts = () => {
	return new Promise((resolve, reject) => {
		db.collection(config.collections.base_info).doc('contacts').get().then(function(contacts){
			let email = contacts.data().email;
			let phone = contacts.data().phone;
			return resolve({'email': email, 'phone': phone});
		});
	});
}

exports.read_schedule = () => {
	return new Promise((resolve, reject) => {
		db.collection(config.collections.base_info).doc('schedule').get().then(function(schedule){
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
		db.collection(config.collections.service_types).where('name', '==', service_type).get().then(function(query_snapshot){
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
		db.collection(config.collections.arrangements).get().then(function(arrangements_query_snapshot){
			var promises = [];
			arrangements_query_snapshot.forEach(function(doc){
				promises.push(db.collection(config.collections.service_types).get(doc.data().service_type.path.split('/')[1]));
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
  	db.collection(config.collections.negative_experiences).add(new_entry).then(function(ref){
      console.log('Added a new negative_experience with reference:');
      console.log(ref);
      resolve(ref);
    }).catch(function(error){
      console.log('There is some error on negative_experience writing');
      resolve(error);
    });
  });
}

//

exports.fill_up_base_info = (contacts, schedule) => {
	return new Promise((resolve, reject) => {
		var batch = db.batch();
		
		batch.set(db.collection(config.collections.base_info).doc('schedule'), schedule);
		batch.set(db.collection(config.collections.base_info).doc('contacts'), contacts);

		batch.commit().then(function(result){
    		resolve(result);
		}).catch(function(error){
      		console.log('There is some error while filling up base info');
      		console.log(error);
      		resolve(error);
    	});
	});
}

exports.fill_up_service_types = (service_types) => {
	return new Promise((resolve, reject) => {
		var batch = db.batch();
		
		service_types.forEach(function(service_type){
			batch.set(db.collection(config.collections.service_types).doc(), service_type);
		});

		batch.commit().then(function(result){
    		resolve(result);
		}).catch(function(error){
      		console.log('There is some error while filling up service types');
      		console.log(error);
      		resolve(error);
    	});
	});
}

exports.clear_base_info_collection = () => {
	return clear_collection(config.collections.base_info);
}

exports.clear_service_types_collection = () => {
	return clear_collection(config.collections.service_types);
}

exports.clear_arrangements_collection = () => {
	return clear_collection(config.collections.arrangements);
}

exports.clear_negative_experiences_collection = () => {
	return clear_collection(config.collections.negative_experiences);
}

function clear_collection(collection_name){
	return new Promise((resolve, reject) => {
		db.collection(collection_name).get().then((snapshot) => {
	  		snapshot.forEach(function(document_snapshot){
	  			//console.log(document_snapshot);
	    		document_snapshot._ref.delete();
	  		});
	  		resolve(snapshot);
		});
	});
}

