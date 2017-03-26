var express = require('express');
var router = express.Router();
var Programs = require('../models/Programs.js');


/**
 * Gets a program from the database.
 */
router.post('/getProgram', function(req, res, next) {
    Programs.getProgram(req.body.programName, function(data) {
        res.status(data.status).json(data.data);
    });
});

/**
 * Saves a program.
 */
router.post('/saveProgram', function(req, res, next) {
  Programs.saveProgram(req.body.programName, req.body.data, function(result) {
    res.status(result.status).json({success: result.success});
  });
});

/**
 * Deletes a program.
 */
router.post('/deleteProgram', function(req, res, next) {
  Programs.deleteProgram(req.body.programName, function(result) {
    res.status(result.status).json({success: result.success});
  });
});

/**
 * Lists all programs in the database.
 */
router.get('/listPrograms', function(req, res, next) {
  Programs.listPrograms(function(result) {
    res.status(result.status).json({programs: result.programs});
  });
});

module.exports = router;	