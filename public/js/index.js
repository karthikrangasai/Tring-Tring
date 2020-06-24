var create_btn = document.getElementById('create-btn');
var generate_btn = document.getElementById('generate-btn');
var create_room_form = document.getElementById('create-room-form');
var create_room_id = document.getElementById('create-room-id');
var join_room_id = document.getElementById('join-room-id');
var join_btn = document.getElementById('join-btn');
var create_room_password_check = document.getElementById('create_pw_exists');
var create_room_password_input = document.getElementById('create-room-password');
var join_room_password_check = document.getElementById('join_pw_exists');
var join_room_password_input = document.getElementById('join-room-password');
// var socket = io();

create_room_password_input.value = Math.random().toString(36).substring(2, 10);

generate_btn.addEventListener('click', () => {
    console.log(create_room_id);
    var num = Math.floor(Math.random() * 1000000);
    create_room_id.value = num;

});

function setCreateRoomURL() {
    document.create_room_form.action = "r/" + create_room_id.value;
}

function setJoinRoomURL() {
    document.join_room_form.action = "r/" + join_room_id.value;
}

create_room_password_check.addEventListener('click', (event) => {
    console.log(event);
    if (event.srcElement.checked === true) {
        create_room_password_input.value = Math.random().toString(36).substring(2, 10);
        create_room_password_input.style.display = "block";
    } else {
        create_room_password_input.value = null;
        create_room_password_input.style.display = "none";
    }
});

join_room_password_check.addEventListener('click', (event) => {
    console.log(event);
    if (event.srcElement.checked === true) {
        join_room_password_input.style.display = "block";
    } else {
        join_room_password_input.style.display = "none";
    }
});

// create_btn.addEventListener('click', (event) => {
//     event.preventDefault();
//     socket.emit('create-room', { room_id: room_id.value });
// });

// socket.on('redirect', (data) => {
//     if (data.status) {
//         var url = window.location.href;
//         window.location.href = url + data.url_extend;
//     } else {
//         alert("Server Error, Please Try Again");
//     }
// });

// join_btn.addEventListener('click', (event) => {
//     event.preventDefault();
//     var room_id = join_room_id.value;
//     console.log(room_id);
//     if (room_id === "") {
//         alert("Please Enter a valid Room ID");
//     } else {
//         var url = window.location.href;
//         window.location.href = url + "r/" + room_id;
//     }
// });