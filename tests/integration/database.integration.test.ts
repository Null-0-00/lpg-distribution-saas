import { prisma } from '@/lib/prisma';

describe('Database Integration Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  test('should be able to query tenants table', async () => {
    const tenants = await prisma.tenant.findMany({
      take: 1,
    });
    expect(Array.isArray(tenants)).toBe(true);
  });
});
