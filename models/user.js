const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/userDB")
.then(()=>{
    console.log("successfully");
})
.catch((err)=>{
    console.log(err);
})

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})


const userDB = mongoose.model("users", userSchema)


module.exports = userDB