'use strict';

var utils = require('../utils/writer.js');
var Sequence = require('../service/SequenceService');

module.exports.addSequence = function addSequence (req, res, next) {
  var body = req.swagger.params['body'].value;
  Sequence.addSequence(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.addMultipleSequences = function addMultipleSequences(req, res, next) {
  var body = req.swagger.params['body'].value;
  Sequence.addMultipleSequences(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
}

module.exports.getMultipleSequencesById = function getMultipleSequencesById (req, res, next) {
  var ids = req.swagger.params['ids'].value;
  Sequence.getMultipleSequencesById(ids)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getSequenceById = function getSequenceById (req, res, next) {
  var id = req.swagger.params['id'].value;
  Sequence.getSequenceById(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
