import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { Tenant } from '../../entities/tenant.entity';
import { NotFoundException } from '@nestjs/common';

describe('TenantService', () => {
  let service: TenantService;
  let repository: any;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should create a tenant', async () => {
    repository.create.mockReturnValue({ name: 'Test Tenant', domain: 'tenant.test' });
    repository.save.mockResolvedValue({ id: 1, name: 'Test Tenant', domain: 'tenant.test' });

    const result = await service.createTenant('Test Tenant', 'tenant.test');
    expect(result).toEqual({ id: 1, name: 'Test Tenant', domain: 'tenant.test' });
    expect(repository.create).toHaveBeenCalledWith({ name: 'Test Tenant', domain: 'tenant.test' });
  });

  it('should find tenant by id', async () => {
    repository.findOne.mockResolvedValue({ id: 1, name: 'Tenant A' });
    const result = await service.findTenantById(1);
    expect(result).toEqual({ id: 1, name: 'Tenant A' });
  });

  it('should throw when tenant not found', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findTenantById(1)).rejects.toThrow(NotFoundException);
  });

  it('should delete tenant', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });
    await expect(service.deleteTenant(1)).resolves.toBeUndefined();
  });

  it('should throw when deleting missing tenant', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });
    await expect(service.deleteTenant(1)).rejects.toThrow(NotFoundException);
  });
});
