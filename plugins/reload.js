var NerdieInterface = require('nerdie_interface.js')
  , config = null;

function Reload(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	admins = (parentNerdie.config.admins) ? parentNerdie.config.admins : [];
}

Reload.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('reload', false),
		reloadHandler
	);
};

reloadHandler = function(msg) {
	if (admins.indexOf(msg.user) === -1) {
		msg.msg('You do not have permissions for reloading.');
		return;
	}
	process.exit(0);
};

module.exports = Reload;
