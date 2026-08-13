import { Body, Controller, Get, Param, Patch, Post, HttpException, HttpStatus } from '@nestjs/common';
import { TestNftService } from '../services/test-nft.service';

@Controller('nfts')
export class TestNftController {
  constructor(private readonly nftService: TestNftService) {}

  @Post()
  async create(@Body() body: { plotId: number; metadata: any }) {
    try {
      return await this.nftService.createNft(body.plotId, body.metadata);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'NFT creation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() metadata: Partial<any>) {
    try {
      return await this.nftService.updateNft(id, metadata);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'NFT update failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/collateralize')
  async collateralize(@Param('id') id: string) {
    try {
      return await this.nftService.collateralizeNft(id);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'NFT collateralization failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  async getMetadata(@Param('id') id: string) {
    try {
      return await this.nftService.getNftMetadata(id);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'NFT metadata retrieval failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('plot/:plotId')
  async getByPlot(@Param('plotId') plotId: number) {
    try {
      return await this.nftService.getNftsByPlot(plotId);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'NFT retrieval failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
