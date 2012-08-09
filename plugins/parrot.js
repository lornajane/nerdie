var NerdieInterface = require('nerdie_interface.js');

var currentCount;
var db;

function Parrot(parentNerdie) {
	this.pluginInterface = new NerdieInterface(
		parentNerdie,
		this,
		{db: true}
	);
}
Parrot.prototype.init = function () {
	/* !help: HALP */
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('help'),
		function(msg) {
			msg.say(msg.user + ": One day, I will have a help menu. But today is not that day.");
		}
	);

	this.pluginInterface.registerPattern(
		/^(?:is)?\s+any(?:one|body)\s+(?:here|around|awake)/i,
		function(msg) {
			msg.say(msg.user + ": I'm always here. Waiting. Watching.");
		}
	);

	this.pluginInterface.registerPattern(
		/^(good)?\s?morning?/i,
		function(msg) {
			var num = 0
			, responses = [
				"Top of the morning to you",
                "Good morning!",
                "It's a beautiful morning"
				];

			num = Math.floor(Math.random()*responses.length);
			return msg.say(msg.user + ": " + responses[num]);
		}
	);

	this.pluginInterface.registerPattern(
		/^\:?wq?$/i,
		function(msg) {
			msg.say(msg.user + ": You might want to switch to Emacs, buddy.");
		}
	);
	
	this.pluginInterface.registerPattern(
		/^ls$/,
		function(msg) {
			msg.say(msg.user + ": Haha, wrong screen! :P");
		}
	);
	
	this.pluginInterface.registerPattern(
		/tired+/i,
		function(msg) {
			var num = 0
			, responses = [
				"Me too! I didn't sleep so good last night.",
				"I'm too busy to be tired.",
				"N'awww, hope you sleep well tonight then. :)",
				"Why not take a quick nap now? I'll keep an eye on things for you."
				];

			num = Math.floor(Math.random()*responses.length);
			return msg.say(msg.user + ": " + responses[num]);
		}
	);
	
	this.pluginInterface.registerPattern(
		/exercise+/i,
		function(msg) {
			var num = 0
			, responses = [
				"Maybe we can be workout buddies?",
				"Feel the burn!!!",
				"My muscles still ache from my last workout!"
				];

			num = Math.floor(Math.random()*responses.length);
			return msg.say(msg.user + ": " + responses[num]);
		}
	);

	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('count'),
		countHandler
	);

	var myInterface = this.pluginInterface;
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('uniqueid'),
		function (msg) { msg.say("Unique ID: " + myInterface.uniqueId()); }
	);
};
Parrot.prototype.gotDb = function (incomingDb) {
	db = incomingDb;
	db.get('counter', function (err, data) {
		if (data) {
			currentCount = data.count;
		} else {
			// record does not exist; create empty record
			db.set('counter', {count: 0}, function (err) {
				currentCount = 0;
			});
		}
	});
}
var countHandler = function (msg) {
	db.update('counter', {count: ++currentCount}, function (err) {
		msg.say(msg.user + ": " + currentCount);
	});
};

module.exports = Parrot;

