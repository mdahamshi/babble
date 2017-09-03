var Babble = {
    $: document.querySelector.bind(document) ,
    $$: document.querySelectorAll.bind(document) ,
    messageList: null,
    userInfo: {
        name: "",
        email: ""
    },
    urls: {
        messages: '/messages',
        stats: '/stats',
        signin: '/user',
        logout: '/logout',
        getMessages: '/messages?counter=',
        anonymousImage: 'images/null.png',

    },
    sentMessages: new Array(),
    currentMessage: "",
    counter: 0,
    timeout: 10000,
    apiUrl: 'http://localhost:9000',
    lastSentMessage: null,
    showingInfo: false,
    registered: false,
    alert: {
        success: {color: "#3c763d", back: "#dff0d8"},
        info: {color: "#4673a2", back: "#d9edf7"},
        error: {color: "#ab4442", back: "#f2dede"}
    },

    // **************************** Requiered API*****************************************
    
    register(userInfo, type){
        if(type !== 'anonymous'){
            if(! this.validateRegister(userInfo.name, userInfo.email)){
                this.logData("Wrong email or name");
                this.showInfo("Error !","Wrong Full Name/Email.","error");
                return;
            }
            this.registered = true;

        }

        this.userInfo = userInfo;
        this.signIn(function (data) {
            this.hideModal();
            this.id = data.id;
            if(this.registered)
                this.updateLocalStorage();
            this.getMessages(0);
            this.getStats();
        }.bind(this));
        
        
        this.showInfo("Hello ","Hello and Welcome to Babble "+ this.getName() + " !","success");
    },
    sentByMe(id){
        return this.sentMessages.indexOf(id) !== -1;
    },
    logIn(){

    },
    getMessages(counter = this.counter, callback = this.getMessagesResponse.bind(this)){
        if(counter < 0 ){
            this.logData("Erorr, counter should be >= 0");
            return;
        }
        this.sendRequest({
            method: 'GET',
            path: this.urls.getMessages + counter
        }).then(callback);
    },
    getMessagesResponse(data){
        if(! data)
            return;
        // if(this.counter !== 0 )
        //     this.showInfo('New ! ',"got new "+ 
        // (data.counter - this.counter == 1 ? 'message':(data.counter - this.counter) + ' messages'),
        //     'success' , 1000);
        this.counter = data.counter;
        data.messages.forEach(function (msg) {
            this.appendMessage(msg.message, msg.id);
        }.bind(this));
    },
    postMessage(message, callback = this.postMessageResponse.bind(this)){
        if(message.message.trim() == "")
            return;
        this.sendRequest({
            method: 'POST',
            path: this.urls.messages,
            data: message
        }).then(callback);
    },
    signIn(callback  = this.logData){
        this.sendRequest({
            method: 'POST',
            path: this.urls.signin,
            data: this.userInfo,
        }).then(callback);
    },
    deleteMessage(id, callback  = this.logData){
        this.sendRequest({
            method: 'DELETE',
            path: this.urls.messages + '/' + id,
            data: {name: this.getName(), email: this.userInfo.email},
        }).then(callback);
    },
    sendMessage(){
        if(this.currentMessage == "")
            return;
        this.postMessageWrap()
    },
    resetMessage(){
        document.getElementById('bab-sendMessage-textarea').value = "";
        document.getElementById('bab-sendMessage-span').value = "";
        this.currentMessage = "";
    },
    getStats(callback  = this.getStatsResponse.bind(this)){
        this.sendRequest({
            method: 'GET',
            header:[this.userCount,this.messageCount],
            path: this.urls.stats,
        }).then(callback);
    },
    getStatsResponse(data){
        if(! data)
            return;
        this.userCount = data.users;
        this.messageCount = data.messages;
        this.$('#bab-messageCount').innerHTML = data.messages;
        this.$('#bab-userCount').innerHTML = data.users;
    },
    logData(data){

        console.log(data);
    },
    getName(){
        return this.userInfo.name || "Anonymous";
    },
    postMessageResponse(data){
        if(! data)
            return;
        if(this.registered)
            this.sentMessages.push(data.id);
        this.resetMessage();
        // this.appendMessage(lastSentMessage, data.id);
    },
    getImageUrl(){

        return this.urls.anonymousImage;
    },
    notNumber(val){
        return (isNaN(val) || val < 0 || val ==='');
    },
    
    showInfo(head, text,type = 'info', time=4000){
        if(this.showingInfo)
            return;
        this.showingInfo = true;
        document.getElementById('bab-infobar-head').innerHTML = head + ":";
        document.getElementById('bab-infobar-text').innerHTML = text;
        var bar = document.getElementById('bab-infoBar');
        bar.style.backgroundColor = this.alert[type].back;
        bar.style.color = this.alert[type].color;
        bar.classList.remove('bab-u-hidden');
       

        var show = () => {
            bar.style.padding = '6px';
            bar.style.height = bar.scrollHeight + 12 + 'px';
        };
        var hide = () => {
            bar.style.padding = '0px';
            bar.style.height = 0;
            this.showingInfo = false;
        };
        var classHidden = () => {
            bar.classList.add('bab-u-hidden');
        }
        this.delay(show, 300);
        this.delay(hide, time);
        this.delay(classHidden, time + 1000);
        
    },
    postMessageWrap(callback, text){
        if(this.currentMessage.trim() == "")
            return;
        this.postMessage({
            name: this.getName(),
            email: this.userInfo.email,
            message: this.currentMessage,
            timestamp: Date.now()
        },callback);
    },

    validateRegister(name, email){
        email = email.trim();
        name = name.trim();
        return (/^[a-zA-Z]+\s+[a-zA-Z]+$/.test(name) && /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email));
    },

    showLoading(){

            document.getElementById('bab-loading').classList.remove('bab-u-hidden');
    },
    sendRequest(options){
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest(), data = null;
            if(options.data)
                data = JSON.stringify({data:options.data});
            console.log(options.url || Babble.apiUrl)
            xhr.open(options.method, (options.url || Babble.apiUrl) + options.path,
                                 options.async === undefined ? true : options.async);
            if(options.async !== false)
                xhr.timeout = Babble.timeout;
            xhr.setRequestHeader('Content-type', options.content || 'application/json; charset=utf-8');        
            if(Babble.id)
                xhr.setRequestHeader('sender', Babble.id);
            if(options.path === Babble.urls.stats){
                xhr.setRequestHeader('users', options.header[0]);
                xhr.setRequestHeader('messages', options.header[1]);
            }
            xhr.onerror = function(){
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };            
            xhr.onload = function() {
                if(this.status >=200 && this.status < 300)
                    resolve(options.content ? xhr.response : JSON.parse(xhr.response));
                else
                    reject({
                        status: this.status,
                        statusText: this.statusText
                    });
            };
            xhr.send(data);
            
        }).catch(this.logData);
    },

    init(){

        if (Storage && (localStorage.getItem('babble') === null)){
            this.showModal();
        }
        else {
            this.loadLocalStorage();
            this.signIn(function (data) {          
                this.id = data.id;
                this.sentMessages = data.byMe;
                this.getMessages(0);
                this.getStats();
            }.bind(this));
            this.showInfo("Hello ","Hello again "+ this.getName() + ", enjoy the babbles  !","success");
        }
        this.hideLoading();
        this.makeGrowable(document.querySelector('.js-growable'));
        this.messageList = document.querySelector('#bab-messageList');
        this.initEvents();
    },
    
    loadLocalStorage(){
        this.localStorage = JSON.parse(localStorage.getItem('babble'));
        this.userInfo = this.localStorage.userInfo;
        this.currentMessage = this.localStorage.currentMessage;
        // this.sentMessages = this.localStorage.sentMessages;
        this.registered = true;
    },

    initEvents(){
        document.getElementById("modal-email")
        .addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            document.getElementById("bab-modal-submit").click();
        }
        });
        document.getElementById("modal-name")
        .addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            document.getElementById("bab-modal-submit").click();
        }
        });
        document.getElementById('bab-sendMessage-textarea')
        .addEventListener("keypress", function(event) {
            if (event.keyCode == 13)
                event.preventDefault();
            if (event.keyCode == 13) {
                document.getElementById("bab-sendMessageButton").click();
            }
            });
    },

    unRegister(){
        localStorage.removeItem('babble');
        this.registered = false;
    },
    delay(callback, time = 4000){
        setTimeout(callback.bind(Babble), time);
        
    },
    
    hideLoading(){
        this.$('#bab-loading')
        .classList.add('bab-u-hidden');
    },
    hideModal(){
        document.getElementById('bab-modal-overlay')
        .classList.add('bab-u-hidden');
        document.getElementById('bab-modal')
        .classList.add('bab-u-hidden');
    },
    showModal(){
        document.getElementById('bab-modal-overlay')
        .classList.remove('bab-u-hidden');
        document.getElementById('bab-modal')
        .classList.remove('bab-u-hidden');
    },
    makeGrowable(container) {
        var area = container.querySelector('textarea');
        var clone = container.querySelector('span');
        if(this.localStorage){
            area.textContent = this.localStorage.currentMessage;            
            clone.textContent = area.value;
        }
        area.addEventListener('input', function(e) {
            clone.textContent = area.value;
            this.currentMessage = area.value;
            this.scrollMessageSection();
        }.bind(this));
        
    },
    updateLocalStorage(){
        if(this.registered === false)
            return;
        localStorage.setItem('babble', JSON.stringify({userInfo: this.userInfo,
             currentMessage: this.currentMessage}));
    },

    scrollMessageSection(){
        var messageSection = Babble.$('#bab-messagesSection');
        messageSection.scrollTop = messageSection.scrollHeight;
    },
    formatDate(date){
        var hours = date.getHours(), minutes = date.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes;
    },
    logOut(){
        if(! this.id)
            return;
        this.sendRequest({
            method: 'DELETE',
            path: this.urls.logout +  '/' + this.id,
            async: false
        }).then(this.logData);

        console.log(this.urls);
    },
    appendMessage(message, id){
        //extracting data from message
        var name = message.name || 'Anonymous', email = message.email, 
        text = message.message, 
        time = this.formatDate(new Date(message.timestamp)) ,
        image = this.urls.anonymousImage;
        
        if(message.image)
            image = message.image;

        var toAppend = `
            
            <img src="${image}" alt="" class="bab-Message-img">
            <div class="bab-Message-div">
                <span class="bab-Message-name">
                    ${name}
                </span>
                <span class="bab-Message-time">
                    ${time}
                </span>
                <div class="bab-Tooltip bab-Message-delete bab-u-hidden">
                <img src="images/del.png" alt="delete button">
                    <span class="bab-Tooltiptext">Click to delete</span>
                </div>
                <br>
                <span class="bab-Message-text">
                    ${text}
                </span>
            </div>
        
           `
        
        var li = document.createElement('li');
        
        li.classList.add('bab-Message');
        li.classList.add('bab-u-hidden');
        setTimeout(function(){
            li.classList.remove('bab-u-hidden');
        },300);
 
        li.innerHTML = toAppend;
        this.messageList['message-' + id] = li;
        var div = li.querySelector('.bab-Message-div');
        setTimeout(function(){
            div.style.backgroundColor = 'white';
        },1000);
        this.messageList.appendChild(li);
        this.scrollMessageSection();
    },
    removeMessage(id){


    },

    
};


window.onload = function(){
    Babble.init()
}
window.onresize = function(){
    Babble.scrollMessageSection();
}

document.onclick = function(evt){
    console.log(evt.clientX + ',',evt.clientY);
}

window.onbeforeunload = function(){
    if(Babble.registered)
        Babble.updateLocalStorage();
    Babble.logOut();
    // return msg;
}