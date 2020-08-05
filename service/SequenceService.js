'use strict';

var fs = require('fs');
const DATA_DIR = './data'

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
      const mk = await new Promise((res, rej) => {
        fs.mkdir(path, { mode: 755 }, (err) => {
          if (err) {
            rej('ERROR_TO_CREATE');
          }
          res('CREATED');
        });
      })
      if (mk === 'CREATED') {
        resolve()
      } else {
        reject(mk)
      }
    }
    else if (chk === 'EXIST') {
      resolve();
    }
  })
}

function storeSequence(baseDir, seqId, sequenceObject) {
  return new Promise(async (resolve, reject) => {
    const subPathLv1 = makePath(baseDir, seqId, 1)
    const subPathLv2 = makePath(baseDir, seqId, 2)

    await createOrIgnoreSubPath(subPathLv1)
    await createOrIgnoreSubPath(subPathLv2)

    saveToFile(subPathLv2, seqId, sequenceObject)
    .then(() => {
      resolve()
    })
    .catch((errStore) => {
      console.error(errStore)
      reject({code: 500, response: 'Error in storing file'})
    })
  })
}

function saveToFile(filePath, seqId, sequenceObject) {
  return new Promise((resolve, reject) => {
    fs.open(`${filePath}/${seqId}`, 'w', (err, fd) => {
      if (err) {
        if (err.code === 'EEXIST') {
          // already exist. it is okay. continue
          resolve()
        }
        reject(err)
      }
      // write one
      fs.write(fd, JSON.stringify(sequenceObject), (err, written) => {
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
  })
}

function readSequence(path, id) {
  // console.log(`checking .. ${path}${id}`)
  return new Promise((resolve, reject) => {
    fs.readFile(`${path}${id}`, {encoding: 'utf8'}, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          reject('FILE_NOT_EXIST')
        }
        reject('FILE_READ_ERROR')
      }
      resolve(JSON.parse(data))
    })
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
  return storeSequence(DATA_DIR, body.id, body)
}

/**
 * Add new sequences
 *
 *
 * body ArrayOfFeatureSequence sequences
 * no response value expected for this operation
 **/
exports.addMultipleSequences = function(body) {
  return new Promise(async (resolve, reject) => {
    await Promise.all(body.map((sequenceObject) => {
      return storeSequence(DATA_DIR, sequenceObject.id, sequenceObject)
    }))

    resolve()
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
  const idList = ids.split(',')

  return new Promise(async (resolve, reject) => {
    const seqs =  await Promise.all(idList.map((id) => {
      return readSequence(makePath(DATA_DIR, id, 2), id).catch(err => ({id: id, sequence: ''}))
    }))

    var examples = {'application/json': seqs}

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
    const path = makePath(DATA_DIR, id, 2)
    readSequence(path, id)
    .then((sequence) => {

      const examples = {'application/json': sequence}

      resolve(examples[Object.keys(examples)[0]]);
    })
    .catch((err) => {
      // handle http error
      reject({code: 404, response: `Sequence ${id} not found`})
    })
  });
}

