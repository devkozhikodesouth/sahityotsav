const mongoose= require('mongoose')
const itemSchema= new mongoose.Schema({
    itemName:{
        type:String,
        required:true
    },
    categoryName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    }
})

const Item= mongoose.model('Item',itemSchema)
module.exports=Item