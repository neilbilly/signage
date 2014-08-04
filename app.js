var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');
    cronJob = require('cron').CronJob;

var clientCount = 0;
var clientCountForControlCenter = 0;
var clientCountForNoticeboard = 0;

app.listen(4000);

function handler(req, res) {
  fs.readFile(__dirname + '/public' + req.url, function (err, data) {
    res.writeHead(200);
    res.end(data);
  })
}

function emitContent(file) {
  console.log('Broadcasting to noticeboard');
  fs.readFile(__dirname + file, 'utf8', function (err, data) {
      io.sockets.in('noticeboard').emit('content_push', {content: data});
  });
}

new cronJob('0 * * * * *', function(){

  emitContent('/public/current/item_1.html')
}, null, true, null);

new cronJob('30 * * * * *', function(){

  emitContent('/public/current/item_2.html')
}, null, true, null);

io.sockets.on('connection', function (socket) {
  console.log('Client connected');
  clientCount++;

  socket.on('room', function (room) {
    console.log('Client joining ' + room);
    socket.join(room)
  })

  io.sockets.in('control_center').emit('status', {clientCount: clientCount});

  socket.on('disconnect', function () {
    console.log('Client disconnected');
    clientCount--;
    io.sockets.emit('status', {clientCount: clientCount});
  });
});
