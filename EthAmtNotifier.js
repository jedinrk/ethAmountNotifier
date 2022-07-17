const Web3 = require("web3");
require("dotenv").config();
var CronJob = require("cron").CronJob;

class EthAmtNotifier {
  web3;
  web3ws;
  accounts;
  subscription;

  constructor(projectId, accounts) {
    this.web3ws = new Web3(
      new Web3.providers.WebsocketProvider(process.env.WSS_URL + projectId)
    );
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.HTTPS_URL + projectId)
    );
    this.accounts = accounts.split(", "); //Need to replace this with a secure vault like AWS secrets
  }

  /** Subscribes to an event(topic) in Ethereum */
  subscribe(topic) {
    this.subscription = this.web3ws.eth.subscribe(topic, (err, res) => {
      if (err) console.error(err);
    });
  }

  /** Watches the transactions that is subscribed to
   * Filters the accounts related transactions
   * Notify to the channel if the balance is less than 5 ETH
   */
  watchTransactions() {
    this.subscription.on("data", (txHash) => {
      setTimeout(async () => {
        try {
          let tx = await this.web3.eth.getTransaction(txHash);
          if (tx != null) {
            this.accounts.forEach(async (account) => {
              if (account.toLowerCase() == tx.from.toLowerCase()) {
                console.log({
                  toAddress: tx.to,
                  value: this.web3.utils.fromWei(tx.value, "ether"),
                });

                let currentBalanceInEth = await this.getEthBalance(account);
                console.log("Current Balance : ", currentBalanceInEth);
                if (currentBalanceInEth < 5) {
                  //Notifiy(); Call a Discord/Telegram bot API service to post the balance alert
                }
              }
            });
          }
        } catch (err) {
          console.error(err);
        }
      }, 60000);
    });
  }

  getEthBalance = async (account) => {
    let currentBalance = await this.web3.eth.getBalance(account.toLowerCase());
    return this.web3.utils.fromWei(currentBalance, "ether");
  };

  checkBalanceAndNotify() {
    console.log("checkBalanceAndNotify")
    this.accounts.forEach(async (account) => {
      let currentBalanceInEth = await this.getEthBalance(account);
      console.log("Current Balance : ", currentBalanceInEth);
    });
  }
}

let txChecker = new EthAmtNotifier(
  process.env.INFURA_ID,
  process.env.ADDRESSES
);
/** subscribing to the topic 'pendingTransactions' */
txChecker.subscribe("pendingTransactions");
txChecker.watchTransactions();

/**
 * CronJob to Notify the ETH balance of the accounts every 9 am UTC
 */
let job = new CronJob(
  "* 9 * * *",
  function () {
    let txCheckerCronJob = new EthAmtNotifier(
      process.env.INFURA_ID,
      process.env.ADDRESSES
    );

    txCheckerCronJob.checkBalanceAndNotify();
  },
  null,
  false
);

job.start();
