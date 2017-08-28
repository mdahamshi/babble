var Babble = {
    $: document.querySelector.bind(document) ,
    $$: document.querySelectorAll.bind(document) ,
    // **************************** Requiered API*****************************************
    
    register: function register(userInfo){

    },
    
    getMessages: function getMessages(counter, callback){

    },
    
    postMessage: function postMessage(message, callback){

    },
    
    deleteMessage: function deleteMessage(id, callback){

    },
    
    getStats: function getStats(callback){

    },

    init: function(){

        if (Storage && localStorage.getItem('babble') === null){
            var modal = Babble.$('#bab-modal'),
            overlay = Babble.$('#bab-modal-overlay');
            modal.classList.remove('bab-u-hidden');
            this.hideLoading();
        }
        else {
            Babble.localStorage = localStorage.getItem('babble');
        }

        this.makeGrowable(document.querySelector('.js-growable'));
    },
    
    delay: function delay(callback, time){
        setTimeout(callback.bind(Babble), time);
    },
    
    hideLoading: function hideLoading(){
        Babble.$('#bab-loading')
        .classList.add('bab-u-hidden');
    },

    makeGrowable: function makeGrowable(container) {
        var area = container.querySelector('textarea');
        var clone = container.querySelector('span');
        area.addEventListener('input', function(e) {
            clone.textContent = area.value;
            Babble.scrollMessageSection();
        });
    },
    
    scrollMessageSection: function scrollMessageSection(){
        var messageSection = Babble.$('#bab-messagesSection');
        messageSection.scrollTop = messageSection.scrollHeight;
    },
    
    handleAnonymos: function handleAnonymos(){
        document.getElementById('bab-modal-overlay')
        .classList.add('bab-u-hidden');
        document.getElementById('bab-modal')
        .classList.add('bab-u-hidden');
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