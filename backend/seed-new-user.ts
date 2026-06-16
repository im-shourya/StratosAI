import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst({ orderBy: { created_at: 'desc' } });
  if (!user) {
    console.log("No user found.");
    return;
  }
  
  console.log(`Seeding assessments for user: ${user.email} (${user.id})`);

  const assessmentsData = [
    { company: 'Acme Fintech Ltd', industry: 'Financial Services', status: 'completed', roi: 142 },
    { company: 'Nova Healthcare', industry: 'Healthcare', status: 'active', roi: null },
    { company: 'Apex Manufacturing', industry: 'Manufacturing', status: 'pending', roi: null },
    { company: 'Global Retail Partners', industry: 'Retail', status: 'completed', roi: 215 },
    { company: 'SecureData Corp', industry: 'Technology', status: 'error', roi: null },
  ];

  for (let i = 0; i < assessmentsData.length; i++) {
    const data = assessmentsData[i];
    const assessment = await prisma.assessment.create({
      data: {
        session_id: `seed-session-${user.id}-${i}`,
        user_id: user.id,
        project_name: data.company,
        department: data.industry,
        status: data.status,
      },
    });

    if (data.status === 'completed' && data.roi !== null) {
      await prisma.prediction.create({
        data: {
          assessment_id: assessment.id,
          roi_percentage: data.roi,
          annual_revenue_impact: 120000,
          quarterly_revenue_impact: 30000,
          productivity_gain_pct: 15,
          annual_net_benefit: 90000,
          payback_months: 6,
          transformation_score: 85,
          readiness_level: 'HIGH',
          risk_score: 25,
          risk_technical: 40,
          risk_financial: 30,
          risk_talent: 75,
          risk_regulatory: 20,
          risk_market: 15,
          maturity_tier: 4,
          peer_percentile: 88,
        },
      });
    }
  }
  
  console.log("Done seeding.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
