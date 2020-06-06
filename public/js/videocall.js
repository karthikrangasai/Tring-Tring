'use strict';

////////// During Join Demo Video //////////
var demo_stream;
var demo_video = document.getElementById('demo-video');
var peer_name_input = document.getElementById('peer-name');
var join_btn = document.getElementById('join-btn');
// var join_control_video = document.getElementById('join-control-video');
// var join_control_audio = document.getElementById('join-control-audio');
var error_label = document.getElementById('error-label');
var join_call = document.getElementById('join-call');

// Methods for Media Inut and Toggling Audio and Video Inputs
navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
    retreived_user_media = true;
    console.log(stream);
    demo_stream = stream;
    var audioTrack_demo = demo_stream.getAudioTracks()[0];
    audioTrack_demo.enabled = !audioTrack_demo.enabled;
    demo_video.srcObject = stream;
}).catch((error) => {
    alert("Please provide access to any or all Media Devices !!")
    retreived_user_media = false;
});

// // Media Tooglers for the Demo MediaStream Input
// join_control_audio.addEventListener('click', (e) => {
//     var audioTrack = demo_stream.getAudioTracks()[0];
//     if (audioTrack.enabled) {
//         e.target.innerHTML = "mic_off";
//         call_audio_control.innerHTML = "mic_off";
//         user_input_audio_toggle = false;
//     } else {
//         e.target.innerHTML = "mic";
//         call_audio_control.innerHTML = "mic";
//         user_input_audio_toggle = true;
//     }
//     audioTrack.enabled = !audioTrack.enabled;
// });
// join_control_video.addEventListener('click', (e) => {
//     var videoTrack = demo_stream.getVideoTracks()[0];
//     if (videoTrack.enabled) {
//         e.target.innerHTML = "videocam_off";
//         call_video_control.innerHTML = "videocam_off"
//         user_input_audio_toggle = false;
//     } else {
//         e.target.innerHTML = "videocam";
//         call_video_control.innerHTML = "videocam"
//         user_input_audio_toggle = true;
//     }
//     videoTrack.enabled = !videoTrack.enabled;
// });




////////// Call Part //////////
///// Room Details /////
var window_url = window.location.href.split('/')
var room_id = window_url[window_url.length - 1];
var socket = io();

///// Our Side /////
// Video Details - Small one
var local_video = document.getElementById('local-video');
var local_stream;
var call_audio_control = document.getElementById('call-audio-control');
var call_video_control = document.getElementById('call-video-control');
var call_cut_control = document.getElementById('call-cut-control');
var retreived_user_media;
var user_input_audio_toggle = false;
var user_input_video_toggle = true;
var peer_connection;
var mediaConstraints = {
    audio: user_input_audio_toggle,
    video: user_input_video_toggle
}
var peer_connection_configuration = {
    "iceServers": [
        { "url": "stun:stun.l.google.com:19302" },
        { "url": "stun:stun1.l.google.com:19302" },
        { "url": "stun:stun2.l.google.com:19302" },
        { "url": "stun:stun3.l.google.com:19302" },
        { "url": "stun:stun4.l.google.com:19302" },
        { "url": "stun:stun01.sipphone.com" },
        { "url": "stun:stun.ekiga.net" },
        { "url": "stun:stun.fwdnet.net" },
        { "url": "stun:stun.ideasip.com" },
        { "url": "stun:stun.iptel.org" },
        { "url": "stun:stun.rixtelecom.se" },
        { "url": "stun:stun.schlund.de" },
        { "url": "stun:stunserver.org" },
        { "url": "stun:stun.softjoys.com" },
        { "url": "stun:stun.voiparound.com" },
        { "url": "stun:stun.voipbuster.com" },
        { "url": "stun:stun.voipstunt.com" },
        { "url": "stun:stun.voxgratia.org" },
        { "url": "stun:stun.xten.com" },
        { "url": "stun:stun.stunprotocol.org:3478" },
        {
            "urls": [
                "turn:13.250.13.83:3478?transport=udp"
            ],
            "username": "YzYNCouZM1mhqhmseWk6",
            "credential": "YzYNCouZM1mhqhmseWk6"
        }
    ]
};
// User Details
var peer_name;
var local_sdp;

