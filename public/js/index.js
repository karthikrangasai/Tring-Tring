var create_btn = document.getElementById('create-btn');
var generate_btn = document.getElementById('generate-btn');
var room_id = document.getElementById('create-room-id');
var join_room_id = document.getElementById('join-room-id');
var join_btn = document.getElementById('join-btn');
var socket = io();

generate_btn.addEventListener('click', () => {
    console.log(room_id);
    var num = Math.floor(Math.random() * 1000000);
    room_id.value = num;

});

create_btn.addEventListener('click', (event) => {
    event.preventDefault();
    socket.emit('create-room', { room_id: room_id.value });
});

socket.on('redirect', (data) => {
    if (data.status) {
        var url = window.location.href;
        window.location.href = url + data.url_extend;
    } else {
        alert("Server Error, Please Try Again");
    }
});

join_btn.addEventListener('click', (event) => {
    event.preventDefault();
    var room_id = join_room_id.value;
    console.log(room_id);
    if (room_id === "") {
        alert("Please Enter a valid Room ID");
    } else {
        var url = window.location.href;
        window.location.href = url + "r/" + room_id;
    }
});