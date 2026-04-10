const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const Menu = require('./models/menu');
const ejsMate=require('ejs-mate');



const MONGO_URL="mongodb://127.0.0.1:27017/hotel"


main().then(()=>{
  console.log("datebase is connected");
});
async function main(){
    await mongoose.connect(MONGO_URL)
}

app.set("view engine",'ejs');
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
 
app.engine('ejs',ejsMate);
 

app.get("/hero",(req,res)=>{
     res.render("hero.ejs");
});

app.get("/Menu", async(req,res)=>{
   const allMenus= await Menu.find();
   res.render("menu.ejs",{ allMenus });
    
});

app.get("/category",(req,res)=>{
    res.render("category");

});
app.get("/Menu/new",(req,res)=>{
    res.render("new");
});
app.post("/Menu",async(req,res)=>{
   const newMenu=new Menu(req.body);
   await newMenu.save();
   res.redirect("/category");
 
});
app.get("/Menu/:category",async(req,res)=>{
    const category= req.params.category;
    const allMenus= await Menu.find({ category:category });
    res.render("menu",{ allMenus });
    
});

 
     
app.get("/menu/new",(req,res)=>{
    res.render("New.ejs");
});
 

app.listen(8080,(req,res)=>{
    console.log("server is listing on 8080")
});