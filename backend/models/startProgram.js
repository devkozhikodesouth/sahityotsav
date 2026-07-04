const mongoose=require('mongoose')
const startProgramSchema=new mongoose.Schema({
    festivalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Festival",
        required: false,
    },
    startProgram:{
        type:Boolean,
        default:false,
        required:true
    }
})
const startProgramModel= mongoose.model("StartProgram", startProgramSchema)
module.exports=startProgramModel