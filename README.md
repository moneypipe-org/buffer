# Buffer

> create a group to collect money and let members withdraw their share

Learn more here: https://buffer.moneypipe.xyz

![buffer.png](buffer.png)

---

# Contract

Stream is a [minimal proxy contract](https://eips.ethereum.org/EIPS/eip-1167), which makes deployments affordable ($40 ~ $90).

This repository is made up of 2 main files:

1. [Buffer.sol](contracts/Buffer.sol): The core "Buffer" contract that handles realtime money split handling
2. [Factory.sol](contracts/Factory.sol): The factory that clones and deploys the core Stream contract

> There's an additional [Test.sol](contracts/Test.sol) but it's just for testing purpose and is not included in the deployment.
