/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
'use strict';

const CONST = require('./const');
const request = require('request');
const handlebars = require('handlebars');

// Variable for the combined JSON objects.
let DATA = {};

// Main method
const main = async (fileData) => {
  if (CONST.DEBUG) {
    console.log('functions.main: fileData:', fileData);
  }

  if (!fileData) {
    return 'Error: Invalid fileData.';
  }

  try {
    const fileDataParsed = JSON.parse(fileData);
    if (CONST.DEBUG) {
      console.log('functions.main: fileDataParsed:', fileDataParsed);
    }

    if (fileDataParsed) {
      const {agents} = fileDataParsed;
      if (CONST.DEBUG) {
        console.log('functions.main: agents:', agents);
      }

      // Error checking
      if (agents && agents.length > 0) {
        // Variable for events
        const allEvents = [];
        let eventOBJ = {};
        // Loop over agents
        for (const agent of agents) {
          if (CONST.DEBUG) {
            console.log('functions.main: agent:', agent);
          };

          const {type} = agent;
          let outputEvent = '';
          // Check for which agent method we should envoke.
          if (type == CONST.AGENTS.TYPE_HTTP) {
            outputEvent = await httpEvent(agent, allEvents);
          } else if (type == CONST.AGENTS.TYPE_PRINT) {
            outputEvent = printEvent(agent, allEvents);
          } else {
            // Continue
          }

          // Add to event list.
          allEvents.push(outputEvent);
          eventOBJ = {
            'events': allEvents,
          };
        };
      }
    }
  } catch (error) {
    console.log('Error:', error);
  }

  if (CONST.DEBUG) {
    console.log('functions.main: DATA:', DATA);
  };
};

/* HttpEvent Function. */
// Takes in an agent and makes a httpEvent request.
const httpEvent = async (agent, inputEvent) =>{
  const {type, name} = agent;
  let outputEventValue = '';
  if (agent.options && agent.options.url) {
    const {url} = agent.options;
    const response = await makeRequest(url);
    if (CONST.DEBUG) {
      console.log('functions.main: response:', response);
    };
    if (response) {
      // Adding response to global DATA variable
      const resOBJ = `{"${name}" : ${response}}`;
      const _resOBJ = JSON.parse(resOBJ);
      outputEventValue = JSON.parse(response);
      DATA = {...DATA, ..._resOBJ};
    }
  } else {
    console.log(`Error, Agent of type ${type} has no URL`);
  }

  // Returing the event details
  const outputEvent = {
    [type]: outputEventValue,
  };
  return outputEvent;
};

/* printEvent Function. */
// Takes in an agent and prints a message.
const printEvent = (agent, inputEvent)=>{
  const {type} = agent;
  let displayMessage = '';
  if (agent.options && agent.options.message) {
    const {message} = agent.options;
    displayMessage = interpolateMessage(message);
    console.log(displayMessage);
  } else {
    console.log(`Error, Agent of type ${type} has no Message.`);
  }

  // Returing the event details
  const outputEvent = {
    [type]: displayMessage,
  };
  return outputEvent;
};


/* interpolateMessage Function. */
// Takes in a String, test to see if we need to modify it.
const interpolateMessage = (string) => {
  if (!string) {
    return null;
  }

  if (string.includes('{{') && string.includes('}}')) {
    const template = handlebars.compile(string);
    const interpolatedString = template(DATA);
    return interpolatedString;
  } else {
    return string;
  }
};


// Makes the HttpRequest
const makeRequest = (url) =>{
  const interpolatedURL = interpolateMessage(url);
  let res;
  return new Promise((resolve, reject) => {
    if (interpolatedURL) {
      try {
        request(interpolatedURL, function(error, response, body) {
          if (response && response.statusCode == 200) {
            res = body;
            resolve(res);
          } else {
            reject(new Error('Unable to make request.'));
          }
        });
      } catch (error) {
        reject(new Error('Unable to make request. Err:', error));
      }
    } else {
      reject(new Error('Unable to make request.'));
    }
  });
};

module.exports = {main, interpolateMessage};
