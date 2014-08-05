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

function emitContent(file, room) {
  console.log('Broadcasting to ' + room);
  fs.readFile(__dirname + file, 'utf8', function (err, data) {
      io.sockets.in(room).emit('content_push', {content: data});
  });
}

var items = [];
items.push({path:'/public/signage/item_1.html', schedule:'0 * * * * *', room:'noticeboard'});
items.push({path:'/public/signage/item_2.html', schedule:'30 * * * * *', room:'noticeboard'});


function scheduleItem(path, schedule, room) {
  new cronJob(schedule, function(){
    emitContent(path, room)
  }, null, true, null);
}

for (var i = 0; i < items.length; i++) {
  scheduleItem(items[i].path, items[i].schedule, items[i].room);
}

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
