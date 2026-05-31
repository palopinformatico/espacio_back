import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('eta_requests')
export class Eta {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  client_ip: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ type: 'text', nullable: true })
  address_raw: string;

  @Column({ type: 'text', nullable: true })
  address_normalized: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lon: number;

  @Column({ type: 'float', nullable: true })
  distance_km: number;

  @Column({ type: 'int', nullable: true })
  eta_min: number;

  @Column({ length: 50, nullable: true })
  motor: string; // 'openrouteservice' | 'haversine'

  @Column({ length: 50, default: 'nominatim' })
  geocode_source: string;

  @Column({ type: 'boolean', default: false })
  geocode_success: boolean;

  @Column({ nullable: true })
  geocode_error_code: string;

  // Detalles de dirección (extraídos de Nominatim)
  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state_region: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postcode: string;

  @Column({ nullable: true })
  barrio_sector: string;

  // Configuración usada
  @Column({ type: 'float', nullable: true })
  velocidad_kmh: number;

  @Column({ type: 'int', nullable: true })
  colchon_min: number;

  // Relaciones lógicas (guardamos solo ID para log)
  @Column({ type: 'int', nullable: true })
  order_id: number;

  @Column({ type: 'int', nullable: true })
  customer_id: number;
}
