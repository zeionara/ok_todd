'use strict';

function get_random_int(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}

exports.randomly_select = (options) => {
	return options[get_random_int(0, options.length)];
}