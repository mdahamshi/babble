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
    inReset: false,
    reconnectTime: 10000,
    reconnectID: 0,
    tab: 10,
    sentMessages: new Array(),
    currentMessage: "",
    counter: 0,
    timeout: 25000,
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
            this.sentMessages = data.byMe;
            if(this.registered)
                this.updateLocalStorage();
            this.enableSend();
            this.getMessages(0);
            this.getStats();
        }.bind(this));
        
        
        this.showInfo("Hello ","Hello and Welcome to Babble "+ this.getName() + " !","success");
    },
    sentByMe(id){
        if(isNaN(id))
            id = id.replace('message-','');
        id = parseInt(id);
        return this.sentMessages.indexOf(id) !== -1;
    },
    logIn(){

    },
    getMessages(counter = this.counter, callback = this.getMessagesResponse.bind(this)){
        if(counter < 0 ){
            this.logData("Erorr, counter should be >= 0");
            return;
        }
        console.log(this.formatDate(),'getting messages');
        this.sendRequest({
            method: 'GET',
            path: this.urls.getMessages + counter
        }).then(callback);
    },
    getMessagesResponse(data){
        if(! data)
            return;
        console.log(this.formatDate(),'response messages',data);        
        if(data.type == 'remove'){
            this.removeMessage(data.id);
            this.counter--;
            this.getMessages();
            return;
        }
        // if(this.counter !== 0 )
        //     this.showInfo('New ! ',"got new "+ 
        // (data.counter - this.counter == 1 ? 'message':(data.counter - this.counter) + ' messages'),
        //     'success' , 1000);
        this.counter = data.counter;
        data.messages.forEach(function (msg) {
            console.log(msg,(msg.message.email !== "") && (msg.message.email == this.email) );
            if((msg.message.email !== "") && (msg.message.email == this.userInfo.email) && (! this.sentByMe(msg.id) )  )//in case user signed in from two browsers
                this.sentMessages.push(msg.id);
            this.appendMessage(msg.message, msg.id);
        }.bind(this));
        this.delay(this.scrollMessageSection,1000);
        this.getMessages();
    },
    postMessage(message, callback = this.postMessageResponse.bind(this)){
        if(message.message.trim() == "")
            return;
        this.disableSend();
        console.log(this.formatDate(),'post message');        
        this.sendRequest({
            method: 'POST',
            path: this.urls.messages,
            data: message
        }).then(callback);
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
    postMessageResponse(data){
        if(! data)
            return;
        
        this.sentMessages.push(parseInt(data.id));
        this.resetMessage();
        this.enableSend();
        // this.appendMessage(lastSentMessage, data.id);
    },
    signIn(callback  = this.signInRes.bind(this)){
        console.log(this.formatDate(),'sign in ');    
        this.sendRequest({
            method: 'POST',
            path: this.urls.signin,
            data: this.userInfo,
        }).then(callback);
    },
    signInRes(data){
        if(! data)
            return;
        clearInterval(this.reconnectID);
        this.enableSend();
        this.hideLoading();
        this.id = data.id;
        this.sentMessages = data.byMe;
        this.showInfo('Success','Connection returned.','info');
        this.inReset = false;
        this.getMessages(0);
        this.getStats();
    },
    deleteMessage(id, callback  = this.deleteMessageResponse.bind(this)){
        this.sendRequest({
            method: 'DELETE',
            path: this.urls.messages + '/' + id,
            data: {name: this.getName(), email: this.userInfo.email},
        }).then(callback);
    },
    deleteMessageResponse(data){
        // this.messageCount--;
        // this.removeMessage(data.id);
        console.log(data);
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
        console.log(this.formatDate(),'getting stats');
        
        this.sendRequest({
            method: 'GET',
            header:[this.userCount,this.messageCount],
            path: this.urls.stats,
            timeout: this.timeout + 3000,  //delay from getmessage, so this user be counted
        }).then(callback);
    },
    getStatsResponse(data){
        if(! data)
            return;
        console.log(this.formatDate(),'response stats',data);        
        // if(this.messageCount > data.messages)
        //     this.showInfo('Update','Some messages have been deleted, refresh the page if you want deleted messages disappered.','info',6000);
        this.userCount = data.users;
        this.messageCount = data.messages;
        this.$('#bab-messageCount').innerHTML = data.messages;
        this.$('#bab-userCount').innerHTML = data.users;
        this.getStats();
    },
    logData(data){

        console.log(data);
    },
    getName(){
        return this.userInfo.name || "Anonymous";
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
        this.delay(show, 500);
        this.delay(hide, time);
        this.delay(classHidden, time + 1000);
        
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
            xhr.open(options.method,  options.path,
                                 options.async === undefined ? true : options.async);
            if(options.async !== false)
                xhr.timeout = options.timeout ||  Babble.timeout;
            xhr.setRequestHeader('Content-type', options.content || 'application/json; charset=utf-8');        
            if(Babble.id)
                xhr.setRequestHeader('sender', Babble.id);
            
            if(options.path == Babble.urls.getMessages + Babble.counter){
                console.log('in message rout')
                xhr.addEventListener('timeout', function(){
                    console.log('getmessage timeout')
                    xhr.abort();
                    Babble.getMessages();
                });
            }else if(options.path == Babble.urls.stats){
                xhr.setRequestHeader('users', options.header[0]);
                xhr.setRequestHeader('messages', options.header[1]);
                xhr.addEventListener('timeout', function(){
                    console.log('getstats timeout');
                    xhr.abort();
                    Babble.getStats();

                });
            }
          
            xhr.onerror = function(){
                
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
                // if(options.path == Babble.urls.getMessages + Babble.counter)
                //     Babble.getMessages();
                // if(options.path == Babble.urls.stats)
                //     Babble.getStats()
                if(Babble.inReset)
                    return;
                Babble.inReset = true;
                Babble.showLoading();
                xhr.abort();
                Babble.disableSend();
                Babble.reset();
                Babble.showInfo('Error',"something went wrong, trying to reconnect...",'error');
                Babble.delay(Babble.signIn,5000);               
                Babble.reconnectID = setInterval(function(){
                    Babble.signIn();
                },Babble.reconnectTime);
            };    
            xhr.onload = function() {
                if(this.status >=200 && this.status < 300)
                    resolve(options.content ? xhr.response : JSON.parse(xhr.response));
                else{
                    reject({
                        status: this.status,
                        statusText: this.statusText
                    });
                    if(options.path == Babble.urls.getMessages + Babble.counter)
                        Babble.getMessages();
                    if(options.path == Babble.urls.stats)
                        Babble.getStats()
                }
            };
            xhr.send(data);
            
        }).catch(this.logData);
    },
    reset(){
        while(this.messageList.hasChildNodes())
            this.messageList.removeChild(this.messageList.lastChild);
        this.sentMessages = new Array();
        this.tab = 10;
        this.messageList = document.querySelector('#bab-messageList');
        this.counter = 0;
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
                this.enableSend();
                this.getMessages(0);
                this.getStats();
            }.bind(this));
            this.showInfo("Hello ","Welcome back "+ this.getName() + ", enjoy the babbles  !","success");
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
    disableSend(){
        document.getElementById('bab-sendMessageButton').setAttribute('disabled', 'true');
        document.querySelector('.bab-SendMessage-form-button-img').style.opacity = 0.4;
    },
    enableSend(){
        document.getElementById('bab-sendMessageButton').removeAttribute('disabled');
        document.querySelector('.bab-SendMessage-form-button-img').style.opacity = 1;
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
    formatDate(date = new Date(), sec = true){
        var hours = date.getHours(), minutes = date.getMinutes(),seconds = date.getSeconds();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        if(sec)
            return hours + ":" + minutes + ":" + seconds;
        else
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
        time = this.formatDate(new Date(message.timestamp), false) ,
        image = this.urls.anonymousImage, msgTab = this.tab++, delTab = this.tab++;
        
        if(message.image)
            image = message.image;

        var toAppend = `
            
            <img src="${image}" message="${id}" alt="" class="bab-Message-img " onerror="this.src='images/offline.png';">
            <div class="bab-Message-div " message="${id}">
                <span class="bab-Message-name " message="${id}">
                    ${name}
                </span>
                <span message="${id}" class="bab-Message-time ">
                    ${time}
                </span>
                <div  message="${id}" class="bab-Tooltip bab-Message-delete bab-u-hidden " onclick="Babble.deleteMessage(this.getAttribute('message'))">
                <button message="${id}" aria-label="delete button" class="bab-Message-deleteButton" tabindex="${delTab}">
                <img message="${id}" src="images/del.png" alt="delete button" >
                </button>
                    <span message="${id}" class="bab-Tooltiptext ">Click to delete</span>
                </div>
                <br>
                <span class="bab-Message-text " message="${id}">
                    ${text}
                </span>
            </div>
        
           `
        
        var li = document.createElement('li');
        li.setAttribute('message', id);
        li.setAttribute('tabindex', msgTab);
        li.classList.add('bab-Message','bab-u-slide-fade');

        
        li.innerHTML = toAppend;
        this.messageList['message-' + id] = li;
        var div = li.querySelector('.bab-Message-div');
        setTimeout(function(){
            div.style.backgroundColor = 'white';
        
        },1000);
        setTimeout(function(){
            div.style.transition = 'none';
        
        },2000);
        div.setAttribute('id', 'message-' + id);

        this.messageList.appendChild(li);
        setTimeout(function() {
            li.classList.add('bab-u-messageShow');
            Babble.scrollMessageSection();
        }, 50);
        if(this.sentByMe(id)){
            li.querySelector('.bab-Message-delete').classList.add('bab-u-semiHidden');
            li.querySelector('.bab-Message-delete').classList.remove('bab-u-hidden');
        }
        var delButton = li.querySelector('.bab-Message-deleteButton');
        delButton.addEventListener('focus',this.messageMouseOver);
        delButton.addEventListener('blur',this.messageMouseLeave);
        li.addEventListener('mouseover', this.messageMouseOver);
        li.addEventListener('focus', this.messageMouseOver);
        li.addEventListener('blur', this.messageMouseLeave);
        li.addEventListener('mouseleave', this.messageMouseLeave);
        
    },
    
    messageMouseOver(evt){
        if((evt instanceof MouseEvent && evt.target !== evt.currentTarget) || evt instanceof FocusEvent){
            var id = this.getAttribute('message');
            var li = Babble.messageList['message-' + id];
            li.querySelector('.bab-Message-div').style.backgroundColor = 'rgb(235, 237, 236)';
            if(Babble.sentByMe(id)){
                li.querySelector('.bab-Message-delete').classList.remove('bab-u-semiHidden');
                li.querySelector('.bab-Message-delete').classList.remove('bab-u-hidden');
            }  
        }
        evt.stopPropagation();    
    },
    messageMouseLeave(evt){
        var id = evt.currentTarget.getAttribute('message');
        var li = Babble.messageList['message-' + id];
       li.querySelector('.bab-Message-div').style.backgroundColor = 'white';
        if(Babble.sentByMe(id))
           li.querySelector('.bab-Message-delete').classList.add('bab-u-semiHidden');
    },
    removeMessage(id){
        var li = this.messageList['message-' + id];
        li.removeEventListener('mouseover', this.messageMouseOver);
        li.removeEventListener('mouseleave',this.messageMouseLeave);
        var div = li.querySelector('.bab-Message-div');
        div.style.transition = 'all';
        div.style.transitionDuration = '1000ms';
        // li.classList.add('bab-Message','bab-u-slide-fade','show');
        div.style.backgroundColor = this.alert['error'].back;
        if(this.sentByMe(id))
            this.sentMessages.splice(this.sentMessages.indexOf(id),1);
        setTimeout(function() {
            li.classList.remove('bab-u-messageShow');
            setTimeout(function() {
                li.remove();
            }, 600);
            // this.messageList['message-' + id].remove();
        
        }.bind(this), 1000);
    },

    
};


window.onload = function(){
    Babble.init();

};
window.onblur = function(){
    if(Babble.registered)
        Babble.updateLocalStorage();

};
window.onresize = function(){
    Babble.scrollMessageSection();
};

document.onclick = function(evt){
    console.log(evt.clientX + ',',evt.clientY);
};

window.onbeforeunload = function(){
    if(Babble.registered)
        Babble.updateLocalStorage();
    Babble.logOut();
    // return msg;
};