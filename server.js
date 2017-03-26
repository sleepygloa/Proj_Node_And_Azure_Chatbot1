var http = require('http');
var express = require('express');
var app = express();

// view engine setup
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');


// static file setting //CSS등등 변하지 않는 코드들
app.use(express.static('public'));

//route setup //경로가 다른 접근에 따라 다른 결과값을 보여주는 것들을 처리함.
var index = require('./routes/index');
app.use('/', index);

//port setup
var port = process.env.PORT || 3000;


var server = http.createServer(app);
server.listen(port);

//Notificationhub setup
var azure = require('azure');
var hubName = 'sleepygloanodewithazurenotify';
var connectionString = 'Endpoint=sb://sleepygloanodewithazurenotify.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=42i102VfBC+4I9FwsBeGDPfZgrGyRA14YpdBB6CrDEc=';
var notificationHubService = azure.createNotificationHubService(hubName,connectionString);


//socket io 는 클라이언트와 서버가 계속 실시간으로 뭔가를 할수있는 모듈
var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
    socket.emit('toclient',{msg:'Welcome!'});
    notificationHubService.gcm.send(null, {data:{id:socket.id, message:'Welcome'}},function(error){
        if(!error){
            console.log('send');
        }
    });

    socket.on('fromclient',function(data){
        socket.broadcast.emit('toclient',data); 
        socket.emit('toclient',data);
        console.log('Message from client :'+data.msg);
       
        if(!data.msg==""){
            notificationHubService.gcm.send(null, {data:{id:socket.id, message:data.msg}}, function(error){
                if(!error){
                    //notification sent
                        console.log('send');
                }
            });
        }
    })
});

// var io = require('socket.io').listen(server);
// io.sockets.on('connection',function(socket){ //on 이벤트의 요청을 받을 당시,connection의 경우, function실행
//     socket.emit('toclient',{msg:'Welcome !'});
//     socket.on('fromclient',function(data){
//         socket.broadcast.emit('toclient',data); // 자신을 제외하고 다른 클라이언트에게 보냄
//         socket.emit('toclient',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
//         console.log('Message from client :'+data.msg);
//     });
// });