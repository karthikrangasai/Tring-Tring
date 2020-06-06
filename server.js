'use strict';

var express = require('express');
var path = require('path');
var socket = require('socket.io');
var _ = require('lodash');
var Room = require('./app/room');
var Peer = require('./app/peer');
var PORT = process.env.PORT || 8080;
var room = new Room(504555);
var rooms = {
    504555: room
};

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
var server = app.listen(PORT, '0.0.0.0', () => {
    console.log(__dirname);
    console.log(`Listening at Port: ${PORT}`)
});
app.get('/', (req, res) => {
    res.render("index.html");
});
app.get('/r/:room_id', (req, res) => {
    var room_id = req.params.room_id;
    var room;
    console.log(room_id);
    if (rooms[room_id]) {
        console.log(rooms[room_id]);
        res.sendFile(path.join(__dirname + "/public/videocall.html"));
    } else {
        res.redirect('/');
    }
});


// var server = express()
//     .set('view engine', 'ejs')
//     .use(express.static(__dirname + 'public'))
//     .get('/', (req, res) => {
//         res.sendFile(path.join(__dirname + "/public/index.html"));
//     })
//     .get('/r/:room_id', (req, res) => {
//         var room_id = req.params.room_id;
//         var room;
//         console.log(room_id);
//         if (rooms[room_id]) {
//             console.log(rooms[room_id]);
//             res.sendFile(path.join(__dirname + "/public/videocall.html"));
//         } else {
//             res.redirect('/');
//         }
//     })
//     .listen(PORT, '0.0.0.0', () => { console.log("Listening on port" + PORT) });

const io = socket(server);
io.on('connection', (socket) => {
    console.log("One browser connected");
    // console.log(io.sockets);

    // To Create a room
    socket.on('create-room', (data, callback) => {
        var room_id = data.room_id;
        if (rooms[room_id]) {
            if (rooms[room_id].isEmpty()) {
                socket.emit('redirect', {
                    status: true,
                    url_extend: "r/" + room_id
                });
            }
        } else {
            try {
                rooms[room_id] = new Room(room_id);
                socket.emit('redirect', {
                    status: true,
                    url_extend: "r/" + room_id
                });
            } catch (error) {
                socket.emit('redirect', {
                    status: false,
                    url_extend: ""
                });
            }
        }
    });


    // When a peer joins after entering name
    socket.on('join', (data) => {
        var room_id = data.room_id;
        var room = rooms[room_id];
        if (room.space() === 2) {
            let peer = new Peer(data.peer_name, socket.id, socket);
            room.addPeer(peer, socket.id);
            socket.join(room_id);
            console.log("First User to room: " + room_id + " - " + data.peer_name + " joined and Socket ID = " + socket.id);
            // console.log(io.sockets.rooms);
            // console.log(socket);
        } else if (room.space() == 1) {
            var peer_id = socket.id;
            let peer = new Peer(data.peer_name, peer_id, socket);
            room.addPeer(peer, socket.id);
            socket.join(room_id);
            console.log("Second User to room: " + room_id + " - " + data.peer_name + " joined and Socket ID = " + socket.id);
            socket.to(room_id).emit('user-joined', {
                peer_name: data.peer_name,
                peer_id: peer_id
            });
            console.log('emitted user-joined event');
        } else {
            socket.emit('full-room');
        }
        // console.log(io.sockets.manager.rooms);
    });

    // When an offer is sent by a user
    socket.on('offer', (data) => {
        var receiver = data.to;
        socket.to(receiver).emit('offer', data);
    });

    // When an answer is sent by a user
    socket.on('answer', (data) => {
        var receiver = data.to;
        socket.to(receiver).emit('answer', data);
    });

    // When a peer leaves the call (or closes tab or disconnects)
    socket.on('cut-the-call', (data) => {
        var room_id = data.room_id;
        var peer_id = data.peer_id;
        var room = rooms[room_id];
        console.log(">>> Before Removing user");
        console.log(room);
        if (room && room.deletePeer(peer_id)) {
            socket.leave(room_id);
            console.log(">>> After Removing user");
            console.log(room);
            socket.to(room_id).emit('user-left', {
                peer_id: peer_id
            });
        } else {
            console.log("Couldn't remove peer " + peer_id);
        }

    });
    // console.log(io.sockets.manager.rooms);
});