var app = require('http').createServer(handler),
    url = require('url')
    io = require('socket.io').listen(app),
    fs = require('fs'),
    cronJob = require('cron').CronJob,
    logging =  require('./logging.js'),
    scheduling = require('./scheduling.js')

var clientCount = 0;

// Request handler. URL's are pasred in order to ignore querystrings as
// these are only required at the client to feed to socket.io.
function handler(req, res) {
  urlObj = url.parse(req.url);
  fs.readFile(__dirname + '/public' + urlObj.pathname, function (err, data) {
    res.writeHead(200);
    res.end(data);
  })
}

app.listen(4000);

//Initate broadcasting
scheduling.loadSchedule('schedule.json');

//Handle clients
io.sockets.on('connection', function (socket) {
  logging.log('Client connected');
  clientCount++;
  logging.log('Total clients now connected is ' + clientCount);

  socket.on('channel', function (channel) {
    logging.log('Client joining ' + channel);
    socket.join(channel)
  })

  io.sockets.in('monitor').emit('clients', {clientCount: clientCount});

  socket.on('disconnect', function () {
    logging.log('Client disconnected');
    clientCount--;
    logging.log('Total clients now connected is ' + clientCount);
  });
});
