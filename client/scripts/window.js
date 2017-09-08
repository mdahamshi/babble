window.onload = function(){
    window.Babble.init();

};
window.onblur = function(){
    if(window.Babble.registered)
        window.Babble.updateLocalStorage();

};
window.onresize = function(){
    window.Babble.scrollMessageSection();
};



window.onbeforeunload = function(){
    if(window.Babble.registered)
        window.Babble.updateLocalStorage();
    window.Babble.logOut();
    // return msg;
};