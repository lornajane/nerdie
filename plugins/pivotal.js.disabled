var https = require('https')
  , querystring = require('querystring')
  , xml2js = require('xml2js');

var NerdieInterface = require('nerdie_interface.js');

var tracker_token;
var bot;
var nerdie;
var enabled = true;

function Pivotal(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	if (!parentNerdie.config.plugins.pivotal) {
		enabled = false;
		return;
	}
	if (parentNerdie.config.plugins.pivotal.auth) {
		tracker_token = parentNerdie.config.plugins.pivotal.auth.token;
	}
	bot = parentNerdie.bot;
	nerdie = parentNerdie;
}

Pivotal.prototype.init = function () {
	var plugin = this;
	if (!enabled) {
		return;
	}
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('pivotal', true),
		function (msg) {
			var story_id = msg.match_data[2];
			if (story_id.match(/^[0-9]+$/)) {
				plugin.getStory(story_id, true, msg.say);
			}
		}
	);

	// URLs
	// 1) https://www.pivotaltracker.com/story/show/13911383
	this.pluginInterface.registerPattern(
		/https?:\/\/www\.pivotaltracker\.com\/story\/show\/(\d+)/,
		function (msg) {
			var num = msg.match_data[1];
			plugin.getStory(num, false, msg.say);
		}
	);
}

Pivotal.prototype.getStory = function (story_id, include_url, callback) {
	var plugin = this;
	var options = {
		'host': 'www.pivotaltracker.com',
		path: '/services/v4/stories/' + story_id,
		headers: {'x-trackertoken': tracker_token}
	};
	var data = "";
	var req = https.request(options, function(res) {
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			var story;
			if (res.statusCode === 200) {
				var parser = new xml2js.Parser();
				parser.addListener('end', function(story) {
					plugin.formatStory(story, include_url, callback);
				});
				try {
					parser.parseString(data);
				} catch(e) {
					callback("Unparseable story XML");
					console.log(e);
				}
			} else {
				callback('Got status ' + res.statusCode + ' from pivotal API');
			}
		});
	});
	req.on('error', function(e) {
		callback('HTTP error retrieving story ' + story_id);
	});
	req.end();
};

Pivotal.prototype.getProject = function (project_id, callback) {
	var plugin = this;
	var options = {
		'host': 'www.pivotaltracker.com',
		path: '/services/v4/projects/' + project_id,
		headers: {'x-trackertoken': tracker_token}
	};
	var data = "";
	var req = https.request(options, function(res) {
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			var project;
			if (res.statusCode === 200) {
				var parser = new xml2js.Parser();
				parser.addListener('end', function(project) {
					callback(project);
				});
				try {
					parser.parseString(data);
				} catch(e) {
					callback(false);
					console.log(e);
				}
			} else {
				callback('Got status ' + res.statusCode + ' from pivotal API');
			}
		});
	});
	req.on('error', function(e) {
		callback('HTTP error retrieving project ' + project_id);
	});
	req.end();
};

Pivotal.prototype.formatStory = function (story, include_url, callback) {
	var plugin = this;
	var name = story.name
	var story_type = story.story_type;
	var state = story.current_state;
	var estimate = story.estimate ? story.estimate['#'] : false;
	var description = story.description;
	var owner = story.owned_by;
	var trailer = [story_type, state];
	
	if (estimate && estimate !== '-1') {
		trailer.push(estimate + ' points');
	}
	if (owner && owner.person) {
		trailer.push('owned by ' + owner.person.name);
	}

	plugin.getProject(story.project_id['#'], function (project) {
		if (!project) {
			project = {name: '(unknown)'};
		}
		var out = '[' + project.name + '] ' + name + ' -- ' + trailer.join(', ');
		callback(out);
		if (typeof description === 'string' && description !== '') {
			callback(description);
		}
		if (include_url) {
			callback(story.url);
		}
	});
};

module.exports = Pivotal;
