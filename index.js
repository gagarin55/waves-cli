var vorpal = require('vorpal')();
var waves = require('waves.js/dist/waves');
var chalk = require('chalk');

const networkParams = waves.default.MainNetParameters();
const host = 'https://nodes.wavesnodes.com/';
const Waves = new waves.default(networkParams);
const rpc = Waves.client(host);


function statusHandler(self) {
    const statusFuture  = rpc.getNodeStatus();
    const versionFuture = rpc.getNodeVersion();

    return Promise.all([versionFuture, statusFuture]).
      then(function(results){
         self.log(chalk.bold('                Version: ')+results[0]);
         self.log(chalk.bold('        Block generator: ')+results[1].blockGeneratorStatus);
         self.log(chalk.bold('           History sync: ')+results[1].historySynchronizationStatus);
      });
};

function poolHandler(self) {
    const future = rpc.getUnconfirmedTransactions();
    return future.then(function(result){
      result.forEach(function(tx){
        self.log(tx.id+' '+tx.amount+' '+tx.sender+'->'+tx.recipient);
      });
    });
};

vorpal
  .command('status', 'Get node version and status')
  .action(function(args, callback) {
    return statusHandler(this);
  });

vorpal
  .command('pool', 'Get unconfirmed transactions')
  .action(function(args){
     return poolHandler(this);
   });

vorpal
  .delimiter('waves#')
  .show();

