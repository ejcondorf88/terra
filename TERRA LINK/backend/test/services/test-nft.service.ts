import { Injectable } from '@nestjs/common';

@Injectable()
export class TestNftService {
  async createNft(plotId: number, metadata: any) {
    if (!plotId || !metadata) {
      throw new Error('Plot ID and metadata are required');
    }

    return {
      message: 'NFT created successfully (test)',
      tokenId: 'test-token-' + Date.now(),
    };
  }

  async updateNft(id: string, metadata: any) {
    return {
      message: 'NFT updated successfully (test)',
      tokenId: id,
    };
  }

  async collateralizeNft(id: string) {
    return {
      message: 'NFT collateralized successfully (test)',
      collateralized: true,
    };
  }

  async getNftMetadata(id: string) {
    return {
      tokenId: id,
      metadata: 'test metadata',
    };
  }

  async getNftsByPlot(plotId: number) {
    return [{
      tokenId: 'test-token',
      plotId: plotId,
    }];
  }
}
