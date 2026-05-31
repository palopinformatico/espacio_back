import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from './entities/theme.entity';
import { OrdersGateway } from 'src/orders/orders.gateway';


@Injectable()
export class ThemeService {
  constructor(
    @InjectRepository(Theme)
    private readonly repo: Repository<Theme>,
    private readonly gateway: OrdersGateway,
  ) {}

  findAll(): Promise<Theme[]> {
    return this.repo.find();
  }

  async findDefault(): Promise<Theme> {
    const t = await this.repo.findOne({ where: { isDefault: true } });
    if (!t) throw new NotFoundException('No default theme set');
    return t;
  }

  async findOne(id: number): Promise<Theme> {
    const t = await this.repo.findOneBy({ id });
    if (!t) throw new NotFoundException('Theme not found');
    return t;
  }

  async create(data: Partial<Theme>): Promise<Theme> {
    const theme = this.repo.create(data);
    const saved = await this.repo.save(theme);
    this.gateway.broadcast(saved);
    return saved;
  }

  async update(id: number, data: Partial<Theme>): Promise<Theme> {
    await this.repo.update(id, data);
    const updated = await this.repo.findOneBy({ id });
    if (!updated) throw new NotFoundException('Theme not found');
    this.gateway.broadcast(updated);
    return updated;
  }

  async activate(id: number): Promise<Theme> {
    await this.repo.update({}, { isDefault: false });
    const theme = await this.repo.findOneBy({ id });
    if (!theme) throw new NotFoundException('Theme not found');
    theme.isDefault = true;
    const saved = await this.repo.save(theme);
    this.gateway.broadcast(saved);
    return saved;
  }
}
