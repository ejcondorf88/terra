// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AgroNFT is ERC721 {
    uint public nextId;

    constructor() ERC721("AgroNFT", "ANFT") {}

    function mint(address to) public {
        _safeMint(to, nextId);
        nextId++;
    }
}