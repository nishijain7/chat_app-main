import express from "express";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import session from "express-session";
import { Users } from "./db/index.db.js";
import { askGemini } from "./gemini.js";
import dotenv from "dotenv"

dotenv.config()

const __dirname = resolve(fileURLToPath(import.meta.url),"..")

const app = express();
const server = createServer(app);
const io = new Server(server,{
    connectionStateRecovery:{}
});

const sessionMiddleware = session({
    secret:"mySecretKey",
    saveUninitialized:true,
    resave:false,
})




app.use(express.static(resolve(__dirname,"public")));
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(sessionMiddleware)

import router from "./routes/index.routes.js";
app.use("/",router)


io.engine.use(sessionMiddleware)

io.use((socket,next)=>{
    // console.log("Auth middleware! for Socket")
    if(!socket.request.session.user){
        // dont let the socket connection to happen
        return next(new Error("UnAuthorized Access!"))
    }
    next()
})

io.on('connection',(socket)=>{
    console.log("User connected!: ")
    const user = socket.request.session.user
    console.log(user)

    if(!user){
        socket.emit("disconnet")
    }


    const roomNo = user.roomId 
    socket.join(roomNo);

    user.noOfUsersInRoom = getNoOfUsersInRoom(socket);
    console.log(`${user.username} visited : ${socket.request.session.visited} times!`)
    if(socket.request.session.visited == 1){
        socket.to(roomNo).emit("joined",user)
    }

    socket.on("chatMessage",(msg)=>{
        // console.log(`${socket.id} : ${msg}`);
        msg.user = user;
        io.to(roomNo).emit("chatMessage",msg)
    })

    socket.on("getNoOfUsers",()=>{
        socket.emit("updateNoOfUsers",getNoOfUsersInRoom(socket))
    })

    socket.on("disconnect",()=>{
        io.to(user.roomId).emit("left",user)
        Users.delete(user.username)
        console.log("User disconnected!",user.username)
    })

    socket.on("currentUsersList",()=>{
        socket.emit("currentUsersList",getAllUserNamesInRoom(user.roomId))
    })

    socket.on("askAI",async (msg)=>{
        // console.log(`Recieved for AI : ${msg}`)
        // let n = msg.length
        // msg[n-1].user = user;
        const geminiResponse = await askGemini(JSON.stringify(msg))
        // msg.user.username="GEMINI AI"
        // msg.content = geminiResponse;
        io.to(roomNo).emit("aiResponse",geminiResponse)
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})


function getNoOfUsersInRoom(socket){
    const user = socket.request.session.user
    const roomNo = user.roomId
    // if (io.sockets.adapter.rooms.get(roomNo)) {
    //     console.log(io.sockets.adapter.rooms.get(roomNo));
    // } else {
    //     console.log('Room does not exist');
    // }    
    const numUsers = io.sockets.adapter.rooms.get(roomNo)?.size || 1;
    return numUsers
}

function getAllUsersInRoom(roomId){
    // console.log("getAllUsersInRoom : " + roomId)
    let usersInRoom = []
    for(let [key,value] of Users){
        // console.log(`${key} , ${value}`)
        if(value.roomId == roomId){
            usersInRoom.push(value)
        }
    }
    return usersInRoom
}

function getAllUserNamesInRoom(roomId){
    const allUsers = getAllUsersInRoom(roomId)
    let usernames = []
    for(let user of allUsers){
        usernames.push(user.username)
    }
    return usernames
}