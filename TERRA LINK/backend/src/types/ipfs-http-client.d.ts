declare module 'ipfs-http-client' {
  export interface IPFSHTTPClient {
    add(data: any): Promise<{ cid: { toString(): string } }>;
  }

  export function create(opts?: any): IPFSHTTPClient;
}
