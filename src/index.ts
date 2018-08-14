import axios from 'axios';
import { Document, Schema, Model, model } from 'mongoose';
import { createHash } from 'crypto';

var vorpal = require('vorpal')();
var Memcached = require('memcached');
var mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI || '',
  { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000, connectTimeoutMS: 2000, keepAlive: 1 })
  .catch(() => { });

var cache = new Memcached(process.env.MEMCACHE_URI || '', { reconnect: 5000, timeout: 1000, retry: 5000, retries: 1 });

export interface ITransactionModel extends Document { }

export var TransactionSchema: Schema = new Schema({
  projectDid: String,
  data: String,
  hash: {
    type: String,
    index: true,
    unique: true // Unique index. 
  },
  nonce: String,
  type: String,
  signatureType: String,
  signatureValue: String,
  publicKey: String,
  timestamp: Date
});

export const Transaction: Model<ITransactionModel> = model<ITransactionModel>("Transaction", TransactionSchema);

export interface ICapabilitiesModel extends Document {
  projectDid: String,
  capabilities: [{
    capability: String,
    template: String,
    allow: [String],
    validateKYC: Boolean
  }]
}

export var CapabilitiesSchema: Schema = new Schema({

  projectDid: String,
  capabilities: [{
    capability: String,
    template: String,
    allow: [String],
    validateKYC: Boolean
  }]

}, { strict: false });

export const Capabilities: Model<ICapabilitiesModel> = model<ICapabilitiesModel>("Capabilities", CapabilitiesSchema);

function hash(input: any): String {
  let anyString = typeof (input) == 'object' ? JSON.stringify(input) : input.toString();
  let hash = createHash('sha256').update(anyString).digest('hex');
  return hash;
}

vorpal
  .command('health', 'Checks to see if Elysian running')
  .action(function (args: any, callback: Function) {
    axios.get('http://app:5000').then((response) => {
      callback(response.data);
    }).catch(() => {
      callback('Cannot connect')
    });
  });

  vorpal
  .command('audit', 'Test integrity of data')
  .action(function (args: any, callback: Function) {
    Transaction.find(
      { },
      function (error: Error, result: ITransactionModel[]) {
        var audit = new Array();
        if (error) {
          console.log("Error is " + error);
          callback(error);
        } else {
          let prevHash = '';
          result.forEach((element: any) => {
            let calHash = hash(prevHash + element.nonce.toString() + element.data);
            if (calHash === element.hash) {
              audit.push(calHash + ' ' + 'true');
            } else {
              audit.push(calHash + ' ' + 'false');
            }
            prevHash = element.hash;
          })
        }
        callback(audit);
      });
  });

vorpal
  .command('config <projectDid>', 'View Configuration for project DID')
  .action(function (args: any, callback: Function) {
    Capabilities.findOne(
      {
        projectDid: args.projectDid
      },
      function (error: Error, result: ICapabilitiesModel) {
        if (error) {
          console.log("Error is " + error);
          callback(error);
        } else {
          var capabs = new Array();
          result.capabilities.forEach((element: any) => {
            capabs.push(JSON.stringify(element));
          });
          var response = {
            projectDid: result.projectDid,
            capabilities: capabs
          }
          callback(response);
        }
      });
  });

vorpal
  .command('add-did <projectdid> <agentDid> <capability>', 'Add capability to project for DID')
  .action(function (args: any, callback: Function) {

    Capabilities.updateOne(
      {
        'projectDid': args.projectdid,
        'capabilities.capability': args.capability,
      },
      { $addToSet: { "capabilities.$.allow": args.agentDid } },
      function (error: Error, result: ICapabilitiesModel) {
        if (error) {
          console.log('DB ERROR ' + error);
          callback(error);
        } else {
          callback(result);
        }
      });
  });

vorpal
  .command('rm-did <projectdid> <agentDid> <capability>', 'Remove capability from project for DID')
  .action(function (args: any, callback: Function) {
    Capabilities.updateOne(
      {
        'projectDid': args.projectdid,
        'capabilities.capability': args.capability,
      },
      { $pull: { "capabilities.$.allow": args.agentDid } },
      function (error: Error, result: ICapabilitiesModel) {
        if (error) {
          console.log('DB ERROR ' + error);
          callback(error);
        } else {
          callback(result);
        }
      });
  });

vorpal
  .command('view-did <did>', 'view DID on blockchain')
  .action(function (args: any, callback: Function) {

    axios.get('http://beta.cosmos.ixo.world:80/api/did/getByDid/'  + args.did)
      .then((response) => {
        if (response.status == 200 && response.data.did != null) {
          callback(response.data)
        } else {
          callback("DID not found for creator " + args.did);
        }

      })
  });

vorpal
  .command('view-cache <key>', 'view cached DID')
  .action(function (args: any, callback: Function) {

    cache.get(args.key, function (err: any, data: any) {
      if (err) callback(err);
      callback(data);
    });
  });

  vorpal
  .command('rm-cache <key>', 'delete key from cache')
  .action(function (args: any, callback: Function) {

    cache.delete(args.key, function (err: any, data: any) {
      if (err) callback(err);
      callback(data);
    });
  });

  vorpal
  .command('flush-cache', 'flush cache')
  .action(function (args: any, callback: Function) {

    cache.flush(function (err: any, data: any) {
      if (err) callback(err);
      callback(data);
    });
  });

vorpal
  .delimiter('elysian$')
  .show();