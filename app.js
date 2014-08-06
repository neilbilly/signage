var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    cronJob = require('cron').CronJob;

var clientCount = 0,
    clientCountForControlCenter = 0,
    clientCountForNoticeboard = 0;

function handler(req, res) {
  fs.readFile(__dirname + '/public' + req.url, function (err, data) {
    res.writeHead(200);
    res.end(data);
  })
}

function scheduleItem(path, schedule, channel) {
  new cronJob(schedule, function(){
    emitContent(path, channel)
  }, null, true, null);
}

function emitContent(file, channel) {
  console.log('Broadcasting ' + file + ' to ' + channel + ' at ' + Date().toLocaleString());
  fs.readFile(__dirname + file, 'utf8', function (err, data) {
      io.sockets.in(channel).emit('content_push', {content: data});
  });
}

function loadSchedule(scheduleFile) {
  fs.readFile(scheduleFile, function (err, data) {
    var schedule = JSON.parse(data);
    for (item in schedule) {
      if (schedule.hasOwnProperty(item)) {
        scheduleItem(schedule[item].path, schedule[item].schedule, schedule[item].channel);
      }
    }
  })
}

app.listen(4000);
loadSchedule('schedule.json');

io.sockets.on('connection', function (socket) {
  console.log('Client connected');
  clientCount++;

  socket.on('channel', function (channel) {
    console.log('Client joining ' + channel);
    socket.join(channel)
  })

  io.sockets.in('control_center').emit('status', {clientCount: clientCount});

  socket.on('disconnect', function () {
    console.log('Client disconnected');
    clientCount--;
    io.sockets.emit('status', {clientCount: clientCount});
  });
});
