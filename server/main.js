
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
        // if(removeClient){
        //     var path = res.req._parsedOriginalUrl.pathname,
        //     sender = res.req.headers.sender;
        // }
        res.writeHead(200);
        res.end(JSON.stringify(data));
        // if(removeClient){
        
        //     if(path == babble.urls.messages)
        //         babble.removeMessageRes(sender);
        //     else if(path == babble.urls.stats)
        //         babble.removeStatsRes(sender);
        // }
    }catch(err){
        console.log('app.success err: ',err, res);
    }
};


app.use(express.static(parent +  'client/'));
app.all('*', function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header('Access-Control-Allow-Headers', 'Content-Type, sender, messages, users');
    // res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    console.log(req.method,req.path, 'user: ', req.headers.sender)
    // if(req.path === '/messages' && req.method === 'GET'){
    //     babble.messageRequests[req.headers.sender] = res;
    // }

    // if(req.path !== babble.urls.signin)
    //     if(req.headers.sender)
    //         if(babble.messageRequests[req.headers.sender] === undefined){
    //             res.writeHead(400);
    //             res.end("The entered query \""+ req.query.counter + "\" is bad." );
    //             return;
    //         }
    // if(req.path == babble.urls.stats || (req.path == babble.urls.messages && req.method == 'GET'))
    // req.on('close', function() {
    //     console.log('closed ', req.path,' method ',req.method);     
    //     var map = babble.getRsponseMap(req.path);
    //     if(map){
    //         if(map[req.headers.sender] !== undefined)
    //             map[req.headers.sender] = -1;
    //         setTimeout(function(){
    //             console.log('in fucking time out',babble.messageRequests[req.headers.sender] === -1 
    //         ,babble.statsRequests[req.headers.sender] === -1);

    //             if(babble.messageRequests[req.headers.sender] === -1 
    //                 && babble.statsRequests[req.headers.sender] === -1){
    //                 babble.removeClient(req.headers.sender);
    //             }
    //         }, 4000);
    //     }   
    // });
    req.on('close', function(){
        if(req.id){
            if(req.path == babble.urls.messages)
                babble.removeMessageRes(req.id);
            else if(req.path == babble.urls.stats)
                babble.removeStatsRes(req.id);
        }
    });

    next();
   });

app.relaseStats = function(users){
    if(babble.inRelaseStt)
        return;
    babble.inRelaseStt = true;
    try{
        setTimeout(function() {
            console.log(babble.formatDate() ,'in relase stats: ',babble.getStatResLength());
            while( babble.statsRequests.length > 0) {
                var res = babble.statsRequests.pop();
                var data = {
                    users: babble.getUserCount(),
                    messages: babble.messages.length,
                }
                res.end(JSON.stringify(data));
            }
        }, 800);
    }catch(err){
        console.log('relase stat err ',err);
    }finally{
        babble.inRelaseStt = false;
    }

};
app.relaseMessages = function(type, id ){
    if(babble.inRelaseMsg)
        return;
    babble.inRelaseMsg = true;
    var res, data;    
    try{
        console.log(babble.formatDate(),'in relase messages: ',babble.getMessagesResLength());
        if(type == 'remove'){
            while(babble.messageRequests.length > 0) {
                console.log('relasing for sender:  ');
                res = babble.messageRequests.pop();
                if(res){
                    data = {
                        type: type,
                        id: id
                    };
                }
                res.end(JSON.stringify(data));
            }
        }
        else{
            while(babble.messageRequests.length > 0) {
                res = babble.messageRequests.pop();
                if(res){
                    data = {
                        messages: babble.messages.slice(res.req.query.counter), 
                        counter: babble.getMessagesCount()
                    };
                    
                }   
                res.end(JSON.stringify(data));
            }
        }
    }
    catch(err){
        console.log('err relase msg ',err);
        
    }finally {
        babble.inRelaseMsg = false;
        app.relaseStats(babble.getUserCount());
        
    }
};
app.on('AssertUser', function (id) {
    // setTimeout(function(){
    //     babble.removeMessageRes(id);
        
    // }.bind(this), 1000);
    // setTimeout(function(){
    //     if(babble.messageRequests[id] == undefined){
    //         console.log("request died");
    //         babble.removeMessageRes(id);
    //         app.relaseStats();
    //     }else
    //         console.log('user still alive');
    // }.bind(this), babble.userGoneTimeOut);
  });
