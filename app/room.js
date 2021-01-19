var _ = require('lodash');

class Room {
	constructor(room_id, room_pass) {
		this.room_id = room_id;
		this.room_pass = room_pass;
		this.max_peers = 2;
		this.no_of_peers = 0;
		this.peers = {};
	}

	addPeer(peer, peer_id) {
		if (Object.keys(this.peers).length < this.max_peers) {
			this.peers[peer_id] = peer;
			this.no_of_peers = Object.keys(this.peers).length;
			return true;
		}
		return false;
	}

	isEmpty() {
		return (Object.keys(this.peers).length === 0);
	}

	hasSpace() {
		return (Object.keys(this.peers).length < this.max_peers);
		// return (this.max_peers - Object.keys(this.peers).length);
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