import { Router } from "express";
import { resolve,dirname } from "node:path"
import { fileURLToPath } from "node:url";;
import { Users } from "../db/index.db.js";  
import { auth } from "../middlewares/auth.middlewares.js";

const __dirname = (resolve(dirname(fileURLToPath(import.meta.url)),".."))

const router = Router();

router.get("/",(req,res)=>{
    // console.log(__dirname)
    res.sendFile(resolve(__dirname,"public","index.html"));
})

router.post("/",(req,res)=>{
    // console.log(__dirname + "hello")
    // console.log(req.body)
    if(!req.session.visited){
        req.session.visited = 1;
    }else{
        req.session.visited += 1;
    }

    const username = req.body.username;
    const roomId = req.body.roomId;

    const user = {
        username:username,
        roomId:roomId,
        sessionId:req.session.id
    }

    if(Users.has(user.username))
    {
        // console.log("Username already exisits!")
        res.status(400).json({"error":"Username already exisits!"})
    }
    Users.set(user.username,user);
    // console.log(Users.size);
    req.session.user = user
    res.status(200).redirect(`/${roomId}`)
})

router.get('/:roomNo',auth,(req,res)=>{
    res.sendFile(resolve(__dirname,"public","chatRoom.html"));
})

export default router

