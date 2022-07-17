# ethAmountNotifier

An NodeJS application to monitor a list of provided ETHEREUM addresses transactions and ETH balance.

### High Level Architecture Diagram.

![ETH Amount Notification System](https://user-images.githubusercontent.com/6463551/179423264-96b1a6e4-38e2-41b9-ae01-24f75e60647f.png)


### For the prototyping, the addresses list can be provided through the `.env` file. For production use a secure vault as mentioned in the architecture diagram.


### Private keys are not really necessary for the current scenario. It would be relevant when tranasactions are executed from the NodeJS script.
Hence the secure vault is recommended. 
