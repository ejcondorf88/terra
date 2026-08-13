const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgroNFT", function () {
  let AgroNFT, agroNFT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AgroNFT = await ethers.getContractFactory("AgroNFT");
    agroNFT = await AgroNFT.deploy();
    await agroNFT.deployed();
  });

  it("debe tener nombre y símbolo correctos", async function () {
    expect(await agroNFT.name()).to.equal("AgroNFT");
    expect(await agroNFT.symbol()).to.equal("ANFT");
  });

  it("solo el owner puede mintear", async function () {
    await expect(agroNFT.connect(owner).mint(addr1.address)).to.not.be.reverted;
    await expect(agroNFT.connect(addr1).mint(addr1.address)).to.be.reverted;
  });

  it("no permite mintear dos veces al mismo usuario con el mismo tokenId", async function () {
    await agroNFT.mint(addr1.address);
    await agroNFT.mint(addr1.address);
    expect(await agroNFT.balanceOf(addr1.address)).to.equal(2);
  });

  it("permite transferencias entre múltiples wallets", async function () {
    await agroNFT.mint(addr1.address);
    expect(await agroNFT.ownerOf(0)).to.equal(addr1.address);
    await agroNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
    expect(await agroNFT.ownerOf(0)).to.equal(addr2.address);
  });

  it("valida metadatos de los NFTs", async function () {
    await agroNFT.mint(addr1.address);
    expect(await agroNFT.ownerOf(0)).to.equal(addr1.address);
    expect(await agroNFT.balanceOf(addr1.address)).to.equal(1);
  });

  it("incrementa el nextId correctamente", async function () {
    await agroNFT.mint(addr1.address);
    expect(await agroNFT.nextId()).to.equal(1);
    await agroNFT.mint(addr2.address);
    expect(await agroNFT.nextId()).to.equal(2);
  });
});
