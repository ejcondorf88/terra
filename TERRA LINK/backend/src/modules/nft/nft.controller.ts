import { Body, Controller, Get, Param, Patch, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NftMetadataInput, NftService } from './nft.service';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';

@Controller('nfts')
@UseGuards(JwtAuthGuard, RbacGuard)
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post()
  @Roles('productor', 'admin')
  async create(@Body() body: { plotId: number; metadata: NftMetadataInput }) {
    return this.nftService.createNft(body.plotId, body.metadata);
  }

  @Patch(':id')
  @Roles('productor', 'admin')
  async update(@Param('id') id: string, @Body() metadata: Partial<NftMetadataInput>) {
    return this.nftService.updateNft(id, metadata);
  }

  @Patch(':id/collateralize')
  @Roles('banco', 'admin')
  async collateralize(@Param('id') id: string) {
    return this.nftService.collateralizeNft(id);
  }

  @Get(':id')
  @Roles('productor', 'admin', 'banco', 'exportador')
  async getMetadata(@Param('id') id: string) {
    return this.nftService.getNftMetadata(id);
  }

  @Get('plot/:plotId')
  @Roles('productor', 'admin', 'banco', 'exportador')
  async getByPlot(@Param('plotId', ParseIntPipe) plotId: number) {
    return this.nftService.getNftsByPlot(plotId);
  }
}
