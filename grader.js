#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
 	- https://github.com/visionmedia/commander.js
	- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + restler
 	- https://github.com/danwrong/restler
 	- restler.get(url).on('complete', somefunction);

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var commander = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
//var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
//var URL_DEFAULT = "https://github.com/davidgailey/bitstarter, http://hidden-meadow-5769.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists = function(infile) {
    var instr = infile.toString();
    restler.get(infile)
        .on('success', function(data,response){
            return instr;
        })
        .on('fail', function(data,response){
            console.log(response + " \n %s does not exist. Exiting.", instr);
            process.exit(1);
        })
        .on('error', function(err,response){
            console.log(err + " : " + response + " \n %s does not exist. Exiting.", instr);
            process.exit(1);
        });

    /*
        if(!fs.existsSync(instr)) {
            console.log("%s does not exist. Exiting.", instr);
            process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        }
        return instr;
    */
};

var getURL = function(url) {
    var urlstr = url.toString();
    restler.get(urlstr)
        .on('success', function(data,response){
            return data.toString();
        })
        .on('fail', function(data,response){
            console.log(response + " \n %s does not exist. Exiting.", urlstr);
            process.exit(1);
        })
        .on('error', function(err,response){
           console.log(err + " : " + response + " \n %s does not exist. Exiting.", urlstr);
            process.exit(1);
        });
};

var cheerioHtmlFile = function(htmlfile,fileorurl) {
    if(fileorurl == "file")
    return cheerio.load(fs.readFileSync(htmlfile));
    
    if(fileorurl == "url")
    return cheerio.load(getURL(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, fileorurl) {
    $ = cheerioHtmlFile(htmlfile, fileorurl);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    commander
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to html file', clone(assertFileExists))
        .option('-u, --url <url>', 'url to html file', clone(assertURLExists))
        .parse(process.argv);

    if(commander.file) {var checkJson = checkHtmlFile(commander.file, commander.checks, "file");}
    else if(commander.url) {var checkJson = checkHtmlFile(commander.url, commander.checks, "url");}
    else {
        console.log("There is a problem with the file or url. Exiting.");
        process.exit(1);
    }

    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
    fs.writeFile('graderJSON.txt', outJson, function (err) {
		if (err) throw err;
		console.log('It\'s saved!');
	});
} else {
    exports.checkHtmlFile = checkHtmlFile;
}



