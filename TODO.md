# LIST OF TODOs

- [x] Make the web app heroku compatible
- [x] Work on the Media Controls that toggle inputs before entering the call.
	- [ ] It is still buggy, needs a fix.
- [ ] Setup Decent UI using Material
- [x] Add password for Rooms (using Password should be Optional)
- [x] Show room details to all the users in the call (Use Pug templates)
	- [ ] Current Room Size display is buggy
- [ ] Add at will screen share ability
- [ ] Increase Call capacity to 4
	- Dictionary { socket id : { name, RTCPeerConnection Object }}
	- On user join
		- Create a Remote Video Calls container
		- Add an video element inside the call container
		- add to the Dictionary and initiate new Peer Connection with the new user and remote stream to the new video element
		- add on user disconnected to the RTCPeerConnection Object
		- Change the on user call disconnect to handle until two users are left
- [ ] Add face filters (Tensorflow.js ??)