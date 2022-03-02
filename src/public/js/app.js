const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
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
    const input = room.querySelector("input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`You ${value}`);
    }); 
    input.value="";
}
function showRoom(msg){
    room.hidden=false;
    welcome.hidden = true;
    const h3 = room.querySelector("h3");
    h3.innerText= `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", hanldeMessageSubmit);
    nameForm.addEventListener("submit", hanldeNicknameSubmit);

}

function hanldeRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",input.value, showRoom  );
    roomName=input.value;
    input.value="";
}
form.addEventListener("submit", hanldeRoomSubmit);

socket.on("welcome",()=>{
    addMessage("Someone Joined!")
});
socket.on("bye",()=>{
    addMessage("Someone Left!")
});
socket.on("new_message", addMessage);