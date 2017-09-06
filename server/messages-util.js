
var babble = require('./babble');
var md5 = require('md5');
module.exports = {
     addMessage(message, sender){
        var bigMessage = {
            message: message, 
            id: parseInt(babble.messageId),
            sender: sender
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
        for(var i = 0; i < babble.messages.length; i++){
            if(babble.messages[i].id === id){
                console.log('slice' ,i)
                babble.messages.splice(i,1);
                return;
            }
        }
    },


};