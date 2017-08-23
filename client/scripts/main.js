var Babble = {
    fixMargin: function(){
        // document.querySelector('.bab-mainHeader img ').style['margin-top'] = document.getElementsByClassName('bab-mainHeader')[0].clientHeight * 0.15 + 'px';
        // document.querySelector('main > header > h1').style['margin-top'] = document.querySelector('main > header').clientHeight * 0.372881356 + 'px';

    },
    init: function(){

    }
};


window.onload = function(){
    Babble.fixMargin();
}
window.onresize = function(){
    Babble.fixMargin();
}

document.onclick = function(evt){
    console.log(evt.clientX + ',',evt.clientY);
}