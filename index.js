// Setup my server (express, jsonwebtoken, dotenv)
const express=require("express")
const jwt=require("jsonwebtoken")
require("dotenv").config();

const app=express();
const PORT=process.env.PORT;
const SECRET=process.env.SECRET;
//Extracting json data and keeping it inside req.body
app.use(express.json());
//Middleware for verifiying token

function tokenVerify(req,res,next){
    const tokenHeader=req.headers.authorization;
    // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJha2FzaCIsInJvbGUiOiJmYWN1bHR5IiwiaWF0IjoxNzc1NjI3MjA4LCJleHAiOjE3NzU2MzA4MDh9.UE2ZxFbsP2r3WoJGXTrH0Sl1S_QJk-TtaXTEuiEB1j0"
    const token=tokenHeader.split(" ")[1];
    try{
        const decode=jwt.verify(token,SECRET);
        req.user=decode;
        next();
    }catch(err){
        res.json({message:"Invalid Token"})
    }
}

function authCheck(){
    const roles=Array.from(arguments);
    //["admin","faculty"]
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            res.json({message:"Unauthorized"})
        }
        next();
    }
}

//Dummy Database
const user={
    id:1,
    username:"akash",
    password:"123",
    role:"faculty"
}

app.post("/login",(req,res)=>{
    const {username,password}=req.body;
    if(username===user.username && password===user.password){
        const token=jwt.sign(
            {
                id:user.id,
                username:user.username,
                role:user.role
            },
            SECRET,
            {
                expiresIn:"1h"
            }
        )
        return res.json({token});
    }
    res.json({message:"Username or password is incorrect"})
});

app.get("/faculty",tokenVerify,authCheck("admin","faculty"),(req,res)=>{
    res.send("Hello Faculty");
});

app.get("/student",tokenVerify,authCheck("student","faculty"),(req,res)=>{
    res.send("Hello Student");
})

app.listen(PORT,()=>{
    console.log("Server running on port "+PORT);
})

// Protected-Routes (/faculty -> only faculties allowed)
// Protected Routes (/student -> only students allowed)
// Middlewares for tokenVerification and Authorization