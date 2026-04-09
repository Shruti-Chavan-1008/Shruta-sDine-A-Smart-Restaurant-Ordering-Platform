const mongoose=require('mongoose');
const Schema =mongoose.Schema;

const MenuSchema=new Schema({
    category:{
       type:String,
       enum:["veg","non-veg","drinks","desserts"],
       required:true,

    },
    image:String,
    title:{
        type:String,
        required:true,
    },
    description:String,
    Price:Number,
});

const Menu=mongoose.model("Menu",MenuSchema);
module.exports=Menu;