var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer( {port: 5100});

class Clients {
    constructor() {
        this.clientList = [[],[]]; // 0 -> restroom 1 -> interview room
        this.saveClient = this.saveClient.bind(this);
    }

    saveClient(join, client) {
        if(join == "restroom"){
            this.clientList[0].push(client)
        }
        else if(join == "interview"){
            this.clientList[1].push(client)
        }
    }
}

const clients = new Clients();

wss.on("connection",function(ws){
    ws.room = []

    //message 수집.
    ws.on('message',function(msg){
        var parsed_msg = JSON.parse(msg);
        var command = parsed_msg["command"]
        var player_id = parsed_msg["player_id"]
        var data = parsed_msg["data"]
        var room = parsed_msg["room"]
        console.log("Room : ", room);
        console.log("Command : ",command);
        console.log("Player ID : ",player_id);
        console.log("Data : ",data["x"],data["y"],data["z"])
        
        if(parsed_msg.join) clients.saveClient(parsed_msg.join,ws);
        broadcast(parsed_msg);
        // wss.broadcast(JSON.stringify(parsed_msg));
    })

    ws.on('close', function() {
        console.log("Client Closed");
    })
})

function broadcast(msg){
    if(msg.room == "restroom"){
        for(var i = 0; i < clients.clientList[0].length; i++){
            var client = clients.clientList[0][i];
            client.send(JSON.stringify(msg))
        }
    } else if (msg.room == "interview") {
        for(var i = 0; i < clients.clientList[1].length; i++){
            var client = clients.clientList[1][i];
            client.send(JSON.stringify(msg))
        }
    }
}

wss.broadcast = function(data) {
    wss.clients.forEach(client =>{
        client.send(data)   
    })
}