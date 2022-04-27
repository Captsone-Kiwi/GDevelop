var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer( {port: 5100});

wss.on("connection",function(ws){
    //message 수집.
    ws.on('message',function(msg){
        var parsed_msg = JSON.parse(msg);
        var command = parsed_msg["command"]
        var player_id = parsed_msg["player_id"]
        var data = parsed_msg["data"]
        console.log("Command : ",command);
        console.log("Player ID : ",player_id);
        console.log("Data : ",data["x"],data["y"],data["z"])
        
        wss.broadcast(JSON.stringify(parsed_msg));
    })
})

wss.broadcast = function(data) {
    wss.clients.forEach(client => client.send(data))
}