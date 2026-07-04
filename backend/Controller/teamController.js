const Teams = require("../models/Team");
const mongoose = require("mongoose");
const TeamPoint = require("../models/teamPointModel");

const addTeam = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { teamName } = req.body;
    session.startTransaction();

    const teamData = await Teams.findOne({
      teamName,
    }).session(session);

    if (teamData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Team already added to this festival" });
    }

    const [newTeam] = await Teams.create(
      [{ teamName }],
      { session }
    );

    // Update TeamPoint for this festival
    let newTeamPoint = await TeamPoint.findOne().session(session);

    if (newTeamPoint) {
      newTeamPoint.results.push({ team: newTeam._id, point: 0 });
      await newTeamPoint.save({ session });
    } else {
      await TeamPoint.create(
        [
          {
            results: [{ team: newTeam._id, point: 0 }],
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      data: newTeam,
      message: "Team Name added successfully",
    });
  } catch (error) {
    console.error("Add team error:", error.message);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
};

const getTeam = async (req, res) => {
  try {
    const getTeam = await Teams.find();
    if (getTeam) {
      res.status(200).json({
        data: getTeam.reverse(),
        message: "Team Name fetched successfully",
      });
    } else {
      res.status(400).json({ message: "Failed to fetch teams" });
    }
  } catch (error) {
    console.error("Get teams error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTeam = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: "Invalid Team ID" });
    }

    session.startTransaction();
    const isTeamAvailable = await Teams.findOne({
      _id: teamId,
    }).session(session);

    if (isTeamAvailable) {
      await TeamPoint.findOneAndUpdate(
        {
          "results.team": teamId,
        },
        { $pull: { results: { team: teamId } } }
      ).session(session);

      await Teams.findOneAndDelete({
        _id: teamId,
      }).session(session);

      await session.commitTransaction();
      session.endSession();
      return res
        .status(200)
        .json({ success: true, message: "Team Deleted Successfully" });
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Team not found in this festival" });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete team error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const editTeam = async (req, res) => {
  try {
    const { teamId, teamName } = req.body;

    const existingTeam = await Teams.findOne({
      teamName,
    });
    if (existingTeam && existingTeam._id.toString() !== teamId) {
      return res
        .status(400)
        .json({ success: false, message: "Team name already exists" });
    }

    const savedTeam = await Teams.findOneAndUpdate(
      { _id: teamId },
      { teamName },
      { new: true }
    );

    if (!savedTeam) {
      return res
        .status(404)
        .json({ success: false, message: "Team Not Found" });
    } else {
      return res.status(200).json({
        data: savedTeam,
        message: "Team name updated successfully",
      });
    }
  } catch (error) {
    console.error("Edit team error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addTeam,
  getTeam,
  deleteTeam,
  editTeam,
};
