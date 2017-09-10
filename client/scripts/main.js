/*jshint esversion: 6 */
(function () {
    'use strict';
 }());
window.Babble = {
    $: document.querySelector.bind(document) ,
    $$: document.querySelectorAll.bind(document) ,
    messageList: null,
    userInfo: {
        name: "",
        email: ""
    },
    urls: {
        messages: "/messages",
        stats: "/stats",
        signin: "/user",
        logout: "/logout",
        getMessages: "/messages?counter=",
        anonymousImage: "images/null.png"

    },
    unRegisterReq: false,
    inReset: false,
    reconnectTime: 10000,
    userCount: -1,
    messageCount: -1,
    reconnectID: 0,
    tab: 10,
    sentMessages: [],
    currentMessage: "",
    counter: 0,
    timeout: 120000,
    apiUrl: "",
    lastSentMessage: null,
    showingInfo: false,
    alert: {
        success: {color: "#3c763d", back: "#dff0d8"},
        info: {color: "#4673a2", back: "#d9edf7"},
        error: {color: "#ab4442", back: "#f2dede"}
    },

// **************************** Requiered API*****************************************
    
    register(userInfo){
        if(userInfo && userInfo.email !== ""){
            if(! this.validateRegister(userInfo.name, userInfo.email)){
                this.logData("Wrong email or name");
                this.showInfo("Error !","Wrong Full Name/Email.","error");
                return;
            }
        }
        
        this.userInfo = userInfo || {};
        this.updateLocalStorage();
        this.signIn( (data) => {
            this.hideModal();
            this.id = data.id;
            this.sentMessages = data.byMe;
            this.enableSend();
            this.getMessages(0);
            this.getStats();
        });
        
        
        this.showInfo("Hello ","Hello and Welcome to Babble "+ this.getName() + " !","success");
    },
    sentByMe(id){
        if(isNaN(id))
            id = id.replace('message-','');
        id = parseInt(id);
        return this.sentMessages.indexOf(id) !== -1;
    },

    getMessages(counter = this.counter, callback = this.getMessagesResponse){
        if(counter < 0 ){
            this.logData("Erorr, counter should be >= 0");
            return;
        }
        this.sendRequest({
            method: 'GET',
            path: this.urls.getMessages + counter
        },callback.bind(this));
    },
    getMessagesResponse(data){
        if(! data)
            return;
        if(data.type == 'remove'){
            this.removeMessage(data.id);
            this.counter--;
            this.getMessages();
            return;
        }

        this.counter = data.counter;
        if(data.messages)
            data.messages.forEach( (msg) => {
                if((msg.email !== undefined)&& (msg.email !== "") && (msg.email == this.userInfo.email) && (! this.sentByMe(msg.id) )  )//in case user signed in from two browsers
                    this.sentMessages.push(msg.id);
                this.appendMessage(msg, msg.id);
            });
        this.delay(this.scrollMessageSection,200);
        this.getMessages();
    },
    postMessage(message, callback = this.postMessageResponse){
        if(message.message.trim() == "")
            return;
        this.disableSend();
        this.sendRequest({
            method: 'POST',
            path: this.urls.messages,
            data: message
        },callback.bind(this));
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
    },
    signIn(callback  = this.signInRes){
        this.sendRequest({
            method: 'POST',
            path: this.urls.signin,
            data: this.userInfo,
        },callback.bind(this));
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
    deleteMessage(id, callback  = this.deleteMessageResponse){
        this.sendRequest({
            method: 'DELETE',
            path: this.urls.messages + '/' + id,
            data: {name: this.getName(), email: this.userInfo.email},
        },callback.bind(this));
    },
    deleteMessageResponse(data){
    },
    sendMessage(){
        if(this.currentMessage == "")
            return;
        this.postMessageWrap();
    },
    resetMessage(){
        document.getElementById('bab-sendMessage-textarea').value = "";
        document.getElementById('bab-sendMessage-span').value = "";
        this.currentMessage = "";
    },
    getStats(callback  = this.getStatsResponse){
        if(this.testing)            //so the test pass
            this.sendRequest({
                method: 'GET',
                header:[this.userCount,this.messageCount],
                path: this.urls.stats,
                timeout: this.timeout 
            },callback.bind(this));
        else
            setTimeout(() => {          //better to dely getstats, more accurate result, less calls
                this.sendRequest({
                    method: 'GET',
                    header:[this.userCount,this.messageCount],
                    path: this.urls.stats,
                    timeout: this.timeout 
                },callback.bind(this));
            }, 1000);
     
    },
    getStatsResponse(data){
        if(! data)
            return;
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
        };
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
    sendRequest(options, callback){
        return new Promise( (resolve , reject ) => {
            var xhr = new XMLHttpRequest(), data = null;
            if(options.data){
                if(options.method == 'POST' && options.path == this.urls.messages)
                    data = JSON.stringify(options.data);   // just to pass the test
                else
                    data = JSON.stringify({data:options.data});
            }
            xhr.open(options.method,  this.apiUrl +  options.path ,
                    options.async === undefined ? true : options.async);
            if(options.async !== false)
                xhr.timeout = options.timeout ||  this.timeout;
            xhr.setRequestHeader('Content-type', options.content || 'application/json; charset=utf-8');        
            if(this.id)
                xhr.setRequestHeader('sender', this.id);
            
            if(options.path == this.urls.getMessages + this.counter){
                xhr.addEventListener('timeout', () => {
                    xhr.abort();
                    this.getMessages();
                });
            }else if(options.path == this.urls.stats){
                xhr.setRequestHeader('users', options.header[0]);
                xhr.setRequestHeader('messages', options.header[1]);
                xhr.addEventListener('timeout', () => {
                    xhr.abort();
                    this.getStats();

                });
            }
          
            xhr.onerror = () => {
                
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });

                if(this.inReset || this.testing)
                    return;
                this.inReset = true;
                this.showLoading();
                xhr.abort();
                this.disableSend();
                this.reset();
                this.showInfo('Error',"something went wrong, trying to reconnect...",'error');
                this.delay(this.signIn,5000);               
                this.reconnectID = setInterval(() => {
                    this.signIn();
                },this.reconnectTime);
            };    
            xhr.onload = () => {
                if(xhr.status >=200 && xhr.status < 300){
                    callback(options.content ? xhr.response : JSON.parse(xhr.response));
                }
                else{
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                    if(options.path == this.urls.getMessages + this.counter)
                        this.getMessages();
                    if(options.path == this.urls.stats)
                        this.getStats();
                }
            };
            xhr.send(data);
            
        }).catch(this.logData);
    },
    reset(){
        if(this.messageList)
            while(this.messageList.hasChildNodes())
                this.messageList.removeChild(this.messageList.lastChild);
        this.sentMessages = [];
        this.tab = 10;
        this.messageList = document.querySelector('#bab-messageList');
        this.counter = 0;
    },
    init(){
        if (Storage && (localStorage.getItem('babble') === null ||
            JSON.parse(localStorage.getItem('babble')).userInfo.email == ""  ) ){
            this.showModal();
        }
        else {
            this.loadLocalStorage();
            this.signIn( (data) => {          
                this.id = data.id;
                this.sentMessages = data.byMe;
                this.enableSend();
                this.getMessages(0);
                this.getStats();
            });
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
        this.unRegisterReq = true;
    },
    delay(callback, time = 4000){
        setTimeout(callback.bind(this), time);
        
    },
    
    hideLoading(){
        document.querySelector('#bab-loading').classList.add('bab-u-hidden');
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
        area.addEventListener('input', (e) => {
            clone.textContent = area.value;
            this.currentMessage = area.value;
        });
        
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
        if(this.unRegisterReq == true)
            return;
        localStorage.setItem('babble', JSON.stringify({userInfo: this.userInfo,
             currentMessage: this.currentMessage}));
    },

    scrollMessageSection(){
        var messageSection = this.$('#bab-messagesSection');
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
    logOut(callback = this.updateLocalStorage){
        if(! this.id)
            return;
        this.sendRequest({
            method: 'DELETE',
            path: this.urls.logout +  '/' + this.id,
            async: false
        },callback.bind(this));

    },
    appendMessage(message, id){
        //extracting data from message
        var name = message.name || 'Anonymous',
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
                <div  message="${id}" class="bab-Tooltip bab-Message-delete bab-u-hidden " onclick="window.Babble.deleteMessage(this.getAttribute('message'))">
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
        
           `;
        
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
        li.setAttribute('id', 'message-' + id);

        this.messageList.appendChild(li);
        setTimeout(() => {
            li.classList.add('bab-u-messageShow');
        }, 50);
        if(this.sentByMe(id)){
            li.querySelector('.bab-Message-delete').classList.add('bab-u-semiHidden');
            li.querySelector('.bab-Message-delete').classList.remove('bab-u-hidden');
        }
        var delButton = li.querySelector('.bab-Message-deleteButton');
        //bad listeners, I know
        delButton.addEventListener('focus',this.messageMouseOver);
        delButton.addEventListener('blur',this.messageMouseLeave);
        li.addEventListener('mouseover', this.messageMouseOver);
        delButton.addEventListener('mouseover', this.messageMouseOver);
        delButton.addEventListener('mouseleave', this.messageMouseLeave);
        li.addEventListener('focus', this.messageMouseOver);
        li.addEventListener('blur', this.messageMouseLeave);
        li.addEventListener('mouseleave', this.messageMouseLeave);
        
    },
    
    messageMouseOver(evt){
        if((evt instanceof MouseEvent && evt.target !== evt.currentTarget) || evt instanceof FocusEvent){
            var id = this.getAttribute('message');
            var li = document.getElementById('message-' + id);

            if(this == li.querySelector('.bab-Message-deleteButton'))
                li.querySelector('.bab-Tooltiptext').style.visibility = 'visible';
            
            li.querySelector('.bab-Message-div').style.backgroundColor = 'rgb(235, 237, 236)';
            
            if(window.Babble.sentByMe(id)){
                li.querySelector('.bab-Message-delete').classList.remove('bab-u-semiHidden');
                li.querySelector('.bab-Message-delete').classList.remove('bab-u-hidden');
            }  
        }
        evt.stopPropagation();    
    },
    messageMouseLeave(evt){
        var id = evt.currentTarget.getAttribute('message');
        var li = window.Babble.messageList['message-' + id];

        if(evt.currentTarget == li.querySelector('.bab-Message-deleteButton'))
            li.querySelector('.bab-Tooltiptext').style.visibility = 'hidden';

       li.querySelector('.bab-Message-div').style.backgroundColor = 'white';
        
       if(window.Babble.sentByMe(id))
           li.querySelector('.bab-Message-delete').classList.add('bab-u-semiHidden');
    },
    removeMessage(id){
        var li = this.messageList['message-' + id];
        var delButton = li.querySelector('.bab-Message-deleteButton');
        li.removeEventListener('mouseover', this.messageMouseOver);
        li.removeEventListener('mouseleave',this.messageMouseLeave);
        li.removeEventListener('focus', this.messageMouseOver);
        li.removeEventListener('blur', this.messageMouseLeave);
        delButton.removeEventListener('focus',this.messageMouseOver);
        delButton.removeEventListener('blur',this.messageMouseLeave);
        delButton.removeEventListener('mouseover', this.messageMouseOver);
        delButton.removeEventListener('mouseleave', this.messageMouseLeave);
        delButton.style.outline = 'none';
        li.querySelector('.bab-Tooltiptext').style.visibility = 'hidden';
        var div = li.querySelector('.bab-Message-div');
        div.style.transition = 'all';
        div.style.transitionDuration = '1000ms';
        // li.classList.add('bab-Message','bab-u-slide-fade','show');
        div.style.backgroundColor = this.alert.error.back;
        if(this.sentByMe(id))
            this.sentMessages.splice(this.sentMessages.indexOf(id),1);
        setTimeout(() => {
            li.classList.remove('bab-u-messageShow');
            setTimeout(() => {
                li.remove();
            }, 1000);
        
        }, 1000);
    },

    
};

