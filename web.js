var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
	var indexContents = fs.readFile('index.html', function (err, data) {
		if (err) throw err;
		console.log(data);
		response.send('data: ' + data);
	});
	
});

var port = process.env.PORT || 5000;
//var url = 'http://localhost:' + port + '/';
app.listen(port, function() {
	console.log("Listening on " + port);
});