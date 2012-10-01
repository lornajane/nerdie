var request = require('request');

var NerdieInterface = require('nerdie_interface.js');
var nerdie;

function Thanks(parentNerdie) {
	nerdie = parentNerdie;
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
}
Thanks.prototype.init = function () {
	var nick = nerdie.config.nick.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	this.pluginInterface.registerPattern(
		new RegExp('thanks ' + nick, 'i'),
		this.getThanks
	);
};

Thanks.prototype.getThanks = function(msg) {
	var num = 0;
	var responses = [
		"You're welcome.",
		"No, thank you.",
		"Thank Fergie instead, she deserves it."
	];

	num = Math.floor(Math.random() * responses.length);
	msg.say(msg.user + ": " + responses[num]);
};

module.exports = Thanks;

