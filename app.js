const express=require('express');
const app=express();
const mongoose=require('mongoose');

const MONGO_URL="mongodb://127.0.0.1:27017/hotel"

async function main(){
    await mongoose.connect(MONGO_URL)
};

app.set("view engine",'ejs');

app.get("/",(req,res)=>{
    res.send("hi i am root")
})

app.listen(8080,(req,res)=>{
    console.log("server is listing on 8080")
});