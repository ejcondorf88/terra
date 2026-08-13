import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SecretStoreService {
  private readonly filePath = path.resolve(process.cwd(), '.secrets', 'wallet-secrets.json');

  constructor() {
    this.ensureStore();
  }

  private ensureStore() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
    }
  }

  getSecret(key: string): string | undefined {
    const content = fs.readFileSync(this.filePath, 'utf8');
    const secrets = JSON.parse(content) as Record<string, string>;
    return secrets[key];
  }

  setSecret(key: string, value: string): void {
    const content = fs.readFileSync(this.filePath, 'utf8');
    const secrets = JSON.parse(content) as Record<string, string>;
    secrets[key] = value;
    fs.writeFileSync(this.filePath, JSON.stringify(secrets, null, 2));
  }
}
