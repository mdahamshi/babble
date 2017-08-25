var Babble = {
    $: document.querySelector.bind(document) ,
    $$: document.querySelectorAll.bind(document) ,
    fixMargin: function(){
        // document.querySelector('.bab-mainHeader img ').style['margin-top'] = document.getElementsByClassName('bab-mainHeader')[0].clientHeight * 0.15 + 'px';
        // document.querySelector('main > header > h1').style['margin-top'] = document.querySelector('main > header').clientHeight * 0.372881356 + 'px';

    },
    init: function(){
        this.makeGrowable(document.querySelector('.js-growable'));
    },
    makeGrowable: function makeGrowable(container) {
        var area = container.querySelector('textarea');
        var clone = container.querySelector('span');
        area.addEventListener('input', function(e) {
            clone.textContent = area.value;
        });
    }
};


window.onload = function(){
    
    Babble.init();
}
window.onresize = function(){
}

document.onclick = function(evt){
    console.log(evt.clientX + ',',evt.clientY);
}