export const auth = async (req,res,next) => {
    // console.log("Auth middleware! for HTTP")
    if(!req.session.user){
        return res.status(401).json({
            "error":"UnAuthorized access",
            "message":"First get your username"
        })
    }

    if(req.session.user.roomId != req.params.roomNo){
        return res.status(401).json({
            "error":"UnAuthorized access",
            "message":"RoomId not matching with the params"
        })
    }
    next()
}