///// Remote Side /////
// Video Details - Big one
var remote_peer_name;
var remote_peer_id;
var remote_video = document.getElementById('remote-video');


///// Methods /////

// Start of the functions
function onJoin() {
    var temp = peer_name_input.value;
    if (!(temp === "")) {
        error_label.style.display = "none";
        peer_name = temp;
        console.log(peer_name);

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                mandatory: {
                    maxHeight: 720,
                    maxWidth: 1080
                },
                optional: []
            }
        }).then((stream) => {
            console.log(">>> Local MediaStream Created: ");
            console.log(stream);
            local_stream = stream;
            local_video.srcObject = local_stream;
            if (!user_input_audio_toggle) {
                var audioTrack_demo = local_stream.getAudioTracks()[0];
                // audioTrack_demo.enabled = !audioTrack_demo.enabled;
                audioTrack_demo.enabled = false;
            }
            if (!user_input_video_toggle) {
                var videoTrack_demo = local_stream.getVideoTracks()[0];
                // audioTrack_demo.enabled = !audioTrack_demo.enabled;
                videoTrack_demo.enabled = false;
            }

            // demo_video.onpause();
            demo_stream.getTracks().forEach(track => {
                track.stop();
            });
            demo_stream = null;

            // // Creating the Peer Connection
            console.log(">>> Starting Peer Connection Fn :");
            createPeerConnections();
            console.log(">>> Peer Connection Fn Done.");

            if (local_stream && peer_connection) {
                socket.emit('join', {
                    room_id: room_id,
                    peer_name: peer_name
                });
                join_call.style.display = "none";
            } else {
                error_label.innerText = 'There was an error, Please Try Again !!';
                error_label.style.display = "block";
            }
        }).catch((error) => {
            console.log(">>> getUserMedia or RTCPeerConnection Error :");
            console.log(error);
            alert("Please provide access to any or all Media Devices !!")
            peer_connection = null;
        });
    } else {
        error_label.innerText = 'Please Enter a Name !!';
        error_label.style.display = "block";
    }
}

// Toggle Media Inputs
call_audio_control.addEventListener('click', (event) => {
    if (local_stream) {
        var audioTrack = local_stream.getAudioTracks()[0];
        audioTrack.enabled = !(audioTrack.enabled);
        if (audioTrack.enabled) {
            event.target.innerHTML = "mic";
        } else {
            event.target.innerHTML = "mic_off";
        }
    }
});

call_video_control.addEventListener('click', (event) => {
    if (local_stream) {
        var videoTrack = local_stream.getVideoTracks()[0];
        videoTrack.enabled = !(videoTrack.enabled);
        if (videoTrack.enabled) {
            event.target.innerHTML = "videocam";
        } else {
            event.target.innerHTML = "videocam_off";
        }
    }
});

// When call is cut
function onCutCall() {
    resetPeerConnection();
    resetMediaStreams();
    socket.emit('cut-the-call', {
        room_id: room_id,
        peer_name: peer_name,
        peer_id: socket.id
    });
    window.location.href = "/";
}

window.addEventListener("unload", (event) => {
    socket.emit('cut-the-call', {
        room_id: room_id,
        peer_name: peer_name,
        peer_id: socket.id
    });
});

