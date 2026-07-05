const mongoose=require('mongoose')
const startProgramSchema=new mongoose.Schema({
    startProgram:{
        type:Boolean,
        default:false,
        required:true
    }
})
const startProgramModel= mongoose.model("StartProgram", startProgramSchema)
module.exports=startProgramModel