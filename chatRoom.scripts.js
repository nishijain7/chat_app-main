const socket = io()

const inputMessageForm = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById('messages')

inputMessageForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    if(input.value){
        const message = {
            content : input.value
        }
        socket.emit("chatMessage",message);
        if(checkForAiMessage(input.value)){
            socket.emit("askAI",getAllMessages())
        }
        input.value='';
    }
})

window.addEventListener('load',(e)=>{
    updateRoomId()
    socket.emit("getNoOfUsers")
    socket.emit("currentUsersList")
})

socket.on("joined",(user)=>{
    addUserJoined(user)
    socket.emit("getNoOfUsers")
    socket.emit("currentUsersList")
})

socket.on("chatMessage",addMessage)

socket.on("updateNoOfUsers",(numUsers)=>{
    console.log("updateNoOfUsers " + numUsers)
    updateNoOfUsers(numUsers)
})

socket.on("currentUsersList",updateUsersList)

socket.on("left",(user)=>{
    addUserLeft(user)
    socket.emit("getNoOfUsers")
    socket.emit("currentUsersList")
})

socket.on("aiResponse",(aiResponse)=>{
    const msg = {
        user : {
            username : "GEMINI AI"
        },
        content : aiResponse
    }

    addMessage(msg)
})

function addMessage(msg){
    console.log(msg)
    const li = document.createElement("li")
    li.classList.add("message-block")
    li.innerHTML=`<div class="user-id">${msg.user.username}</div><div class='message-content'>${msg.content}</div>`
    messages.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
}

function addUserJoined(user){
    const div = document.createElement("div");
    div.classList.add("center-justified-text");
    div.textContent = `${user.username} joined the chat!`;
    messages.appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
}

function addUserLeft(user){
    const div = document.createElement("div");
    div.classList.add("center-justified-text");
    div.textContent = `${user.username} Left the chat!`;
    messages.appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
}

function updateNoOfUsers(noOfUsersInRoom){
    const no_of_users = document.getElementById("no of users")
    no_of_users.innerText = `Online Users : ${noOfUsersInRoom}`
}

function updateRoomId(){
    const roomIdElement = document.getElementById("room id")
    const roomId = window.location.pathname
    roomIdElement.innerText = `Room Id : ${roomId}`
}

function updateUsersList(usernames){
    console.log("updateUsersList")
    const usersListElement = document.getElementById("user-list")
    usersListElement.innerHTML=''
    usersListElement.innerText='Users: '
    for(let username of usernames){
        let span = document.createElement("span")
        span.innerText = `${username},`
        usersListElement.appendChild(span)
    }
}

function checkForAiMessage(msg){
    console.log(`checkForAiMessage : ${msg}`)
    const regex = /@ai/i; 
    return regex.test(msg); 
}

function getAllMessages(){
    const allMessagesElements = messages.children;
    // console.log(allMessages)
    const allMessages = []
    Array.from(allMessagesElements).forEach((e)=>{
        const username = e.querySelector(".user-id")?.innerText;
        const content = e.querySelector(".message-content")?.innerText;
        const message = {
            user:username,
            content:content
        }
        // console.log(message)
        allMessages.push(message)
    })
    // console.log(`allMessages : ${JSON.stringify(allMessages)}`)
    return allMessages
}