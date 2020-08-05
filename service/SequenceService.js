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
      fs.mkdir(path, { mode: 755 }, (err) => {
        if (err) {
          console.error(err)
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

function storeSequence(path, id, data) {
  return new Promise((resolve, reject) => {
    fs.open(`${path}/${id}`, 'w', (err, fd) => {
      if (err) {
        if (err.code === 'EEXIST') {
          // already exist. it is okay. continue
          resolve()
        }
        reject(err)
      }
      // write one
      fs.write(fd, data, (err, written, string) => {
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
      resolve({id: id, sequence: data})
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
  return new Promise((resolve, reject) => {
    const seqId = body.id
    const subPathLv1 = makePath('./data', seqId, 1)
    const subPathLv2 = makePath('./data', seqId, 2)

    createOrIgnoreSubPath(subPathLv1)
    .then(
      createOrIgnoreSubPath(subPathLv2)
      .then(
        storeSequence(subPathLv2, seqId, body.sequence)
        .then(() => {
          resolve()
        })
        .catch((errStore) => {
          console.error(errStore)
          reject({code: 500, response: 'Error in storing file'})
        })
      )
      .catch((errLv2) => {
        // error related creating second level dir
        console.error(errLv2)
        reject({code: 500, response: 'Error in creating direcotry'})
      })
    ).catch((errLv1) => {
      // error related creating first level dir
      console.error(errLv1)
      reject({code: 500, response: 'Error in creating direcotry'})
    })
  })
}

/**
 * Add new sequences
 *
 *
 * body ArrayOfFeatureSequence sequences
 * no response value expected for this operation
 **/
exports.addMultipleSequences = function(body) {
  return new Promise((resolve, reject) => {
    // expect mutiple sequences
    const sequences = body.sequences
    console.log(sequences)
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
      return readSequence(makePath('./data', id, 2), id).catch(err => ({id: id, sequence: ''}))
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
    const path = makePath('./data', id, 2)
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

