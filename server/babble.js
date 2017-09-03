module.exports = {
    messages: [],
    users: [],
    urls: {
        messages: '/messages',
        stats: '/stats',
        signin: '/user',
        logout: '/logout',
        getMessages: '/messages?counter=',
        anonymousImage: 'images/null.png',
        imageUrl: 'https://www.gravatar.com/avatar/'

    },
    messageRequests: {},
    statsRequests: {},
    imageSize: 36,
    routs: ['/stats', '/messages', '/'],
    id: 1,
    messageId: 1,
    userGoneTimeOut: 3000,
    port: 9000,
    getUserCount(){
        return Object.keys(this.messageRequests).length;
    },
    getMessagesCount(){
        return this.messages.length;
    },
    removeClient(id){
        delete this.statsRequests[id];
        delete this.messageRequests[id];        
    },
    removeStatsRes(id){
        delete this.statsRequests[id];
    },
    removeMessageRes(id){
        delete this.messageRequests[id];
    },
    getMessagesByMe(email){
        return this.messages.filter((msg) => {
            return msg.message.email === email;
        }).map((msg) => {
            return msg.id;
        });
    },
};