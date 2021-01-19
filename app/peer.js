class Peer {
	constructor(peer_name, peer_id, peer_conn_info) {
		this.peer_name = peer_name;
		this.peer_id = peer_id;
		this.peer_conn_info = peer_conn_info;
	}

	getPeerID() {
		return this.peer_id;
	}

	getPeerConnInfo() {
		return this.peer_conn_info;
	}
}


module.exports = Peer;