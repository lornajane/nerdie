(function() {
    var NerdieInterface = require('nerdie_interface.js'),
        db,
        myInterface,
        allChannels = false,
        convertLang = true,
        nerdie,
        emptyFn = function() {};

    function Tell(parentNerdie) {
        nerdie = parentNerdie;
        this.pluginInterface = new NerdieInterface(
                parentNerdie,
                this,
                {db: true}
        );
        myInterface = this.pluginInterface;
    }
    Tell.prototype.init = function() {
        this.pluginInterface.registerPattern(
            '.',
            activityHandler
        );
        this.pluginInterface.registerPattern(
            this.pluginInterface.anchoredPattern('tell', true),
            tellHandler
        );
        this.pluginInterface.registerPattern(
            this.pluginInterface.anchoredPattern('ask', true),
            tellHandler
        );
        if (myInterface.nerdie.config.plugins.tell && myInterface.nerdie.config.plugins.tell.allChannels) {
            allChannels = myInterface.nerdie.config.plugins.tell.allChannels;
        }
        if (myInterface.nerdie.config.plugins.tell && myInterface.nerdie.config.plugins.tell.hasOwnProperty('convertLang')) {
            convertLang = myInterface.nerdie.config.plugins.tell.convertLang;
        }
    };
    Tell.prototype.gotDb = function(incomingDb) {
        db = incomingDb;
    };
    var isChannel = function(source) {
        // check source (# or & means it's a channel)
        var first = source.toString().substr(0, 1);
        if ('#' === first || '&' === first) {
            return true;
        }
        return false;
    };
    var tellHandler = function(msg) {
        if (!isChannel(msg.source.toString())) {
            msg.say('You must use reminders within the channel where they will be relayed.');
            return;
        }
        var txt = msg.match_data[2],
            tellNick = txt.substr(0, txt.indexOf(' ')),
            tellMsg = txt.substr(txt.indexOf(' ') + 1),
            tellAction = msg.match_data[0].replace(' ' + msg.match_data[2], '').replace(msg.match_data[1], '');
        if (!tellNick || !tellMsg) {
            // no nick or message supplied
            return;
        }

        if (tellNick.toLowerCase() === nerdie.config.nick.toLowerCase()) {
            msg.say('Sorry, ' + msg.user + ', but I don\'t talk to myself.');
            return;
        }

        if (convertLang) {
            var regex_nick1 = new RegExp(" " + escapeRegExp(tellNick) + "'?s ", 'gi'),
                regex_nick2 = new RegExp(" " + escapeRegExp(tellNick) + " ", 'gi');

            tellMsg = tellMsg
                .replace(/^I\bam\b|\bI'?m\b/i, msg.nick + " is")
                .replace(/\bI\bam\b|\bI'?m\b/gi, 'they\'re')
                .replace(/\bI\b/gi, 'they')
                .replace(/\bI'?ll\b/gi, 'they will')
                .replace(/\byour\b/gi, '[[zxcvbnm]]')
                .replace(/\bthank you\b/gi, '[[zzxcvbnm]]')
                .replace(/\byou\bare\b|\byou'?re\b/gi, 'I am')
                .replace(/\byou\brequire\b/gi, nerdie.config.nick+' requires')
                .replace(/\byou\bneed\b/gi, nerdie.config.nick+' needs')
                .replace(/\byou\bwant\b/gi, nerdie.config.nick+' wants')
                .replace(/\byou\bdo\b/gi, nerdie.config.nick+' does')
                .replace(/\byou\b/gi, nerdie.config.nick)
                .replace(regex_nick1, 'your')
                .replace(regex_nick2, 'you')
                .replace(/\bshe'?s\b|\bhe'?s\b|\bthey'?re\b/gi, 'you are')
                .replace(/\bshe\b|\bhe\b|\bthey\b/gi, 'you')
                .replace(/\btheir\b|\bhis\b|\bher\b/gi, 'your')
                .replace(/\bmy\b/gi, 'their')
                .replace(/\[\[zzxcvbnm]]\b/gi, 'thank you')
                .replace(/\[\[zxcvbnm]]\b/gi, 'my')
            ;
        }

        db.set(
            myInterface.uniqueId(),
            {
                recipient:      tellNick,
                source:         msg.source.toString(),
                msg: {
                    time:       Date.now(),
                    sender:     msg.user,
                    content:    tellMsg,
                    action:     tellAction
                }
            },
            function(err) {
                if (err) {
                    msg.say("Unable to save message: " + err);
                } else {
                    msg.say("Ok, " + msg.user + ". Your " + (tellAction === 'ask' ? 'question':'message') + " for " + tellNick + " has been stored.");
                }
            }
        );
    };
    var escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    var ago = function(ts) {
        var timeDiff = (Date.now() - ts) / 1000,
            days = Math.floor(timeDiff / 86400),
            hours = Math.floor(timeDiff / 3600),
            minutes = Math.floor(timeDiff / 60),
            msg = '';


        if (days > 0) {
            msg += days + ' day' + (days > 1 ? 's' : '');
        }

        if (hours > 0) {
            msg += hours + ' hour' + (hours > 1 ? 's' : '');
        }

        if (minutes > 0) {
            msg += minutes + ' minute' + (minutes > 1 ? 's' : '');
        }

        if (msg.length === 0) {
            msg = 'moments';
        }
        return msg;
    };
    var activityHandler = function(msg) {
        if (!isChannel(msg.source.toString())) {
            return; // early; nothing to see here
        }
        try {
            db.fetch({},
                function(doc, key) {
                    console.log(JSON.stringify(doc));
                    var rightSource = (allChannels || doc.source.toLowerCase() === msg.source.toString().toLowerCase());
                    if (rightSource && doc.recipient.toLowerCase() === msg.user.toLowerCase()) {
                        return true;
                    }
                },
                function(err, results) {
                    if (err) {
                        if ('No Records' !== err.message) {
                            throw err;
                        }
                        return;
                    }
                    results.forEach(function(data) {
                        nerdie.bot.say(data.source.toString(), msg.user + ": " + ago(data.msg.time) + " ago " + data.msg.sender + " wanted me to " + data.msg.action + " you " + data.msg.content);
                        db.remove(data._key, emptyFn);
                    });
                }
            );
        } catch (e) { /* ignore DB errors */}
    };

    module.exports = Tell;

})();