// Creates the Peer Connection
function createPeerConnections() {
    peer_connection = new RTCPeerConnection(peer_connection_configuration);
    console.log(">>> Peer Connection Created");
    console.log(peer_connection);
    console.log(peer_connection.onnegotiationneeded);

    // RTCPeerConnection Interfaces
    peer_connection.oniceconnectionstatechange = (event) => {
        if (peer_connection.iceConnectionState === "closed") {
            resetPeerConnection();
            alert("User has been disconnected !!");
            socket.emit('user-left', {
                peer_id: remote_peer_id
            })
        }
    }

    peer_connection.onicecandidate = event => {
        console.log(">>> ICE Candidate Event :");
        console.log(event);
        socket.emit('ice-candidate', {
            from: socket.id,
            to: remote_peer_id,
            candidate: event.candidate
        });
    }

    peer_connection.onnegotiationneeded = event => {
        peer_connection.createOffer()
            .then((offer) => {
                return peer_connection.setLocalDescription(offer);
            }).then(() => {
                socket.emit('offer', {
                    from: socket.id,
                    to: remote_peer_id,
                    type: 'offer',
                    sdp: peer_connection.localDescription
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    peer_connection.ontrack = event => {
        remote_video.srcObject = event.streams[0];
    }
}

// Setting up Siganlling Functioning for the Peer Connection Stuff
socket.on('full-room', () => {
    join_call.style.display = "block";
    error_label.innerText = "Room is Full!! Please Join another Room";
    error_label.style.display = "block";
    console.log("No such room");
    resetPeerConnection();
});

socket.on('user-joined', (data) => {
    if (!peer_connection) {
        createPeerConnections();
    }
    remote_peer_name = data.peer_name;
    remote_peer_id = data.peer_id;
    var receiver_peer_id = data.peer_id;
    console.log(receiver_peer_id + " joined the room");
    local_stream.getTracks().forEach(track => {
        peer_connection.addTrack(track, local_stream);
    });
    peer_connection.createOffer().then((offer) => {
        return peer_connection.setLocalDescription(offer);
    }).then(() => {
        console.log(peer_connection.localDescription);
        socket.emit('offer', {
            from: {
                name: peer_name,
                id: socket.id,
            },
            to: receiver_peer_id,
            type: 'offer',
            sdp: peer_connection.localDescription
        });
    }).catch((error) => {
        console.log(error);
    });
});

socket.on('offer', (data) => {
    remote_peer_name = data.from.name;
    remote_peer_id = data.from.id;
    peer_connection.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
        console.log(">>> Remote Description: ");
        console.log(peer_connection.remoteDescription);
        local_stream.getTracks().forEach(track => {
            peer_connection.addTrack(track, local_stream);
        });
    }).then(() => {
        return peer_connection.createAnswer();
    }).then(answer => {
        return peer_connection.setLocalDescription(answer);
    }).then(() => {
        console.log(peer_connection.localDescription);
        socket.emit('answer', {
            from: {
                name: peer_name,
                id: socket.id
            },
            to: remote_peer_id,
            type: 'answer',
            sdp: peer_connection.localDescription
        });
    }).catch((error) => {
        console.error(error);
    });
});

socket.on('answer', (data) => {
    remote_peer_name = data.from.name;
    remote_peer_id = data.from.is;
    console.log("Received Answer from " + remote_peer_id);
    peer_connection.setRemoteDescription(new RTCSessionDescription(data.sdp));
});

socket.on('user-left', (data) => {
    var left_user_id = data.peer_id;
    remote_peer_id = null;
    remote_peer_name = null;
    remote_video.srcObject = null;
    resetPeerConnection();
    resetMediaStreams();
    alert("User has left the Video Call !!");
    window.location.href = "/";
});

function resetPeerConnection() {
    if (peer_connection) {
        console.log(">>> Closing Peer Connection");
        peer_connection.onicecandidate = null;
        peer_connection.onnegotiationneeded = null;
        peer_connection.ontrack = null;

        peer_connection.close();
        peer_connection = null;
        console.log(">>> Peer Connection Closed");
    }
}

function resetMediaStreams() {
    if (local_stream) {
        console.log(">>> Closing MediaStream");
        local_stream.getTracks().forEach((track) => {
            track.stop();
        });
        local_stream = null;
        console.log(">>> MediaStream Closed");
    }
}