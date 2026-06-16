import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ orderBy: { created_at: 'desc' }, take: 5 });
  console.log(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
