
var messages = require('./messages-util');
var babble = require('./babble');
var express = require('express');
var fs = require('fs');
var app = express();
var parent = __dirname.split('server')[0];
var bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.success = function (data, res, removeClient)  {
    if(! res.writeHead)
        return;
    try{
        if(removeClient){
            var path = res.req._parsedOriginalUrl.pathname,
            sender = res.req.headers.sender;
        }
        res.writeHead(200);
        res.end(JSON.stringify(data));
        if(removeClient){
        
            if(path == babble.urls.messages)
                babble.removeMessageRes(sender);
            else if(path == babble.urls.stats)
                babble.removeStatsRes(sender);
        }
    }catch(err){
        console.log('app.success err: ',err);
    }
};
app.use(express.static(parent +  'client/'));
app.all('*', function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    console.log(req.method,req.path, 'user: ', req.headers.sender)
    // if(req.path === '/messages' && req.method === 'GET'){
    //     babble.messageRequests[req.headers.sender] = res;
    // }
    
    req.on('close', function() {
        console.log('closed');        
        if(req.path == babble.urls.messages)
            app.emit('ReqServed', req.headers.sender);
        else if (req.path == babble.urls.stats)
            babble.removeStatsRes(req.headers.sender);
    });

    next();
   });

app.relaseStats = function(){
    console.log('in relase stats: ');
    for(sender in babble.statsRequests) {
        var res = babble.messageRequests[sender];
        var data = {
            users: babble.getUserCount(),
            messages: babble.messages.length,
        }
        app.success(data, res, true);
    }
};
app.relaseMessages = function(){
    console.log('in relase messages: ');
    for(sender in babble.messageRequests) {
        var res = babble.messageRequests[sender];
        if(res){
            var data = {
                messages: babble.messages.slice(res.req.query.counter), 
                counter: babble.getMessagesCount()
            };
            app.success(data, res, true);
        }
    }
};
app.on('ReqServed', function (id) {
    babble.removeMessageRes(id);
    setTimeout(function(){
        if(babble.messageRequests[id] == undefined){
            console.log("request died");
            babble.removeMessageRes(id);
            app.relaseStats();
        }else
            console.log('user still alive');
    }.bind(this), babble.userGoneTimeOut);
  });
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
    if(counter != babble.getMessagesCount()){
        var data = {messages: babble.messages.slice(counter), counter: babble.getMessagesCount()};
        babble.messageRequests[req.headers.sender] = res;
        app.emit('ReqServed', req.headers.sender)
        app.success(data, res);
    }else{
        babble.messageRequests[req.headers.sender] = res;
        console.log('pushed message res ',Object.keys(babble.messageRequests).length);
    }
    

    // app.success({messages: toSend}, res);
});

app.post('/user', function(req, res){
    if(req.body.data.email != ""){
        var sentByme = babble.getMessagesByMe(req.body.data.email);
        app.success({id: babble.id++, byMe: sentByme}, res);

    }
    else{
        app.success({id: babble.id++}, res);
    }

    
});

app.post('/messages', function(req, res){
    // req.on('data', function(){
    //     console.log(data['data']);
    // });
    
    var msg = req.body.data;

    var msgId = messages.addMessage(msg);
    console.log(babble.messages[babble.getMessagesCount()-1]);
    app.success({id: msgId},res);
    app.relaseMessages();


    // console.log(req.connection);
});
app.delete('/messages/:id', function(req, res){
    var id = req.params.id;
    if(isNaN(id) || id < 0 || id > babble.id || id === ''){
        console.log("err" + id + req.query);
        res.writeHead(400);
        res.end("The entered message id \""+ id + "\" is bad." );
    }
    console.log('delete '+ req.params.id);
    console.log(req.body.data);
    res.writeHead(200);
    res.end("all good, message deleted");
});
app.delete('/logout/:id', function(req, res){
    var id = req.params.id;

    if(req.headers.sender == id)
        babble.removeClient(id);
    app.success("",res);
});
app.get('/stats', function(req, res){
    var data = {
        users: babble.getUserCount(),
        messages: babble.messages.length,
    }
    var clientUsers = req.headers.users,
        clientMessages = req.headers.messages;
    if(clientUsers != data.users || clientMessages != data.messages){
        console.log('client user not equal ',clientUsers,clientMessages, data);
        app.success(data, res);
    }else{
        babble.statsRequests[req.headers.sender] = res;
        console.log('pushed stat res ',Object.keys(babble.statsRequests).length);
    }
    

});
app.options('*', function(req, res){
    console.log('options request');
    res.writeHead(204);
    res.end();
});


app.use(function(req, res){
    if(babble.routs.indexOf(req.path) !== -1){
        res.writeHead(405);
        res.end("The used method "+ req.method + " is not allowed for route " + url.pathname);
    }
    else{
        res.writeHead(404);
        res.end("The requested resource "+ req.path + " doesn't exist. ");
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