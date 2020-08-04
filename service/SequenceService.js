'use strict';

var fs = require('fs');

function makePath(baseDir, seqId, level) {
  if (level === 2) {
    return `${baseDir}/${seqId.substr(0, 2)}/${seqId.substr(2, 2)}/`
  } else if (level == 1) {
    return `${baseDir}/${seqId.substr(0, 2)}/`
  } else {
    return `${baseDir}/`
  }
}

function createOrIgnoreSubPath(path) {
  return new Promise(async (resolve, reject) => {
    const chk = await new Promise((res, rej) => {
      fs.access(path, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err) {
          if (err.code == 'ENOENT') {
            res('NEED_TO_CREATE');
          }
          rej(err);
        }
        res('EXIST');
      });
    });
    if (chk === 'NEED_TO_CREATE') {
      fs.mkdir(path, { mode: 755 }, (err_1) => {
        if (err_1) {
          reject(`Error in creating ${path}`);
        }
        resolve();
      });
    }
    else if (chk === 'EXIST') {
      resolve();
    }
  })
}

/**
 * Add a new sequence
 * 
 *
 * body FeatureSequence sequence
 * no response value expected for this operation
 **/
exports.addSequence = function(body) {
  return new Promise(function(resolve, reject) {
    const seqId = body.id
    const subPathLv1 = makePath('./data', seqId, 1)
    const subPathLv2 = makePath('./data', seqId, 2)

    createOrIgnoreSubPath(subPathLv1).then(
      createOrIgnoreSubPath(subPathLv2).then(() => {
        // saving sequence in file
        fs.open(`${subPathLv2}/${seqId}`, 'w', (err, fd) => {
          if (err) {
            if (err.code === 'EEXIST') {
              // already exist. it is okay. continue
              resolve()
            }
            reject(err)
          }
          // write one
          fs.write(fd, body.sequence, (err, written, string) => {
            if (err) {
              reject(err)
            }
            if (written > 0) {
              resolve()
            } else {
              reject("something wrong in file size")
            }
            reject("something went wrong")
          })
        })
      }).err((errLv2) => {
      // error related creating second level dir
      reject(errLv2)
    })
    ).err((errLv1) => {
      // error related creating first level dir
      reject(errLv1)
    })
  })
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
  console.log(`received request: ${id}`)
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

