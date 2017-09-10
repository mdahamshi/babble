module.exports = {
    messages: [],
    urls: {
        messages: '/messages',
        delMessage: '/messages/:id',
        stats: '/stats',
        signin: '/user',
        logout: '/logout/:id',
        getMessages: '/messages?counter=',
        anonymousImage: 'images/null.png',
        imageUrl: 'https://www.gravatar.com/avatar/'

    },
    messageRequests: [],
    cleaningInterval: 300000,  //5 minute
    statsRequests: [],
    reqId: 1,
    imageSize: 36,
    inRelaseMsg: false,
    inRelaseStt: false,
    routs: ['/stats', '/messages', '/'],
    id: 1,
    messageId: 1,
    userGoneTimeOut: 3000,
    port: 9000,
    getUserCount(){
        return this.getMessagesResLength();
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
        return this.statsRequests.length;
    },
    getMessagesResLength(){
        return this.messageRequests.length;
    },

    //closed request most likely the oldest, so we start from the begining
    removeStatsRes(id){
        for(var i = 0; i < this.statsRequests.length; i++)
            if(this.statsRequests[i] && this.statsRequests[i].req.id === id){
                this.statsRequests[i].end()
                this.statsRequests.splice(i,1);
                console.log('removed closed stats req ',id);
                return;
            }
    },
    removeMessageRes(id){
        for(var i = 0; i < this.messageRequests.length; i++)
            if(this.messageRequests[i] && this.messageRequests[i].req.id === id){
                this.messageRequests.splice(i,1);
                console.log('removed closed msg req ',id);
                return;
            }
    },
    getMessagesByMe(email){
        if(! email || email === "")
            return [];
        return this.messages.filter((msg) => {
            return msg.email === email;
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