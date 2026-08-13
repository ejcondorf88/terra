import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('AgriculturalNFT', function () {
  it('should mint an asset and manage metadata correctly', async function () {
    const [owner, recipient] = await ethers.getSigners();
    const AgriculturalNFT = await ethers.getContractFactory('AgriculturalNFT', owner);
    const nft = await AgriculturalNFT.deploy();
    await nft.waitForDeployment();

    const initialCertifications = ['EUDR', 'Organic'];
    const tokenURI = 'ipfs://test-metadata';
    const geohash = 'sx3mh3p5';

    const tx = await nft.mintAsset(
      recipient.address,
      tokenURI,
      geohash,
      initialCertifications,
      'ipfs://production-history',
      420000,
      12,
      10
    );
    await tx.wait();

    const tokenId = 1n;
    expect(await nft.ownerOf(tokenId)).to.equal(recipient.address);
    expect(await nft.tokenURI(tokenId)).to.equal(tokenURI);

    const metadata = await nft.getAssetMetadata(1);
    expect(metadata.geohash).to.equal(geohash);
    expect(metadata.certifications[0]).to.equal(initialCertifications[0]);
    expect(metadata.valuation).to.equal(420000);
    expect(metadata.collateralized).to.equal(false);

    const updateTx = await nft.updateMetadata(
      1,
      'sx3mh3p6',
      ['EUDR', 'Organic', 'FairTrade'],
      'ipfs://production-history-v2',
      450000,
      10,
      12
    );
    await updateTx.wait();

    const updated = await nft.getAssetMetadata(1);
    expect(updated.geohash).to.equal('sx3mh3p6');
    expect(updated.valuation).to.equal(450000);
    expect(updated.certifications.length).to.equal(3);

    const collateralTx = await nft.setCollateralized(1, true);
    await collateralTx.wait();

    const collateralized = await nft.getAssetMetadata(1);
    expect(collateralized.collateralized).to.equal(true);

    await nft.lockToken(1);
    await expect(nft.connect(recipient).transferFrom(recipient.address, owner.address, 1)).to.be.revertedWith('Token transfer is locked');

    await nft.unlockToken(1);
    await nft.connect(recipient).transferFrom(recipient.address, owner.address, 1);
    expect(await nft.ownerOf(1)).to.equal(owner.address);
  });

  it('should integrate NFT to credit flow: mint, collateralize, and prepare for credit proposal', async function () {
    const [owner, farmer, lender] = await ethers.getSigners();
    const AgriculturalNFT = await ethers.getContractFactory('AgriculturalNFT', owner);
    const nft = await AgriculturalNFT.deploy();
    await nft.waitForDeployment();

    // Mint NFT for agricultural asset
    const certifications = ['EUDR', 'Organic'];
    const tokenURI = 'ipfs://asset-metadata';
    const geohash = 'sx3mh3p5';

    const mintTx = await nft.mintAsset(
      farmer.address,
      tokenURI,
      geohash,
      certifications,
      'ipfs://production-history',
      500000, // valuation
      15,     // yield percentage
      24      // months to maturity
    );
    await mintTx.wait();

    const tokenId = 1n;
    expect(await nft.ownerOf(tokenId)).to.equal(farmer.address);

    // Update metadata if needed (simulate farmer updating details)
    const updateTx = await nft.updateMetadata(
      tokenId,
      geohash,
      certifications,
      'ipfs://updated-production-history',
      550000, // updated valuation
      16,     // updated yield
      22      // updated months
    );
    await updateTx.wait();

    // Farmer collateralizes the NFT for credit
    const collateralTx = await nft.connect(farmer).setCollateralized(tokenId, true);
    await collateralTx.wait();

    let metadata = await nft.getAssetMetadata(tokenId);
    expect(metadata.collateralized).to.equal(true);

    // Automatically lock the token upon collateralization
    await nft.lockToken(tokenId);

    // Attempt to transfer should fail (locked for credit)
    await expect(nft.connect(farmer).transferFrom(farmer.address, lender.address, tokenId)).to.be.revertedWith('Token transfer is locked');

    // Simulate credit proposal approval: NFT remains locked and collateralized
    metadata = await nft.getAssetMetadata(tokenId);
    expect(metadata.collateralized).to.equal(true);
    expect(metadata.valuation).to.equal(550000);

    // After credit repayment, unlock (simulate)
    await nft.unlockToken(tokenId);
    await nft.connect(farmer).transferFrom(farmer.address, lender.address, tokenId);
    expect(await nft.ownerOf(tokenId)).to.equal(lender.address);
  });
});