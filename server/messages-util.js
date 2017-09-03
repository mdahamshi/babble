
var babble = require('./babble');
var md5 = require('md5');
module.exports = {
     addMessage(message){
        var bigMessage = {
            message: message, 
            id: babble.messageId
        }
        if(message.email != "")
            bigMessage.message.image = babble.urls.imageUrl + md5(message.email) + '?s=' 
        + babble.imageSize + '&d=identicon';
        babble.messages.push(bigMessage);
        return babble.messageId++;
    },
    
    getMessages(counter){

        return requiredMessages;
    },

    deleteMessage(id){
        //delet message with ID=id
    },


};