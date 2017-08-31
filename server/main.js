
var messages = require('./messages-util');
var babble = require('./babble');
var express = require('express');
var fs = require('fs');
var app = express();
var urlUtil = require('url');
var parent = __dirname.split('server')[0];
var bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(parent +  'client/'));
// app.all('/', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//     next();
//    });
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
    if(isNaN(counter) || counter < 0 || counter > babble.messages.length || counter === ''){
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
    // req.on('data', function(){
    //     console.log(data['data']);
    // });
    console.log(req.body.data);
    // res.end(JSON.stringify({id:babble.id++}));
    req.on('close', () => {console.log("disconnect ",req.body.data.name)});

    // console.log(data);
});
app.delete('/messages/:id', function(req, res){
    var counter = req.params.id;
    if(isNaN(counter) || counter < 0 || counter > babble.id || counter === ''){
        console.log("err" + counter + req.query);
        res.writeHead(400);
        res.end("The entered message id \""+ counter + "\" is bad." );
    }
    console.log('delete '+ req.params.id);
    console.log(req.body.data);
    res.writeHead(200);
    res.end("all good, message deleted");
});

app.get('/stats', function(req, res){

    var data = {
        users: babble.users.length,
        messages: babble.messages.length
    }
    res.end(JSON.stringify(data));
    console.log(res);
    console.log(req);
});
app.options('*', function(req, res){
    console.log('options request');
    res.writeHead(204);
    res.end();
});


app.use(function(req, res){
    var url = urlUtil.parse(req.url);
    if(babble.routs.indexOf(url.pathname) !== -1){
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
app.listen(babble.port, function(){
    console.log(new Date() + 'listening on port '+ babble.port  + '...');
// console.log(app._router.stack);

});