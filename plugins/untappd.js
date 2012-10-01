var http = require('http');

var NerdieInterface = require('nerdie_interface.js');

var bot;
var nerdie;
var untappd_key;

function Untappd(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	if (parentNerdie.config.plugins.untappd && parentNerdie.config.plugins.untappd.key) {
		untappd_key = parentNerdie.config.plugins.untappd.key;
	}
	bot = parentNerdie.bot;
	nerdie = parentNerdie;
}

Untappd.prototype.init = function () {
	var plugin = this;


	if (untappd_key) {
		this.pluginInterface.registerPattern(
			this.pluginInterface.anchoredPattern('untappd', true),
			function (msg) {

				var username = msg.match_data[2];
				var options = {
					'host': 'api.untappd.com',
					port: 80,
					path: '/v3/user_feed?key=' + encodeURIComponent(untappd_key) + '&user=' + encodeURIComponent(username)
				};
				var data = "";
				http.get(options, function(res) {
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						try {
							data = JSON.parse(data);
						} catch(e) {
							// ignore
							return;
						}
						if (data && undefined !== data.results && undefined !== data.results[0]) {
							var beer = data.results[0];
							msg.say(beer.user.user_name + ' was last seen drinking a ' + beer.beer_name + ' from ' + beer.brewery_name);
						}
					});
				});
			}
		);
	}

}

module.exports = Untappd;
