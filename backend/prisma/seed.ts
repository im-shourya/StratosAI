import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mongoose schema for Vendors
const VendorSchema = new Schema({
  name: String,
  category: String,
  status: String,
  desc: String,
  website_url: String,
});
const VendorModel = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

async function main() {
  console.log('Starting seed...');

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stratosai');
  console.log('Connected to MongoDB');

  // Seed User
  const email = 'test@test.in';
  const plainPassword = 'test1234';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        company_name: 'Test Corp',
        plan_tier: 'enterprise',
      },
    });
    console.log(`Created user: ${user.email}`);
  } else {
    user = await prisma.user.update({
      where: { email },
      data: { password_hash: hashedPassword },
    });
    console.log(`Updated user: ${user.email}`);
  }

  // Clear existing assessments for this user
  await prisma.assessment.deleteMany({ where: { user_id: user.id } });

  // Seed Assessments
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
        session_id: `seed-session-${i}`,
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
  console.log('Seeded Assessments and Predictions');

  // Clear and Seed Benchmarks
  await prisma.benchmark.deleteMany({});
  const USE_CASES = [
    { title: "Fraud Detection & AML", category: "Risk", impact: 80, cost: 80, desc: "Machine learning models to detect anomalous transaction patterns in real-time." },
    { title: "Customer Churn Prediction", category: "Marketing", impact: 80, cost: 50, desc: "Predictive analytics to identify customers at risk of leaving before they churn." },
    { title: "Automated Document Processing", category: "Operations", impact: 50, cost: 50, desc: "NLP-powered extraction of data from unstructured invoices and contracts." },
    { title: "IT Helpdesk Chatbot", category: "Support", impact: 50, cost: 20, desc: "LLM-based assistant to resolve tier 1 internal IT tickets automatically." },
    { title: "Supply Chain Forecasting", category: "Operations", impact: 80, cost: 80, desc: "Demand forecasting models combining internal sales data with external market signals." },
    { title: "Candidate Resume Screening", category: "HR", impact: 20, cost: 20, desc: "Automated parsing and ranking of applicant resumes against job descriptions." },
  ];

  for (const uc of USE_CASES) {
    await prisma.benchmark.create({
      data: {
        industry: uc.category, // Storing category in industry field for now
        use_case: uc.title,
        company_size: uc.desc, // Storing desc in company_size for now as a hack to keep the schema simple
        avg_roi_pct: uc.impact,
        success_rate: 85,
        avg_timeline_mo: 6,
        avg_investment: uc.cost * 1000,
        data_year: 2026,
      },
    });
  }
  console.log('Seeded Benchmarks');

  // Seed Vendors (MongoDB)
  await VendorModel.deleteMany({});
  const VENDORS = [
    { name: "Databricks", category: "Data Infrastructure", status: "Verified", desc: "Unified analytics platform for massive scale data engineering, collaborative data science, and machine learning.", website_url: "https://www.databricks.com" },
    { name: "Snowflake", category: "Data Infrastructure", status: "Verified", desc: "Cloud data platform enabling data storage, processing, and analytic solutions that are faster, easier to use, and far more flexible.", website_url: "https://www.snowflake.com" },
    { name: "Anthropic", category: "Foundation Models", status: "Verified", desc: "AI safety and research company building reliable, interpretable, and steerable AI systems (Claude).", website_url: "https://www.anthropic.com" },
    { name: "Scale AI", category: "Data Labeling", status: "Partner", desc: "High-quality training data for AI applications, combining human intelligence with machine learning.", website_url: "https://scale.com" },
    { name: "Hugging Face", category: "MLOps", status: "Verified", desc: "The AI community building the future. Build, train and deploy state of the art models powered by the reference open source in machine learning.", website_url: "https://huggingface.co" },
    { name: "DataRobot", category: "AutoML", status: "Verified", desc: "Enterprise AI platform that democratizes data science and automates the end-to-end process for building, deploying, and maintaining machine learning.", website_url: "https://www.datarobot.com" },
  ];

  await VendorModel.insertMany(VENDORS);
  console.log('Seeded Vendors');

  await mongoose.disconnect();
  await prisma.$disconnect();
  console.log('Seed completed successfully.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
