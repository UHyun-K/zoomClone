
const socket = io();


const myFace = document.getElementById("myFace");
const peerFace = document.getElementById("peerFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const chatForm = document.getElementById("chatForm");
call.hidden=true;

let myStream;
let muted= false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;
let myMessage;

async function getCameras(){
try{
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device=>device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera)=>{
        const option = document.createElement("option");
        option.value = camera.deviceId;
        option.innerText= camera.label;
        camerasSelect.appendChild(option);
    })
    if(currentCamera.label === camera.label){
        option.selected = true;
    }
}catch(e){
    console.log(e)
}
}
async function getMedia(deviceId){
    const initalConstraints = {
        audio:true,
        video:{facingMode: "user"},
    };
    const cameraConstraints={
        audio: true,
        video: { deviceId : { exact: deviceId } }
    }
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initalConstraints
            );
        myFace.srcObject = myStream;
        if(!deviceId){ //at first 
            await getCameras();
        }

    }catch(e){
        console.log(e);
    }
}



function handleMuteClick (){

    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
 if(!muted){
     muteBtn.innerText = "Unmute"
     muted = true;
 }else{
     muteBtn.innerText = "Mute";
     muted = false;
 }

}
function handleCameraClick (){ 
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtn.innerText ="camera Off"
        cameraOff = false;
    }else{
        cameraBtn.innerText ="camera On"
        cameraOff = true;

    }
}
async function handleCameraChange(){
    await getMedia(camerasSelect.value);
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
          .getSenders()
          .find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
      }
}
muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function  initCall ( ) {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


//Chat 
function addMessage(msg,name){
    const chatContainer = document.getElementById("chatContainer");
    const ul = chatContainer.querySelector("ul");
    const li = document.createElement("li");
    const span1 = document.createElement("span");
    const span2 = document.createElement("span");


    span1.innerText=name;
    span2.innerText=msg;

    ul.appendChild(li);
    li.appendChild(span1);
    li.appendChild(span2);
}
function handleChat(event){
    event.preventDefault();
    const chatInput =chatForm.querySelector("input");
    const message = chatInput.value;
    addMessage(message,"Me :  ");
    chatInput.value="";
   try{
       myDataChannel.send(message);
   }catch(e){
       console.log(e);
   }
}

chatForm.addEventListener("submit", handleChat);

// Socket Code

function handleMessage(event){
    const msg = event.data;
    addMessage(msg,"The person :  ");
}
socket.on("welcome", async() => {//this code only loading first browser ..peerA
    myDataChannel =myPeerConnection.createDataChannel("chat"); //채널명
    myDataChannel.addEventListener("message",handleMessage); 
    const offer = await myPeerConnection.createOffer(); //make invitation to other browser to join
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
});

socket.on("offer",async (offer)=>{ //peerB
    myPeerConnection.addEventListener("datachannel", (event)=>{
        myDataChannel= event.channel;
        myDataChannel.addEventListener("message", handleMessage);
    });
    console.log("received offer")
    myPeerConnection.setRemoteDescription(offer);
    const answer =  await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
})

socket.on("answer", (answer)=>{
    console.log("received the answer")
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice)=>{
    console.log("received  candidate");
    myPeerConnection.addIceCandidate(ice);
})
socket.on("bye",()=>{
    addMessage("Someone left","");
    peerFace.hidden= true;
})
// RTC Code
function   makeConnection(){
    myPeerConnection = new RTCPeerConnection({//crate peer to peer connection
        iceServers: [ //stun server from google
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      }); 
    myPeerConnection.addEventListener("icecandidate", handleIce); //after making peerConnection , listen ice candidate
    myPeerConnection.addEventListener("track", handleAddStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream)); //put data inside peer connection
}

function handleIce(data){
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);

}
function handleAddStream(data) {
    peerFace.srcObject = data.streams[0];
  }