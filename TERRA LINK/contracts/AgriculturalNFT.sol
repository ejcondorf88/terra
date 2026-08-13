// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgriculturalNFT is ERC721URIStorage, Ownable {
    struct AssetMeta {
        string geohash;
        string[] certifications;
        string productionHistoryUri;
        uint256 valuation;
        uint256 riskScore;
        uint256 fractionCount;
        bool collateralized;
        uint256 lastUpdated;
    }

    mapping(uint256 => AssetMeta) private _metadata;
    mapping(uint256 => bool) private _locked;
    uint256 private _nextTokenId = 1;

    event AssetMinted(uint256 indexed tokenId, address indexed owner);
    event AssetMetadataUpdated(uint256 indexed tokenId);
    event AssetCollateralized(uint256 indexed tokenId, bool collateralized);

    constructor() ERC721("Terra Link Agricultural NFT", "TLANFT") {}

    function mintAsset(
        address recipient,
        string memory tokenURI,
        string memory geohash,
        string[] memory certifications,
        string memory productionHistoryUri,
        uint256 valuation,
        uint256 riskScore,
        uint256 fractionCount
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _metadata[tokenId] = AssetMeta({
            geohash: geohash,
            certifications: certifications,
            productionHistoryUri: productionHistoryUri,
            valuation: valuation,
            riskScore: riskScore,
            fractionCount: fractionCount,
            collateralized: false,
            lastUpdated: block.timestamp
        });

        emit AssetMinted(tokenId, recipient);
        return tokenId;
    }

    function updateMetadata(
        uint256 tokenId,
        string memory geohash,
        string[] memory certifications,
        string memory productionHistoryUri,
        uint256 valuation,
        uint256 riskScore,
        uint256 fractionCount
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        AssetMeta storage meta = _metadata[tokenId];
        meta.geohash = geohash;
        meta.certifications = certifications;
        meta.productionHistoryUri = productionHistoryUri;
        meta.valuation = valuation;
        meta.riskScore = riskScore;
        meta.fractionCount = fractionCount;
        meta.lastUpdated = block.timestamp;

        emit AssetMetadataUpdated(tokenId);
    }

    function setCollateralized(uint256 tokenId, bool collateralized) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        require(_exists(tokenId), "Token does not exist");
        _metadata[tokenId].collateralized = collateralized;
        emit AssetCollateralized(tokenId, collateralized);
    }

    function getAssetMetadata(uint256 tokenId) external view returns (AssetMeta memory) {
        require(_exists(tokenId), "Token does not exist");
        return _metadata[tokenId];
    }

    function lockToken(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _locked[tokenId] = true;
    }

    function unlockToken(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _locked[tokenId] = false;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721) {
        require(!_locked[tokenId], "Token transfer is locked");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
