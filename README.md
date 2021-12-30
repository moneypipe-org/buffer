# Buffer

> create a group to collect money and let members withdraw their share

https://buffer.moneypipe.xyz

![buffer.png](buffer.png)

The buffer engine stores ("buffers") all incoming funds and lets its members withdraw according to a pre-defined ratio.


The "buffer", as the name says, does NOT immediately propagate funds, but stores ("buffers") everything in the contract, and makes it available for withdrawl. Each member can withdraw their quota based on the pre-set ratio determined when the buffer contract was deployed. For a "push" based approach where funds get split and streamed to each member in realtime, see the [Stream](https://github.com/moneypipe-org/stream) module.


> A good way to understand the distiinction is the concept of "Buffer" vs. "Stream" in node.js. While "buffer" stores data, "stream" lets data flow in realtime.

# Contract

Stream is a [minimal proxy contract](https://eips.ethereum.org/EIPS/eip-1167), which makes deployments affordable ($40 ~ $90).

This repository is made up of 2 main files:

1. [Buffer.sol](contracts/Buffer.sol): The core "Buffer" contract that handles realtime money split handling
2. [Factory.sol](contracts/Factory.sol): The factory that clones and deploys the core Stream contract

> There's an additional [Test.sol](contracts/Test.sol) but it's just for testing purpose and is not included in the deployment.
