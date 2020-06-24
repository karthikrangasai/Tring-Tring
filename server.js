'use strict';

const express = require('express');
const path = require('path');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const _ = require('lodash');
const url = require('url');
const Room = require('./app/room');
const Peer = require('./app/peer');

var PORT = process.env.PORT || 8080;
var rooms = {
    504555: new Room(504555, null)
};

var app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/public'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    if (req.query) {
        res.render('index', { message: req.query.message });
    } else {
        console.log("rendering from pug");
        res.render('index');
    }
});
app.post('/r/:room_id', (req, res) => {
    if (req.body.func_type === "create") {
        var room_id = parseInt(req.body.create_room_id);
        var room_pass = req.body.create_room_password;
        console.log("--------------CREATE-ROOM----------------");
        console.log("Func Type: " + req.body.func_type);
        console.info("Room ID: " + room_id);
        console.info(req.body.password_exists + " => " + typeof(req.body.password_exists));
        console.info("Room Pass: " + room_pass);
        console.log("-----------------------------------------");

        if (req.body.password_exists === "on") {
            rooms[room_id] = new Room(room_id, room_pass);
            console.log(rooms[room_id]);
            res.render('videocall', { room_id: room_id, room_pass: room_pass, room_size: 1 });
        } else {
            rooms[room_id] = new Room(room_id, null);
            console.log(rooms[room_id]);
            res.render('videocall', { room_id: room_id, room_pass: null, room_size: 1 });
        }
    } else if (req.body.func_type === "join") {
        var room_id = parseInt(req.body.join_room_id);
        var room_pass = req.body.join_room_password;
        console.log("--------------JOIN-ROOM--------------");
        console.log("Func Type: " + req.body.func_type);
        console.info("Room ID: " + room_id);
        console.info(req.body.password_exists + " => " + typeof(req.body.password_exists));
        console.info("Room Pass: " + room_pass);
        console.log("-----------------------------------------");

        var room = rooms[room_id];
        if ((req.body.password_exists === "on") && room.passwordMatches(room_pass)) {
            console.log(rooms[room_id]);
            res.render('videocall', { room_id: room_id, room_pass: room_pass, room_size: rooms[room_id].currentRoomSize() });
        } else if (req.body.password_exists !== "on") {
            console.log(rooms[room_id]);
            res.render('videocall', { room_id: room_id, room_pass: null, room_size: rooms[room_id].currentRoomSize() });
        } else {
            console.error("Password Doesn't Match !!!");
            res.redirect(url.format({
                pathname: "/",
                query: { message: "Password Doesn't Match !!!" }
            }));
        }
    } else {
        console.error(req.body.func_type + " is not a well defined function. !!");
        res.redirect(url.format({
            pathname: "/",
            query: { message: req.body.func_type + " is not a well defined function. !!" }
        }));
    }
});
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(__dirname);
    console.log(`Listening at Port: ${PORT}`)
});

const io = socket(server);
io.on('connection', (socket) => {
    console.log("One browser connected");

    // When a peer joins after entering name
    socket.on('join', (data) => {
        var room_id = data.room_id;
        var room = rooms[room_id];
        if (room.space() === 2) {
            let peer = new Peer(data.peer_name, socket.id, socket);
            room.addPeer(peer, socket.id);
            socket.join(room_id);
            console.log("First User to room: " + room_id + " - " + data.peer_name + " joined and Socket ID = " + socket.id);
        } else if (room.space() == 1) {
            var peer_id = socket.id;
            let peer = new Peer(data.peer_name, peer_id, socket);
            room.addPeer(peer, socket.id);
            socket.join(room_id);
            console.log("Second User to room: " + room_id + " - " + data.peer_name + " joined and Socket ID = " + socket.id);
            socket.to(room_id).emit('user-joined', {
                peer_name: data.peer_name,
                peer_id: peer_id,
                room_size: rooms[room_id].currentRoomSize()
            });
            console.log('emitted user-joined event');
        } else {
            socket.emit('full-room');
        }
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
});