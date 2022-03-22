// At the beginning of the scene

runtimeScene.ws = new WebSocket("ws://localhost:5100/ws");
const id = Math.floor(Math.random() * Math.floor(100000))
runtimeScene.player_id = id
runtimeScene.delayedEvents = []

runtimeScene.ws.onopen = function (event) {
    const data = {
        command: "NEW_PLAYER",
        player_id: runtimeScene.player_id,
        data: {
            x: 300,
            y: 300
        }
    }
    setTimeout(() => {
        runtimeScene.ws.send(JSON.stringify(data))
    }, 500); 
};

runtimeScene.ws.onmessage = function (event) {
    const e = JSON.parse(event.data)
    switch (e.command) {
        case "NEW_PLAYER":
            newPlayer(e)
            break;
        case "MOVEMENT":
            movement(e)
            break;
        case "REFRESH_PLAYER":
            refreshPlayers(e)
            break;
        default:
            console.log("unknown command: " + e.command)
    }
}

function newPlayer(event) {
    const p = createPlayer(event)
    if (runtimeScene.player_id !== p.player_id) {
        p.setColor("255;100;100")
        // New player, re-send my player's data
        const o = runtimeScene.getObjects("player").find((o) => o.player_id === runtimeScene.player_id)
        const update = {
            command: "REFRESH_PLAYER",
            player_id: runtimeScene.player_id,
            data: {
                x: o.getX(),
                y: o.getY()
            }
        }
        runtimeScene.ws.send(JSON.stringify(update))
    }
}

function refreshPlayers(event) {
    const o = runtimeScene.getObjects("player").find((o) => o.player_id === event.player_id)
    if (typeof o === "undefined") {
        const p = createPlayer(event)
        p.setColor("255;100;100")
    }
}

function createPlayer(event) {
    const player = runtimeScene.createObject("player")
    player.setX(event.data.x)
    player.setY(event.data.y)
    player.player_id = event.player_id
    player.positions = []
    return player
}

function movement(event) {
    const o = runtimeScene.getObjects("player").find((o) => o.player_id === event.player_id)
    if (typeof o === "undefined") {
        return
    }

    o.setX(event.data.x)
    o.setY(event.data.y)
}

// Player movement
const input = runtimeScene._runtimeGame.getInputManager()
const player = runtimeScene.getObjects("player").find((o) => o.player_id === runtimeScene.player_id)

if (typeof player === "undefined") {
    return 
}

const movementSpeed = 0.33 * runtimeScene.getTimeManager().getElapsedTime()

let x = player.getX()
let y = player.getY()
let moved = false

if (input.isKeyPressed(37)) {
    moved = true
    x -= movementSpeed
}

if (input.isKeyPressed(39)) {
    moved = true
    x += movementSpeed
}

if (input.isKeyPressed(38)) {
    moved = true
    y -= movementSpeed
}

if (input.isKeyPressed(40)) {
    moved = true
    y += movementSpeed
}

if (moved === false) {
    return
}

const update = {
        command: "MOVEMENT",
        player_id: runtimeScene.player_id,
        data: {
            x: x,
            y: y
        }
}
runtimeScene.ws.send(JSON.stringify(update))