// Logs messages to the console and emits to a monitor channel
function log(message) {
  const monitor_channel = 'monitor';
  const log = 'log';

  console.log(message);
  io.sockets.in(monitor_channel).emit(log, {message: message});
}

module.exports.log = log;
