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

//logs messages to the console and emits to a monitor channel
function log(message) {
  const monitor_channel = 'monitor';
  const log = 'log';

  console.log(message);
  io.sockets.in(monitor_channel).emit(log, {message: message});
}

function scheduleItem(path, schedule, channel) {
  new cronJob(schedule, function(){
    emitContent(path, channel)
  }, null, true, null);
}

function emitContent(file, channel) {
  fs.readFile(__dirname + file, 'utf8', function (err, data) {
      log('Broadcasting ' + file + ' to the ' + channel + ' channel (' + Date().toLocaleString() + ')');
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
  log('Client connected');
  clientCount++;
  log('Total clients now connected is ' + clientCount);

  socket.on('channel', function (channel) {
    log('Client joining ' + channel);
    socket.join(channel)
  })

  io.sockets.in('monitor').emit('clients', {clientCount: clientCount});

  socket.on('disconnect', function () {
    log('Client disconnected');
    clientCount--;
    log('Total clients now connected is ' + clientCount);
  });
});
