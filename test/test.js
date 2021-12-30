const fs = require('fs');
const ipfsh = require('ipfsh');
//const Invitelist = require('invitelist')
const Merklescript = require('merklescript')
const path = require('path');
const { ethers } = require('hardhat');
const globalLogs = async (factoryAddress) => {
  console.log("factory address", factoryAddress)
  let ABI = require(path.resolve(__dirname, "../abi/contracts/Factory.sol/Factory.json"))
  console.log("FactoryABI", ABI);
  let interface = new ethers.utils.Interface(ABI)
  let events = await ethers.provider.getLogs({
    fromBlock: 0,
    toBlock: 'latest',
    address: factoryAddress,
  }).then((events) => {
    console.log("EVENTS", events)
    return events.map((e) => {
      return interface.parseLog(e).args
    })
  })
  return events;
}
class Engine {
  async init() {
    this.signers = await ethers.getSigners();
    this.addresses = this.signers.map((s) => {
      return s.address
    })
    this.Factory = await ethers.getContractFactory('Factory');
    this.deployer = this.signers[0]
  }
  async deploy() {
    let factory = await this.Factory.deploy();
    await factory.deployed();
    console.log("# factory address", factory.address);
    await fs.promises.mkdir(path.resolve(__dirname, "../deployments"), { recursive: true }).catch((e) => {})
    await fs.promises.writeFile(path.resolve(__dirname, "../deployments/test.json"), JSON.stringify({ address: factory.address }))
    this.factory = factory
  }
  async clone (title, root) {
    let cidDigest = ipfsh.ctod("bafkreihe74ocygnwsmr7oao5zqrqzagb7e4j32xcmpjordz6wx5cngmmxm")
    let tx = await this.factory.genesis(title, root, cidDigest)
    let r = await tx.wait()
    console.log("r =", r.events[0].args)
    let c = ipfsh.dtoc(r.events[0].args.cid)
    console.log("c", c)
    let addr = r.events[0].args.group
    let ABI = require(path.resolve(__dirname, "../abi/contracts/Buffer.sol/Buffer.json"))
    this.contract = new ethers.Contract(addr, ABI, this.signers[0])
  }
}
var engine
var conract;
describe("splitter", () => {
  beforeEach(async () => {
    // deploy factory
    engine = new Engine()
    await engine.init()
    await engine.deploy()

  })
  it('deploy', async () => {

    let totalReceived = await contract.totalReceived(engine.deployer.address)
    console.log("totalReceived", ethers.utils.formatEther(totalReceived))

    // set merkle root
    const values = engine.addresses.map((a) => {
      return [a, Math.pow(10, 12) / engine.addresses.length]
    })
    console.log("values", values)
    const script = new Merklescript({
      types: ["address", "uint256"],
      values: values
    })
    const key = script.root()
    console.log("key" ,key)
    const proof = script.proof([ engine.deployer.address, 50000000000 ])
    console.log("proof", proof)
    let tx = await contract.set(engine.deployer.address, key)
    await tx.wait()

    
    let fetchedkey = await contract.root(engine.deployer.address)
    console.log("key = ", fetchedkey)

    await engine.deployer.sendTransaction({
      to: engine.contract.address,
      value: ethers.utils.parseEther("1.0")
    });

    totalReceived = await contract.totalReceived(engine.deployer.address)
    console.log("totalReceived", ethers.utils.formatEther(totalReceived))


  })
  it.only('withdraw', async () => {
    // set merkle root
    const values = engine.addresses.map((a) => {
      return [a, Math.pow(10, 12) / engine.addresses.length]
    })
    const script = new Merklescript({
      types: ["address", "uint256"],
      values: values
    })
    const key = script.root()
    const proof = script.proof([ engine.deployer.address, 50000000000 ])

    // clone
    let tx = await engine.clone("test", key)
    contract = engine.contract

//    let tx = await contract.set(engine.deployer.address, key)
    //await tx.wait()

    await engine.deployer.sendTransaction({
      to: engine.contract.address,
      value: ethers.utils.parseEther("5.0")
    });

    let balanceBefore = await ethers.provider.getBalance(engine.deployer.address);

    console.log("before", ethers.utils.formatEther(balanceBefore))

    let contractBalanceBefore = await ethers.provider.getBalance(contract.address);
    console.log("contract balance before", ethers.utils.formatEther(contractBalanceBefore));

    //tx = await contract.withdraw(engine.deployer.address, engine.deployer.address, 50000000000, proof)
    tx = await contract.withdraw(engine.deployer.address, 50000000000, proof)
    let r = await tx.wait()
    console.log("r", r)

    let balanceAfter = await ethers.provider.getBalance(engine.deployer.address);

    console.log("after", ethers.utils.formatEther(balanceAfter))
    console.log("diff", ethers.utils.formatEther(balanceAfter.sub(balanceBefore).add(r.gasUsed.mul(r.effectiveGasPrice))))

    let contractBalanceAfter = await ethers.provider.getBalance(contract.address);
    console.log("contract balance after", ethers.utils.formatEther(contractBalanceAfter));

  })
})
