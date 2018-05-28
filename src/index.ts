import axios from 'axios';

var vorpal = require('vorpal')();

vorpal
  .command('health', 'Checks to see if Elysian running')
  .action(function (args: any, callback: Function) {
    console.log('Check Elysian');
    axios.get('http://app:5000').then((response) => {
      callback(response.data);
    }).catch(() =>{
      callback('Cannot connect')
    });    
  });



vorpal 
  .delimiter('elysian$')
  .show();