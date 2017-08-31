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
        anonymousImage: 'images/null.png',

    },
    sentMessages: new Array(),
    currentMessage: "",
    counter: 0,
    apiUrl: 'http://localhost:9000',
    lastSentMessage: null,
    showingInfo: false,
    alert: {
        success: {color: "#3c763d", back: "#dff0d8"},
        info: {color: "#4673a2", back: "#d9edf7"},
        error: {color: "#ab4442", back: "#f2dede"}
    },

    // **************************** Requiered API*****************************************
    
    register(userInfo){
        this.userInfo = userInfo;
        var data = {currentMessage: "",userInfo: userInfo};
        if (Storage && (localStorage.getItem('babble') === null )){
            this.updateLocalStorage(userInfo.name, userInfo.email, "");
        }
        this.resetMessage();
        this.showInfo("Hello ","Hello and Welcome to Babble "+ this.getName() + " !","success");

    },
    sentByMe(id){
        return this.sentMessages.indexOf(id) !== -1;
    },
    getMessages(counter, callback){
        if(counter < 0 ){
            this.logData("Erorr, counter should be >= 0");
            return;
        }
        this.sendRequest({
            method: 'GET',
            path: this.urls.messages+'?counter=' + counter
        }).then(callback);
    },
    
    postMessage(message, callback = this.postMessageResponse.bind(this)){
        lastSentMessage = message;
        if(message.message == "")
            return;
        this.sendRequest({
            method: 'POST',
            path: this.urls.messages,
            data: message
        }).then(callback);
    },
    
    deleteMessage(id, callback){
        this.sendRequest({
            method: 'DELETE',
            path: this.urls.messages + '/' + id,
            data: {name: this.getName(), email: this.userInfo.email},
        }).then(callback);
    },
    sendMessage(){
        this.logData("sent")
    },
    resetMessage(){
        document.getElementById('bab-sendMessage-textarea').textContent = "";
        document.getElementById('bab-sendMessage-span').textContent = "";
        this.currentMessage = "";
        this.updateLocalStorage();
    },
    getStats(callback){
        this.sendRequest({
            method: 'GET',
            path: this.urls.stats,
        }).then(callback);
    },
    logData(data){
        console.log(data);
    },
    getName(){
        return this.userInfo.name || "Anonymous";
    },
    postMessageResponse(data){
        this.sentMessages.push(data.id);
        this.appendMessage(lastSentMessage, data.id);
    },
    getImageUrl(){

        return this.urls.anonymousImage;
    },
    notNumber(val){
        return (isNaN(val) || val < 0 || val ==='');
    },
    animate(elem, type){
        var padding =  window.getComputedStyle(elem)['padding'].replace('px',''), height = window.getComputedStyle(elem)['height'].replace('px','');
        if(this.notNumber(height) || this.notNumber(padding)){
            elem.classList.remove('bab-u-hidden');
            this.logData('cannot animate: ',elem);
            return; 
        }
        if(elem.style.height === "" || elem.style.height == 'auto'){
            elem.style.height = height + 'px';
            elem.style.padding = padding + 'px';
          
        }
        var tempPadding, tempHeight, frame;
        if(type == 'hide'){
            tempPadding = padding;
            tempHeight = height;
            frame = function() {
                if (tempHeight <= 0) {
                    clearInterval(id);
                    elem.classList.add('bab-u-hidden');
                    elem.style.height = height + 'px';
                    elem.style.padding = padding + 'px';
                    this.showingInfo = false;
                } else {
                    elem.style.height = --tempHeight + 'px';
                    if(tempPadding > 0)
                        elem.style.padding = --tempPadding + 'px';
                    
                }
            }
        }
        else {
            elem.style.padding = elem.style.height  = tempHeight = 0;
            tempPadding = 0;
            elem.classList.remove('bab-u-hidden');
            frame = function() {
                if (tempHeight >= height) {
                    clearInterval(id);
                } else {
                    elem.style.height = ++tempHeight + 'px';
                    if(tempPadding != padding)
                        elem.style.padding = ++tempPadding + 'px';
                    
                }
            }
        }
        var id = setInterval(frame.bind(this), 5);
    
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

        this.animate(bar, 'show');
        var hide = function(){return this.animate(bar, 'hide')};
        if(time < 1000)
            time = 1000; //don't allow hide show at same time;
        this.delay(hide, time);
        
    },
    postMessageWrap(text, callback){
        this.postMessage({
            name: this.getName(),
            email: this.userInfo.email,
            message: this.currentMessage,
            timestamp: new Date().getTime()
        },callback);
    },
    formToRegister(){
        var email = document.getElementById('modal-email').value,
            name = document.getElementById('modal-name').value;
        if(! this.validateRegister(name, email)){
            this.logData("Wrong email or name");
            return;
        }
            
        this.hideModal();
        this.register({name: name, email: email});
    },
    validateRegister(name, email){
        email = email.trim();
        name = name.trim();
        return (/^[a-zA-Z]+\s+[a-zA-Z]+$/.test(name) && /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email));
    },

    sendRequest(options){
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest(), data = null;
            if(options.data)
                data = JSON.stringify({data:options.data});
            console.log(options.url || Babble.apiUrl)
            xhr.open(options.method, (options.url || Babble.apiUrl) + options.path, true);
            xhr.timeout = 60000;
            xhr.setRequestHeader('Content-type', options.content || 'application/json; charset=utf-8');        
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
            var modal = this.$('#bab-modal'),
            overlay = this.$('#bab-modal-overlay');
            modal.classList.remove('bab-u-hidden');
            
        }
        else if (Storage && JSON.parse(localStorage.getItem('babble')).userInfo.name === ""){
            this.localStorage = JSON.parse(localStorage.getItem('babble'));
            this.currentMessage = this.localStorage.currentMessage;
            var modal = this.$('#bab-modal'),
            overlay = this.$('#bab-modal-overlay');
            modal.classList.remove('bab-u-hidden');
        }
        else {
            this.localStorage = JSON.parse(localStorage.getItem('babble'));
            this.userInfo = this.localStorage.userInfo;
            this.currentMessage = localStorage.currentMessage;
            this.hideModal();
        }
        this.hideLoading();
        this.makeGrowable(document.querySelector('.js-growable'));
        this.messageList = document.querySelector('#bab-messageList');

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
            if(this.userInfo && this.userInfo.email !== "")
                this.updateLocalStorage();
            this.scrollMessageSection();
        }.bind(this));
        
    },
    updateLocalStorage(name = this.userInfo.name, email = this.userInfo.email, message = this.currentMessage){
        localStorage.setItem('babble', JSON.stringify({userInfo: {name: name, email: email}, currentMessage: message}));
        this.localStorage = {userInfo: {name: name, email: email}, currentMessage: message};
    },

    scrollMessageSection(){
        var messageSection = Babble.$('#bab-messagesSection');
        messageSection.scrollTop = messageSection.scrollHeight;
    },
    formatDate(date){
        return date.getHours() + ':' + date.getMinutes();
    },
    appendMessage(message, id){
        //extracting data from message
        var name = message.name || 'Anonymous', email = message.email, 
        text = message.message, 
        time = this.formatDate(new Date(message.timestamp)) ,
        image = 'images/null.png';
        
        if(email != '')
            image = this.getImageUrl(email);

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
        li.innerHTML = toAppend;
        this.messageList['message-' + id] = li;

        this.messageList.appendChild(li);
        this.scrollMessageSection();
    },
    removeMessage(id){


    },
    handleAnonymos(){
        this.register({name:"",email: ""});
        this.hideModal();
    }
    
};


window.onload = function(){
    
    Babble.delay(Babble.init, 1000);
}
window.onresize = function(){
    Babble.scrollMessageSection();
}

document.onclick = function(evt){
    console.log(evt.clientX + ',',evt.clientY);
}