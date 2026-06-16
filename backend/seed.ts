import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'sarah@nexasolutions.com',
      password_hash: passwordHash,
      first_name: 'Sarah',
      last_name: 'Mitchell',
      company_name: 'Nexa Solutions',
      industry: 'Technology',
      company_size: '500-1000'
    }
  });

  const assessmentsData = [
    { project: 'Customer Churn Prediction', dept: 'Marketing', status: 'completed', roi: 142 },
    { project: 'Automated Code Review', dept: 'Engineering', status: 'IN_PROGRESS', roi: null },
    { project: 'Sales Forecasting', dept: 'Sales', status: 'pending', roi: null },
    { project: 'Fraud Detection', dept: 'Finance', status: 'completed', roi: 215 },
    { project: 'Helpdesk Automation', dept: 'Support', status: 'error', roi: null },
  ];

  for (let i = 0; i < assessmentsData.length; i++) {
    const data = assessmentsData[i];
    const assessment = await prisma.assessment.create({
      data: {
        session_id: `seed-session-${user.id}-${i}`,
        user_id: user.id,
        project_name: data.project,
        department: data.dept,
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
  
  console.log("Done seeding database with user and internal assessments.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
