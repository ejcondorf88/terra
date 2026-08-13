import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create, IPFSHTTPClient } from 'ipfs-http-client';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly client: IPFSHTTPClient;

  constructor(private readonly configService: ConfigService) {
    const apiUrl = this.configService.get<string>('IPFS_API_URL') || 'https://ipfs.infura.io:5001/api/v0';
    const projectId = this.configService.get<string>('IPFS_PROJECT_ID');
    const projectSecret = this.configService.get<string>('IPFS_PROJECT_SECRET');

    const headers = projectId && projectSecret
      ? { authorization: `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}` }
      : undefined;

    this.client = create({ url: apiUrl, headers });
    this.logger.log(`IPFS client configured for ${apiUrl}`);
  }

  async uploadMetadata(metadata: Record<string, any>) {
    const payload = JSON.stringify(metadata);
    const result = await this.client.add(payload);
    const cid = result.cid.toString();
    return `ipfs://${cid}`;
  }
}
