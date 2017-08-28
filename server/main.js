
var messages = require('./messages-util');
var express = require('express');
var fs = require('fs');
var app = express();
var urlUtil = require('url');
var parent = __dirname.split('server')[0];

var Babble = {
    messages: [],
    routs: ['/stats', '/messages', '/'],
    id: 0
};

app.use(express.static(parent +  'client/'));

app.get('/', function (req, res) {
   
    fs.readFile(parent +  'client/index.html', 'utf8', function(err, data){
        if(err)
            console.log('error reading index.html');
        res.writeHead(200, {'Content-Type': 'text/html'});        
        res.end(data);
    });
});

app.get('/messages', function(req, res){
    var counter = req.query.counter;
    if(isNaN(counter) || counter < 0 || counter > Babble.messages.length || counter === ''){
        console.log("err" + counter + req.query);
        res.writeHead(400);
        res.end("The entered query \""+ req.query.counter + "\" is bad." );
    }

    var msg = {
        name: 'mohammad',
        email: 'mmd.0@hotmail.com',
        message: 'hellow world !',
        timestamp: new Date().getTime()
    };
    res.end(JSON.stringify(msg));
});

app.post('/messages', function(req, res){
    var data = req;
    req.on('data', function(){
        console.log(data);
    });
    // console.log(data);
});
app.delete('/messages/:id', function(req, res){
    var counter = req.params.id;
    if(isNaN(counter) || counter < 0 || counter > Babble.id || counter === ''){
        console.log("err" + counter + req.query);
        res.writeHead(400);
        res.end("The entered message id \""+ counter + "\" is bad." );
    }
    console.log('delete '+ req.params.id);
});

app.get('/stats', function(req, res){

    var msg = {
        name: 'mohammad',
        email: 'mmd.0@hotmail.com',
        message: 'hellow world !',
        timestamp: new Date().getTime()
    };
    res.end(JSON.stringify(msg));
    console.log(res);
});
app.options('*', function(req, res){
    console.log('options request');
    res.writeHead(204);
    res.end();
});


app.use(function(req, res){
    var url = urlUtil.parse(req.url);
    if(Babble.routs.indexOf(url.pathname) !== -1){
        res.writeHead(405);
        res.end("The used method "+ req.method + " is not allowed for route " + url.pathname);
    }
    else{
        res.writeHead(404);
        res.end("The requested resource "+ url.pathname + " doesn't exist. ");
    }
    
    console.log('err route ', req.url, req.method);
});


// app.get('*', function(req, res){
//     console.log('get unknown', req.url);
// });
// app.post('*', function(req, res){
//     console.log('post req unknown', req.url);
// });
// app.delete('*', function(req, res){
//     console.log('delete req unknown', req.url);
// });
app.listen(8000, function(){
    console.log(new Date() + 'listening on port 8000...');
// console.log(app._router.stack);

});