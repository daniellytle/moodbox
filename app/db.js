// DB config
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : '104.236.24.198',
	user     : 'root',
	password : 'systems2016',
	database : 'moodbox'
});

connection.connect(function(err) {
  console.log(err.code); // 'ECONNREFUSED' 
  console.log(err.fatal);
});

module.exports = connection;
