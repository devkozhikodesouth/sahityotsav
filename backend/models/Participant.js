const mongoose = require("mongoose");

const ParticipantCompetitionSchema = new mongoose.Schema({
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  competitionName: {
    type: String,
    required: true
  },
  result: {
    published: {
      type: Boolean,
      default: false
    },
    qualified: {
      type: Boolean,
      default: false
    },
    rank: {
      type: Number
    },
    grade: {
      type: String
    },
    point: {
      type: Number
    }
  },
  prize: {
    exists: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    },
    isCollected: {
      type: Boolean,
      default: false
    }
  }
});

const ParticipantSchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true
    },
    chestNumber: {
      type: String,
      required: true,
      trim: true
    },
    dob: {
      type: String, // Format: YYYY-MM-DD
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },
    category: {
      type: String,
      required: true
    },
    teamName: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      default: ""
    },
    eventName: {
      type: String,
      default: ""
    },
    competitions: [ParticipantCompetitionSchema]
  },
  { timestamps: true }
);

// Composite index: chestNumber must be unique within a single festival
ParticipantSchema.index({ festivalId: 1, chestNumber: 1 }, { unique: true });

const Participant = mongoose.model("Participant", ParticipantSchema);

module.exports = Participant;
