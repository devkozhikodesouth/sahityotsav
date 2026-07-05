const mongoose = require("mongoose");

const TeamPointSchema = new mongoose.Schema({
    results: [ 
      {
       team:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Team',
        required:true
       },
       point:{
        type:String,
        default:0
       }
      }
    ],
    afterCount:{
       type:String,
        default:0,
        required:true
    }
  });
  
  const TeamPoint = mongoose.model("TeamPoint", TeamPointSchema);
  module.exports = TeamPoint;