app.options('*', function(req, res){
    console.log('options request');
    res.writeHead(204);
    res.end();
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
    req.id = babble.reqId++;
    
    if(isNaN(counter) || counter < 0 || counter === ''){
        console.log("err" + counter + req.query);
        res.writeHead(400);
        res.end("The entered query \""+ req.query.counter + "\" is bad." );
        return;
    } 
    // if(counter === 0){
    //     var data = {messages: babble.messages, counter: babble.getMessagesCount()};
        
    //     app.success(data, res);
    //     return;
    // }
    if(counter < babble.getMessagesCount()){
        var data = {messages: babble.messages.slice(counter), counter: babble.getMessagesCount()};
        
        app.success(data, res);
    }else{
        
        babble.messageRequests.push(res);
        console.log('pushed message res ',babble.messageRequests.length);
    }
    

    // app.success({messages: toSend}, res);
});

app.post('/user', function(req, res){
    if(req.body.data && (req.body.data.email != undefined)){
        var sentByme = babble.getMessagesByMe(req.body.data.email);
        // babble.messageRequests[babble.id] = -1;
        app.success({id: babble.id++, byMe: sentByme}, res);

    }
    else{
        var sentByme = babble.getMessagesByMyID(req.headers.sender);
        app.success({id: babble.id++, byMe: sentByme}, res);
    }

        app.relaseStats(babble.getUserCount());
   
    
});

app.post('/messages', function(req, res){
    // req.on('data', function(){
    //     console.log(data['data']);
    // });
    try{    
        var msg = req.body;
     
        var msgId = messages.addMessage(msg, req.headers.sender);
        fs.appendFile(babble.dataFile,JSON.stringify(babble.messages[babble.messages.length - 1]) + ',',function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
        console.log(babble.messages[babble.getMessagesCount()-1]);
        app.success({id: msgId},res);
        console.log(JSON.stringify(msg) + ',');
    }catch(err){
        console.log(err);
    }
    
    app.relaseMessages();


    // console.log(req.connection);
});
app.delete('/messages/:id', function(req, res){
    var id = parseInt(req.params.id), email = req.body.data.email;
    if(isNaN(id) || id < 0 || id > babble.messageId || id === ''){
        console.log("err bab id " + id );
        res.writeHead(400);
        res.end("The entered message id \""+ id + "\" is bad." );
    }
    var byEmail = babble.getMessagesByMe(email).indexOf(id) !== -1,
        byId = babble.getMessagesByMyID(req.headers.sender).indexOf(id) !== -1;
    if(byEmail || byId){
        messages.deleteMessage(id);
        app.relaseMessages('remove', id);

        // app.relaseStats();
        console.log('delete '+ req.params.id);
        app.success({id: req.params.id},res);
    }else{
        res.writeHead(400);
        res.end("The entered message id \""+ id + "\" doesn't belong to you." );
    }
});
app.delete('/logout/:id', function(req, res){
    var id = req.params.id;

    console.log('log out: ',id);
    

    babble.removeClient(id);
    app.relaseStats(babble.getUserCount());
    app.success("",res);
});
app.get('/stats', function(req, res){
    req.id = babble.reqId++;
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
        babble.statsRequests.push(res);
        console.log('pushed stat res ',Object.keys(babble.statsRequests).length);
    }
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
fs.readFile(babble.dataFile,{encoding: 'utf8'},function(err, data){
    if(err) throw err;
    var i = data.length - 1;
    while(data[i] != ',')
        i--;
    var importedMessages = '[' + data.slice(0, i) + ']';
    babble.messages = JSON.parse(importedMessages);
    babble.messageId = babble.messages.length + 1;
    app.listen(process.env.PORT || babble.port, function(){
        console.log(new Date() + 'listening on port '+ babble.port  + '...');
    // console.log(app._router.stack);
    
    });
    return;
}.bind(this));

// setInterval(function(){
//     for(sender in babble.messageRequests) {
//         if(babble.messageRequests[sender] == -1 || babble.messageRequests[sender] == undefined)
//             if(babble.statsRequests[sender] == -1 || babble.statsRequests[sender] == undefined){
//                 babble.removeClient(sender);
//                 app.relaseStats();
//             }
//     }
// },babble.cleaningInterval);