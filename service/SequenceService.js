'use strict';


/**
 * Add a new sequence
 * 
 *
 * body FeatureSequence sequence
 * no response value expected for this operation
 **/
exports.addSequence = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Find multiple sequence by ID
 * Returns a single sequence
 *
 * ids String List of IDs comma seperated
 * returns FeatureSequence
 **/
exports.getMultipleSequencesById = function(ids) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "sequence" : "ACTG",
  "id" : "id",
  "type" : "AA"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Find sequence by ID
 * Returns a single sequence
 *
 * id String ID of sequence
 * returns FeatureSequence
 **/
exports.getSequenceById = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "sequence" : "ACTG",
  "id" : "id",
  "type" : "AA"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

