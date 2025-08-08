

var babble = require('./babble');
var md5 = require('md5');
module.exports = {
    addMessage(message, sender) {
        message.id = parseInt(babble.messageId);
        message.sender = sender;
        if (message.email != undefined && message.email !== "")
            message.image = babble.urls.imageUrl + md5(message.email) + '?s='
                + babble.imageSize + '&d=identicon';
        babble.messages.push(message);
        babble.saveMessages();
        return babble.messageId++;
    },

    getMessages(counter) {


        return babble.messages.slice(counter);

    },

    deleteMessage(id) {
        //delet message with ID=id
        for (var i = 0; i < babble.messages.length; i++) {
            if (babble.messages[i].id === id) {
                console.log('slice', i)
                babble.messages.splice(i, 1);
                babble.saveMessages();
                return;
            }
        }
    },


};
