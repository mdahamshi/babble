window.onload = function(){
    console.log('window load')
    if(localStorage.getItem('babble') == null)
        localStorage.setItem('babble',JSON.stringify({userInfo:{email:"", name:""}, currentMessage:""}));
    window.Babble.init();

};
window.onblur = function(){

    window.Babble.updateLocalStorage();
    

};
window.onresize = function(){
    window.Babble.scrollMessageSection();
};



window.onbeforeunload = function(){
    
    window.Babble.updateLocalStorage();
    // return msg;
};