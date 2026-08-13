import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ namespace: '/credit', cors: { origin: '*' } })
@Injectable()
export class CreditSmartContractGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CreditSmartContractGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('CreditSmartContract WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || (client.handshake.query && (client.handshake.query as any).token);
      if (!token) {
        this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
        client.emit('error', 'Unauthorized');
        client.disconnect(true);
        return;
      }
      const payload = this.jwtService.verify(token as string);
      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id} user=${payload.sub}`);
      this.server.emit('dashboard:connected', { clientId: client.id, user: payload.sub });
    } catch (err) {
      this.logger.warn(`JWT verification failed for client ${client.id}: ${err}`);
      client.emit('error', 'Unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyCollateralization(tokenId: string, payload: Record<string, any>) {
    this.server.emit('credit:collateralized', { tokenId, ...payload });
  }

  notifyRiskLimit(tokenId: string, payload: Record<string, any>) {
    this.server.emit('credit:riskLimit', { tokenId, ...payload });
  }

  notifyMetricsUpdate(payload: Record<string, any>) {
    this.server.emit('credit:metrics', payload);
  }
}
