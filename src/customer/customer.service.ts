import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    
  ) {}


  async create(createCustomerDto: CreateCustomerDto) {
    return await this.customerRepository.save({
      ...createCustomerDto,
      customerName: createCustomerDto.customerName,
      customerPhone: createCustomerDto.customerPhone,
      customerEmail: createCustomerDto.customerEmail,
      customerAddress: createCustomerDto.customerAddress
      
      

    })
  }

  async findAll() {
    return await this.customerRepository.find();
  }

  async findOne(id: number) {
    return await this.customerRepository.findOneBy({id});
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return await this.customerRepository.update(id,updateCustomerDto);
  }

  async remove(id: number) {
    return await this.customerRepository.delete(id);
  }
}


