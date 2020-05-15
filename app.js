/* eslint-disable linebreak-style */
'use strict';
const CONST = require('./utils/const');
const FUNCTIONS = require('./utils/functions');

const ARGS = process.argv.slice(2);
const FS = require('fs');

if (CONST.DEBUG) {
  console.log('app.js: args:', ARGS);
}

try {
  // Get filePath
  const filePath = ARGS[0];
  if (CONST.DEBUG) {
    console.log('app.js: filePath:', filePath);
  }

  // If filePath is not null or undefined
  if (filePath) {
    // Try read the file
    try {
      FS.readFile(filePath, 'utf8', (error, data) => {
        // If error, display.
        if (error) {
          console.log('Error:', error);
          return;
        } else {
          // Proceed.
          FUNCTIONS.main(data);
        }
      });
    } catch (error) {
      console.log('Error:', error);
    }
  } else {
    console.log('Required a file path.');
  }
} catch (error) {
  console.log('Error:', error);
}
