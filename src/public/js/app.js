const socket = io();

const welcome = document.getElementById("welcome");
const nameForm = welcome.querySelector("#name");
const enterForm= welcome.querySelector("#enter");
const room = document.getElementById("room");



room.hidden=true;

let roomName;

function addMessage(msg){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText=msg;
    ul.appendChild(li);
}
function hanldeMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`You: ${value}`);
    }); 
    input.value="";
}
function handleNicknameSubmit(event){
    event.preventDefault();
    const input = welcome.querySelector("#name input");
    socket.emit("nickname", input.value);
    nameForm.hidden=true;
    const div = welcome.querySelector("div");
    div.innerText=`반갑습니다 ${input.value}님`;

}
nameForm.addEventListener("submit", handleNicknameSubmit);

function showRoom(msg){
    room.hidden=false;
    welcome.hidden = true;
    const h3 = room.querySelector("h3");
    h3.innerText= `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", hanldeMessageSubmit);
}

function hanldeRoomSubmit(event){
    event.preventDefault();
    const input = enterForm.querySelector("input");
    socket.emit("enter_room",input.value, showRoom  );
    roomName=input.value;
    input.value="";
}
enterForm.addEventListener("submit", hanldeRoomSubmit);

socket.on("welcome", (user)=>{
    addMessage(`${user}님이 입장하였습니다.` );
});
socket.on("bye", (left)=>{
    addMessage(` ${left}님이  나갔습니다.`);
});
socket.on("new_message", addMessage);