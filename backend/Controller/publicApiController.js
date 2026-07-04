const Result = require("../models/resultModel");
const TeamPoint = require("../models/teamPointModel");
const Team = require("../models/Team");
const Participant = require("../models/Participant");
const mongoose = require("mongoose");

// Helper to resolve team type dynamically from name if not stored explicitly
const getTeamTypeByName = (teamName) => {
  const name = (teamName || "").toLowerCase();
  if (name.includes("parallel") || name.includes("girls")) {
    return "Campus Girls Parallel";
  }
  if (name.includes("campus")) {
    return "Campus";
  }
  return "General";
};

// Mock Standings for Demo API Key
const demoStandings = [
  { name: "Team Alpha", point: 150, type: "General" },
  { name: "Team Beta", point: 125, type: "General" },
  { name: "Team Gamma", point: 80, type: "General" },
  { name: "Campus Girls parallel", point: 60, type: "Campus Girls Parallel" },
  { name: "Campus boys team", point: 45, type: "Campus" }
];

// Mock Competitions for Demo API Key
const demoCompetitions = [
  {
    id: "cm1234567890abcdef",
    name: "English Elocution",
    category: "High School",
    type: "Individual"
  },
  {
    id: "cm0987654321fedcba",
    name: "Group Song",
    category: "Junior",
    type: "Group"
  }
];

// Mock Results for Demo API Key
const demoIndividualResults = [
  {
    rank: 1,
    teamName: "Team Alpha",
    participantName: "Jane Doe",
    point: 10,
    grade: "A"
  },
  {
    rank: 2,
    teamName: "Team Beta",
    participantName: "John Smith",
    point: 7,
    grade: "A"
  },
  {
    rank: 3,
    teamName: "Team Gamma",
    participantName: "Bob Johnson",
    point: 5,
    grade: "B"
  }
];

const demoGroupResults = [
  {
    rank: 1,
    teamName: "Team Alpha",
    groupName: "Alpha Choral Group",
    leaderName: "Alice Jenkins",
    point: 15,
    grade: "A"
  },
  {
    rank: 2,
    teamName: "Campus boys team",
    groupName: "Campus Boys Chorus",
    leaderName: "David Miller",
    point: 12,
    grade: "A"
  }
];

// 1. GET /api/public/team-points
const getTeamPoints = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    const teamTypeName = req.query.teamTypeName;

    if (req.isDemo) {
      let filtered = [...demoStandings];
      if (teamTypeName) {
        filtered = filtered.filter(item => item.type.toLowerCase() === teamTypeName.toLowerCase());
      }
      if (limit > 0) {
        filtered = filtered.slice(0, limit);
      }
      // Map to remove type details before outputting to public client
      const mapped = filtered.map(t => ({ name: t.name, point: t.point }));
      return res.status(200).json({
        msg: "Team points fetched successfully",
        status: 200,
        data: mapped
      });
    }

    const festivalId = req.festival._id;

    // Default: limit is 0 (or unspecified). Return pre-computed standings.
    if (limit === 0) {
      const data = await TeamPoint.findOne({ festivalId }).populate("results.team");
      if (data && data.results && data.results.length > 0) {
        const validResults = data.results.filter(item => item.team);

        let filteredResults = validResults;
        if (teamTypeName) {
          filteredResults = validResults.filter(item => {
            const teamType = getTeamTypeByName(item.team.teamName);
            return teamType.toLowerCase() === teamTypeName.toLowerCase();
          });
        }

        const sorted = filteredResults.map(item => ({
          name: item.team.teamName,
          point: parseInt(item.point || 0, 10)
        })).sort((a, b) => b.point - a.point);

        return res.status(200).json({
          msg: "Team points fetched successfully",
          status: 200,
          data: sorted
        });
      } else {
        // Fallback: return empty array if no team points configured yet
        return res.status(200).json({
          msg: "Team points fetched successfully",
          status: 200,
          data: []
        });
      }
    }

    // Dynamic Standings: compile dynamically from the latest N results
    const results = await Result.find({ festivalId, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("result.winners.teamId");

    const pointsMap = {};

    results.forEach(resDoc => {
      resDoc.result.forEach(detail => {
        let pts = 0;
        if (detail.position === 1) pts = 5;
        else if (detail.position === 2) pts = 3;
        else if (detail.position === 3) pts = 1;

        detail.winners.forEach(winner => {
          const tName = winner.teamId?.teamName || winner.team;
          if (tName) {
            if (teamTypeName) {
              const teamType = getTeamTypeByName(tName);
              if (teamType.toLowerCase() !== teamTypeName.toLowerCase()) {
                return;
              }
            }
            pointsMap[tName] = (pointsMap[tName] || 0) + pts;
          }
        });
      });
    });

    const sortedStandings = Object.keys(pointsMap).map(name => ({
      name,
      point: pointsMap[name]
    })).sort((a, b) => b.point - a.point);

    res.status(200).json({
      msg: "Team points fetched successfully",
      status: 200,
      data: sortedStandings
    });
  } catch (error) {
    console.error("Public API getTeamPoints error:", error);
    res.status(500).json({
      msg: "Internal server error.",
      status: 500,
      additionalInfo: { error: error.message }
    });
  }
};

