'use strict';

exports.contains_any = (string, substrings) => {
	return !substrings.every(substring => {
		return !string.includes(substring);
	});
}