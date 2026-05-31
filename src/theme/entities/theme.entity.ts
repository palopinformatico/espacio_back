import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Theme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '#ff7f00' })
  primaryColor: string;

  @Column({ default: '#ffc107' })
  secondaryColor: string;

  @Column({ default: '#ffffff' })
  backgroundColor: string;

  @Column({ nullable: true })
  backgroundImage: string;

  @Column({ nullable: true })
  gradient: string;

  // 👇 NUEVO
  @Column({ default: 'color' })
  backgroundType: 'color' | 'gradient' | 'image';

  @Column({ default: 'light' })
  mode: string;

  @Column({ default: 'rounded' })
  borderStyle: string;

  @Column({ default: 'normal' })
  cardShadow: string;

  @Column({ default: 'full' })
  layoutType: string;

  @Column({ default: false })
  isDefault: boolean;
}
