import axios from 'axios';

var vorpal = require('vorpal')();

vorpal
  .command('health', 'Checks to see if Elysian running')
  .action(function (args: any, callback: Function) {
    axios.get('http://localhost:5000').then((response) => {
      callback(response.data);
    }).catch(() => {
      callback('Cannot connect')
    });
  });

vorpal
  .command('config <projectDid>', 'View Configuration for project DID')
  .action(function (args: any, callback: Function) {
    let params = {
      projectDid: args.projectDid
    }
    axios.post('http://localhost:5000/api/query', 
    {"jsonrpc":"2.0", 
    "method":"queryCapabilities",
    "id": 123,
    "params": params})
    .then((response) => {
      var capabs = new Array();
      response.data.result.capabilities.forEach((element: any) => {
        capabs.push(JSON.stringify(element));
      });
      var result = {
        projectDid: response.data.result.projectDid,
        capabilities: capabs
      }
      callback(result);
    }).catch((error) => {
      callback('Cannot connect ' + error)
    });
  });

  vorpal
  .command('add-did <projectdid> <agentDid> <capability>', 'Add DID to project for capability')
  .action(function (args: any, callback: Function) {
    let params = {
      projectDid: args.projectdid,
      did: args.agentDid,
      capability: args.capability
    }
    axios.post('http://localhost:5000/api/query', 
    {"jsonrpc":"2.0", 
    "method":"addCapabilities",
    "id": 123,
    "params": params})
    .then((response) => {
      callback(response.data);
    }).catch((error) => {
      callback('Cannot connect ' + error)
    });
  });

  vorpal
  .command('rm-did <projectdid> <agentDid> <capability>', 'Remove DID from project for capability')
  .action(function (args: any, callback: Function) {
    let params = {
      projectDid: args.projectdid,
      did: args.agentDid,
      capability: args.capability
    }
    axios.post('http://localhost:5000/api/query', 
    {"jsonrpc":"2.0", 
    "method":"removeCapabilities",
    "id": 123,
    "params": params})
    .then((response) => {
      callback(response.data);
    }).catch((error) => {
      callback('Cannot connect ' + error)
    });
  });

vorpal
  .delimiter('elysian$')
  .show();