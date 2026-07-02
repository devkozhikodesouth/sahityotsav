const mongoose = require("mongoose");

const addTeamSchema = new mongoose.Schema({
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Festival",
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
});

const Team = mongoose.model("Team", addTeamSchema);
module.exports = Team;
