const mongoose = require("mongoose");

const addTeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
});

const Team = mongoose.model("Team", addTeamSchema);
module.exports = Team;
