var request = require('request');

var NerdieInterface = require('nerdie_interface.js');

var nerdie;

var isConnected = false;

function Freenode(parentNerdie) {
	nerdie = parentNerdie;
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
}

Freenode.prototype.init = function () {
	this.pluginInterface.registerPattern(
		'.',
		function (msg) {
			// only do this once
			if (isConnected) {
				return;
			}
			isConnected = true;
			console.log("Identifying with NickServ.");
			if (nerdie.config.plugins.freenode && nerdie.config.plugins.freenode.password) {
				nerdie.bot.say('NickServ', 'id ' + nerdie.config.plugins.freenode.password);
			}
		}
	);
};

module.exports = Freenode;
