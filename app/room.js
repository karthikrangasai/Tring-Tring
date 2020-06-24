var _ = require('lodash');

class Room {
    constructor(room_id, room_pass) {
        this.room_id = room_id;
        this.room_pass = room_pass;
        this.no_of_peers = 2;
        this.peers = {};
    }

    addPeer(peer, peer_id) {
        if (Object.keys(this.peers).length < 2) {
            this.peers[peer_id] = peer;
            return true;
        }
        return false;
    }

    isEmpty() {
        return (Object.keys(this.peers).length === 0);
    }

    space() {
        return (2 - Object.keys(this.peers).length);
        // console.log(">>> Current Length of peers array is: " + this.peers.length);
        // return (2 - this.peers.length);
    }

    deletePeer(peer_id) {
        // this.peers = _.remove(this.peers, (peer) => {
        //     return (peer.peer_id === peer_id);
        // });
        return (delete this.peers[peer_id]);
    }

    passwordMatches(password) {
        return (this.room_pass === password);
    }

    currentRoomSize() {
        return Object.keys(this.peers).length;
    }
}

module.exports = Room;