// Schedule the signage
function scheduleItem(path, schedule, channel) {
  new cronJob(schedule, function(){
    emitContent(path, channel)
  }, null, true, null);
}

// Broadcast the signage
function emitContent(file, channel) {
  fs.readFile(__dirname + file, function (err, buf) {
      logging.log('Broadcasting ' + file + ' to the ' + channel + ' channel (' + Date().toLocaleString() + ')');
      io.sockets.in(channel).emit('content_push', { image: true, buffer: buf });
  });
}

// Iterate through schedule.json and call scheduling
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

module.exports.loadSchedule = loadSchedule;
