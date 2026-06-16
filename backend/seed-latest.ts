import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ orderBy: { created_at: 'desc' }, take: 1 });
  if (users.length === 0) {
    console.log("No users found");
    return;
  }
  const user = users[0];
  console.log(`Seeding for user: ${user.email} (${user.id})`);

  await prisma.assessment.create({
    data: {
      session_id: uuidv4(),
      user_id: user.id,
      project_name: 'Nova Healthcare',
      department: 'Healthcare',
      status: 'in_progress',
      ai_maturity: 2,
      ai_budget: 150000,
      automation_rate: 15,
      employee_training_hours: 40,
      num_ai_deployments: 1,
      prediction: {
        create: {
          annual_revenue_impact: 1200000,
          quarterly_revenue_impact: 300000,
          productivity_gain_pct: 20,
          roi_percentage: 450,
          annual_net_benefit: 900000,
          payback_months: 6.5,
          transformation_score: 75,
          readiness_level: "HIGH",
          risk_score: 45,
          scenario_baseline_roi: 450,
          scenario_cautious_roi: 320,
          scenario_aggressive_roi: 580,
          risk_technical: 40,
          risk_financial: 35,
          risk_talent: 60,
          risk_regulatory: 70,
          risk_market: 30,
          maturity_tier: 2,
          peer_percentile: 65,
          model_version: "1.0",
        }
      }
    }
  });

  await prisma.assessment.create({
    data: {
      session_id: uuidv4(),
      user_id: user.id,
      project_name: 'Acme Fintech',
      department: 'Financial Services',
      status: 'completed',
      ai_maturity: 3,
      ai_budget: 500000,
      automation_rate: 35,
      employee_training_hours: 120,
      num_ai_deployments: 3,
      prediction: {
        create: {
          annual_revenue_impact: 2500000,
          quarterly_revenue_impact: 625000,
          productivity_gain_pct: 35,
          roi_percentage: 600,
          annual_net_benefit: 2000000,
          payback_months: 4.2,
          transformation_score: 85,
          readiness_level: "HIGH",
          risk_score: 35,
          scenario_baseline_roi: 600,
          scenario_cautious_roi: 450,
          scenario_aggressive_roi: 750,
          risk_technical: 30,
          risk_financial: 25,
          risk_talent: 45,
          risk_regulatory: 55,
          risk_market: 20,
          maturity_tier: 3,
          peer_percentile: 85,
          model_version: "1.0",
        }
      }
    }
  });

  console.log("Assessments created successfully for the new user.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
