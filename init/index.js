const mongoose=require('mongoose');
const initData=require('./data.js');
const Menu=require("../models/menu.js");

const MONGO_URL="mongodb://127.0.0.1:27017/hotel"


main().then(()=>{
  console.log("datebase is connected");
});
async function main(){
    await mongoose.connect(MONGO_URL)
}

const intiDB=async ()=>{
await Menu.deleteMany({ });
await Menu.insertMany(initData.data);
console.log("data is initized");
};

intiDB();