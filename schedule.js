// Properties
jobs = [];

// Schedule a job, i.e. a signage item
function scheduleJob(path, schedule, channel) {
  var job = new cronJob(schedule, function(){
    emitContent(path, channel)
  }, null, true, null);
  return job;
}

// Broadcast a signage item
function emitContent(file, channel) {
  fs.readFile(__dirname + file, function (err, buf) {
      logging.log('Broadcasting ' + file + ' to the ' + channel + ' channel (' + Date().toLocaleString() + ')');
      io.sockets.in(channel).emit('content_push', { image: true, buffer: buf });
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

module.exports.load = load;
module.exports.reloadOnChange = reloadOnChange;