// 2. GET /api/public/competitions
const getCompetitions = async (req, res) => {
  try {
    if (req.isDemo) {
      return res.status(200).json({
        msg: "Published competitions fetched successfully",
        status: 200,
        data: demoCompetitions
      });
    }

    const festivalId = req.festival._id;

    // Find all results with published statuses
    const results = await Result.find({ festivalId, isPublished: true })
      .populate("category item");

    const data = results.map(r => {
      // Determine competition type - dynamically fall back to Individual
      let compType = "Individual";

      return {
        id: r.item?._id || r._id,
        name: r.item?.itemName || "Unknown Competition",
        category: r.category?.categoryName || "Unknown Category",
        type: compType
      };
    });

    res.status(200).json({
      msg: "Published competitions fetched successfully",
      status: 200,
      data
    });
  } catch (error) {
    console.error("Public API getCompetitions error:", error);
    res.status(500).json({
      msg: "Internal server error.",
      status: 500,
      additionalInfo: { error: error.message }
    });
  }
};

// 3. GET /api/public/competitions/:competitionId/results
const getCompetitionResults = async (req, res) => {
  try {
    const competitionId = req.params.competitionId;

    if (req.isDemo) {
      if (competitionId === "cm1234567890abcdef") {
        return res.status(200).json({
          msg: "Competition results fetched successfully",
          status: 200,
          data: demoIndividualResults
        });
      } else if (competitionId === "cm0987654321fedcba") {
        return res.status(200).json({
          msg: "Competition results fetched successfully",
          status: 200,
          data: demoGroupResults
        });
      } else {
        return res.status(404).json({
          msg: "Published result not found for this competition",
          status: 404,
          additionalInfo: {}
        });
      }
    }

    const festivalId = req.festival._id;

    // Look up by Item ID (competition ID is mapped from Item ID in list) or database ID
    let query = { festivalId, isPublished: true };
    if (mongoose.Types.ObjectId.isValid(competitionId)) {
      query.$or = [{ item: competitionId }, { _id: competitionId }];
    } else {
      query.item = competitionId;
    }

    const resultDoc = await Result.findOne(query)
      .populate("category item")
      .populate("result.winners.teamId");

    if (!resultDoc) {
      return res.status(404).json({
        msg: "Published result not found for this competition",
        status: 404,
        additionalInfo: {}
      });
    }

    const entries = [];

    resultDoc.result.forEach(detail => {
      const rank = detail.position;
      let point = 0;
      if (rank === 1) point = 5;
      else if (rank === 2) point = 3;
      else if (rank === 3) point = 1;

      detail.winners.forEach(winner => {
        entries.push({
          rank,
          teamName: winner.teamId?.teamName || winner.team || "Unknown Team",
          participantName: winner.name,
          point,
          grade: rank === 1 ? "A" : rank === 2 ? "A" : "B"
        });
      });
    });

    // Sort by rank ascending
    entries.sort((a, b) => a.rank - b.rank);

    res.status(200).json({
      msg: "Competition results fetched successfully",
      status: 200,
      data: entries
    });
  } catch (error) {
    console.error("Public API getCompetitionResults error:", error);
    res.status(500).json({
      msg: "Internal server error.",
      status: 500,
      additionalInfo: { error: error.message }
    });
  }
};

// 4. GET /api/public/participant-details
const getParticipantDetails = async (req, res) => {
  try {
    const { chestNumber, dob } = req.query;

    if (!chestNumber || !dob) {
      return res.status(400).json({
        msg: "Bad Request: chestNumber and dob parameters are required.",
        status: 400,
        additionalInfo: {}
      });
    }

    // Demo API key does not have a linked festival — reject this endpoint for demo keys
    if (req.isDemo || !req.festival) {
      return res.status(403).json({
        msg: "Forbidden: Participant details lookup is not available for demo API keys. Use a valid festival API key.",
        status: 403,
        additionalInfo: {}
      });
    }

    const festivalId = req.festival._id;

    // Search case-insensitively for the chestNumber and match dob
    const participant = await Participant.findOne({
      festivalId,
      chestNumber: { $regex: new RegExp(`^${chestNumber.trim()}$`, "i") },
      dob: dob.trim()
    });

    if (!participant) {
      return res.status(404).json({
        msg: "Participant details not found for the provided chest number and date of birth.",
        status: 404,
        additionalInfo: {}
      });
    }

    // Dynamic calculations from competitions array
    const competitions = participant.competitions || [];
    const totalCompetitions = competitions.length;
    const completedCompetitions = competitions.filter(c => c.result && c.result.published).length;
    const prizesWon = competitions.filter(c => c.prize && c.prize.exists && c.result && c.result.rank <= 3).length;
    const prizesPendingCollection = competitions.filter(c => c.prize && c.prize.exists && !c.prize.isCollected).length;

    res.status(200).json({
      msg: "Participant details fetched successfully",
      status: 200,
      data: {
        participant: {
          id: participant._id,
          chestNumber: participant.chestNumber,
          fullName: participant.fullName,
          gender: participant.gender,
          category: participant.category,
          teamName: participant.teamName,
          photo: participant.photo,
          eventName: participant.eventName || req.festival.name
        },
        competitionOverview: {
          totalCompetitions,
          completedCompetitions,
          prizesWon,
          prizesPendingCollection
        },
        competitions: competitions.map(c => ({
          competitionId: c.competitionId,
          competitionName: c.competitionName,
          result: c.result && c.result.published ? {
            published: true,
            qualified: c.result.qualified,
            rank: c.result.rank,
            grade: c.result.grade,
            point: c.result.point
          } : {
            published: false
          },
          prize: c.prize && c.prize.exists ? {
            exists: true,
            title: c.prize.title,
            isCollected: c.prize.isCollected
          } : {
            exists: false
          }
        }))
      }
    });
  } catch (error) {
    console.error("Public API getParticipantDetails error:", error);
    res.status(500).json({
      msg: "Internal server error.",
      status: 500,
      additionalInfo: { error: error.message }
    });
  }
};

module.exports = {
  getTeamPoints,
  getCompetitions,
  getCompetitionResults,
  getParticipantDetails
};
