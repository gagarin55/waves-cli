var vorpal = require('vorpal')();
var waves = require('waves.js/dist/waves');
var chalk = require('chalk');

var Wallet = require('./wallet.js').Wallet;
var wallet = new Wallet();

const networkParams = waves.default.MainNetParameters();
const host = 'https://nodes.wavesnodes.com/';
const Waves = new waves.default(networkParams);
const rpc = Waves.client(host);


function statusHandler(self) {
    const statusFuture = rpc.getNodeStatus();
    const versionFuture = rpc.getNodeVersion();

    return Promise.all([versionFuture, statusFuture]).then(function (results) {
        self.log(chalk.bold('                Version: ') + results[0]);
        self.log(chalk.bold('        Block generator: ') + results[1].blockGeneratorStatus);
        self.log(chalk.bold('           History sync: ') + results[1].historySynchronizationStatus);
    });
};

function poolHandler(self) {
    const future = rpc.getUnconfirmedTransactions();
    return future.then(function (result) {
        result.forEach(function (tx) {
            self.log(tx.id + ' ' + tx.amount + ' ' + tx.sender + '->' + tx.recipient);
        });
    });
};

function blockHandler(self, args) {
    const height = args.height;
    const future = rpc.getBlockAt(height)
        .then(function (block) {
            self.log(block);
        });
    return future;
};

vorpal
    .command('status', 'Get node version and status')
    .action(function (args, callback) {
        return statusHandler(this);
    });

vorpal
    .command('pool', 'Get unconfirmed transactions')
    .action(function (args) {
        return poolHandler(this);
    });

vorpal
    .command('block <height>', 'Get block')
    .action(function (args, cb) {
        blockHandler(this, args);
        cb();
    });

vorpal
    .command('wallet list', 'List addresses in wallet')
    .action(function(args, cb){
       this.log(wallet.addresses());
       cb();
    });

vorpal
    .command('wallet import <seed>', 'Import seed into wallet')
    .action(function(args, cb){
       cb();
    });

vorpal
    .command('height', 'Get current height')
    .action(function (args) {
        const self = this;
        return rpc.getHeight()
            .then(function (height) {
                self.log(chalk.bold('Current Height: ') + height);
            });
    });

vorpal
    .delimiter('waves#')
    .show();

