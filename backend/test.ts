import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const assessments = await prisma.assessment.findMany({
    where: { user_id: 'bd5a4142-18b5-4cb2-9d31-97b690246d8b' },
    include: { prediction: true },
    orderBy: { created_at: 'desc' }
  });
  console.log(assessments);
}
run().catch(console.error);
