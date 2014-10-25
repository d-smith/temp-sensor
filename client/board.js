function randomTemp (low, high) {
    return Math.random() * (high - low + 1) + low;
}

function startSensorPoll(socket) {
  console.log('sensor poll starting');
  setInterval(function() {
    console.log('read temperature');
    socket.emit('temp read',randomTemp(60,65));
  }, 5000);
}

var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function() {
  console.log('Connected... start sensor poll');
  startSensorPoll(socket);
});
