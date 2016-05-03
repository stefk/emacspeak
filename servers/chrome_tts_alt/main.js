(function () {

var tcpServer = new TcpServer('127.0.0.1', 2222)

tcpServer.listen(function (connection, socket) {
  var ttsApi = new TtsApi()
  var id = '[' + socket.peerAddress + ':' + socket.peerPort + '] '
  var initialMsg = id + 'Connection accepted!'

  write(connection, initialMsg)

  connection.addDataReceivedListener(function (data) {
    var lines = data.split(/[\n\r]+/);

    lines.forEach(function (line) {
      if (line.length > 0) {
        write(connection, id + 'Received: ' + line)
        write(connection, id + ttsApi.execute(line.split(/\s+/)))
      }
    })
  })

})

function write(connection, message) {
  connection.sendMessage(message)
  console.info(message)
}

})()
