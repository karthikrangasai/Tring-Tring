# A Minimal Peer to Peer One to One Video Call
Am implementation of a simple 1-1 Video Calling Web App

## Technologies Used:
- NodeJS : For Signalling Server and Web Backend
- WebRTC : To implement the Video Call Part

## Working of the App
### Room Object
Defines a Room Object used in the server side where two peers can join to start a Video Call.&nbsp;
- Integer : room_id
- Integer : max number of Users
- JSON(Peer ID : Peer)

### Peer Object
Defines a Peer Object in the server to save the details of a Peer for further use.&nbsp;
- String : Peer Name
- String : Peer ID
- Socket : Peer Connection Object

### Frontend
#### On GET '/' :
- Create New Room : Lets user create a Room ID and join one.&nbsp;
	- Generate Random number => Room ID (Must be unique)
	- Go to '/r/room_id/'
- Join Existing Room : Lets a user join an existing room created by another peer.&nbsp;
	- Enter Room ID
	- Go to '/r/room_id/'

#### On GET '/r/room_id/' :
- Get Room ID from window.location.href
- Take a Name as input for Peer
- Get User Media for Demo display
- Create Socket Connection on Global NameSpace
- Can Show existing members of the room
- On Join :
	- Emit 'join' message with room_id and peer_name
	- Get User Media for Local Stream and Local Video
	- Create RTCPeerConnection
	- Listen to Signalling Server :
		- 'user-arrived' : Create Offer and Send
		- 'offer' : Add Remote SDP to self and Create Answer and Send
		- 'answer' : Add Remote SDP to self and Start sedning streams
		- 'cut-the-call' : Close RTCPeerConnection and MediaStream and redirect to main page


## Backend
- Create Express App
- Create a Socket to listen
### Server Requests :
- '/' : Render index.html
- '/r/:room_id/' :
	- If Room Exists : Render videocall.html ? Render index.html
### Socket Messages :
- 'create-room' :
	- If Empty Room with that Room ID exists : return the URL for that room
	- Else :
		- Create Room and on No error : return the URL for that room
		- If error : Ask to create again
- 'join' :
	- If Room is Empty :
		- Create Peer Obj and Add socket to Room
	- Else If Room Not Empty
		- If has Space : 
			- Create Peer Obj and Add socket to Room
			- Broadcast to other users in the room 'user-arrived' with peer_id
		- Else
			- Emit 'full-room'
- 'offer' :
	- Emit to added user the Offer
- 'answer :
	- Emit to added user the Answer
- 'cut-the-call' :
	- Remove Peer Obj and delete socket from the room