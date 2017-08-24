var Babble = {
    fixMargin: function(){
        // document.querySelector('.bab-mainHeader img ').style['margin-top'] = document.getElementsByClassName('bab-mainHeader')[0].clientHeight * 0.15 + 'px';
        // document.querySelector('main > header > h1').style['margin-top'] = document.querySelector('main > header').clientHeight * 0.372881356 + 'px';

    },
    init: function(){
        this.makeGrowable(document.querySelector('.js-growable'));
        this.adjustMessagsHeight();
    },
    makeGrowable: function makeGrowable(container) {
        var area = container.querySelector('textarea');
        var clone = container.querySelector('span');
        area.addEventListener('input', function(e) {
            clone.textContent = area.value;
            Babble.adjustMessagsHeight();
        });
    },
    adjustMessagsHeight: function adjustMessagsHeight(){
        var mainHeader = document.getElementById('bab-main-header');
        var sendMessage = document.getElementById('bab-sendMessage');
        var main = document.getElementById('bab-main');
        var messageSection = document.getElementById('bab-messagesSection');
        messageSection.style['height'] = main.clientHeight - (mainHeader.clientHeight + sendMessage.clientHeight) + 'px';
        
    }
};


window.onload = function(){
    
    Babble.init();
}
window.onresize = function(){
    Babble.adjustMessagsHeight();
}

document.onclick = function(evt){
    console.log(evt.clientX + ',',evt.clientY);
}