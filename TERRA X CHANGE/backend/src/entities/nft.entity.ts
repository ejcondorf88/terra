import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('nfts')
export class Nft {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletId!: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;

  @Column()
  tokenId!: string;

  @Column()
  contractAddress!: string;

  @Column({ type: 'text' })
  metadata!: string;

  @Column({ default: 'ERC721' })
  standard!: string;

  @CreateDateColumn()
  createdAt!: Date;
}