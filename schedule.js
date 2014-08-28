// Properties
var jobs = [];
var lastPushes = [];

// Schedule a job, i.e. a signage item
function scheduleJob(path, schedule, channel) {
  var job = new cronJob(schedule, function(){
    emitContent(path, channel, function () {
      lastPush(path, channel)
    })
  }, null, true, null);
  return job;
}

// Broadcast a signage item
function emitContent(file, channel, callback) {
  fs.readFile(__dirname + file, function (err, buf) {
      logging.log('Broadcasting ' + file + ' to the ' + channel + ' channel (' + Date().toLocaleString() + ')');
      io.sockets.in(channel).emit('content_push', { image: true, buffer: buf });

      if (callback && typeof(callback) === "function"){
        callback();
      }
  });
}

// Iterate through schedule.json, call scheduling and build job array
function load(scheduleFile) {
  if(scheduleFile){
    fs.readFile(scheduleFile, function (err, data) {
      var schedule = JSON.parse(data);
      for (item in schedule) {
        if (schedule.hasOwnProperty(item)) {
          job = scheduleJob(schedule[item].path, schedule[item].schedule, schedule[item].channel);
          jobs.push(job);
        }
      }
      logging.log("Schedule loaded");
    })
  }
}

// Cancel schedule
function cancel(callback) {
  if (jobs){
    try {
      for (i = 0; i < jobs.length; i++) {
        jobs[i].stop();
      }
    } catch (err) {
      logging.log(err);
    }

    if (callback && typeof(callback) === "function"){
      callback();
    }
  }
}

// Watch for schedule changes
function reloadOnChange(scheduleFile){
  fs.watchFile(scheduleFile, function(current, previous){
    logging.log("Schedule changed");
    cancel(function () {
      load(scheduleFile);
    });
  })
}

// Record last push for each channel
function lastPush(path, channel) {
  var channelExits = false;
  try {
    if (lastPushes.length > 0) {
      for (var i = 0; i < lastPushes.length; i++) {
        if (lastPushes[i][1] == channel) {
          channelExits = true;
          lastPushes[i][0] == path
        }
      }

      if (!channelExits) {
        lastPushes.push([path,channel]);
      }
    } else {
      //console.log('adding ' + channel);
      lastPushes.push([path,channel]);
    }
  } catch (err) {
    logging.log(err)
  }
}

// Syncronize a client
function clientSync(channel, clientId) {
  var file;
  if (lastPushes.length > 0) {
    for (var i = 0; i < lastPushes.length; i++) {
      if (lastPushes[i][1] == channel) {
        file = lastPushes[i][0];
        fs.readFile(__dirname + file, function (err, buf) {
            logging.log('Syncronizing client with ' + file + ' on the ' + channel + ' channel (' + Date().toLocaleString() + ')');
            io.to(clientId).emit('content_push', { image: true, buffer: buf });
        });
      }
    }
  }
}

module.exports.load = load;
module.exports.reloadOnChange = reloadOnChange;
module.exports.clientSync = clientSync;
