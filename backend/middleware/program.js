const startProgramModel = require('../models/startProgram');

const checkProgramStarted = async (req, res, next) => {
  try {
    const program = await startProgramModel.findOne({});

    // Create initial document with startProgram: false if not exists
    if (program && program.startProgram === false) {
      // Program is NOT started, proceed to next middleware or route
      next();
    } else if (!program) {
      // No program state yet, create one and proceed
      await startProgramModel.create({ startProgram: false });
      next();
    } else {
      // Program is started, prevent changes
      return res.status(403).json({
        success: false,
        message: 'Program is started. Modification is locked.',
      });
    }
  } catch (error) {
    console.error('Error checking program status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking program status.',
    });
  }
};

module.exports = checkProgramStarted;
