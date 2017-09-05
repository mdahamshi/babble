module.exports = {
    messages: [],
    users: 0,
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
    inRelaseMsg: false,
    inRelaseStt: false,
    routs: ['/stats', '/messages', '/'],
    id: 1,
    messageId: 1,
    userGoneTimeOut: 3000,
    port: 9000,
    getUserCount(){
        return this.users;
    },
    getRsponseMap(path){
        if(path == this.urls.messages)
            return this.messageRequests;
        if(path == this.urls.stats)
            return this.statsRequests;
        return undefined;
    },
    getMessagesCount(){
        return this.messages.length;
    },
    formatDate(date= new Date(),sec = true){
        var hours = date.getHours(), minutes = date.getMinutes(),seconds = date.getSeconds();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        if(sec)
            return hours + ":" + minutes + ":" + seconds;
        else
            return hours + ':' + minutes;
    },
    getStatResLength(){
        return Object.keys(this.statsRequests).length;
    },
    getMessagesResLength(){
        return Object.keys(this.messageRequests).length;
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
    getMessagesByMyID(id){
        return this.messages.filter((msg) => {
            return msg.sender === id;
        }).map((msg) => {
            return msg.id;
        });
    },
};