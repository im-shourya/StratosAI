import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(userId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { user_id: userId },
      include: { prediction: true },
    });

    const uniqueDepartments = new Set(assessments.map(a => a.department).filter(Boolean));
    const departmentsEngaged = uniqueDepartments.size;
    const completedProjects = assessments.filter(a => a.status.toLowerCase() === 'completed').length;

    let totalProjectedRoi = 0;
    assessments.forEach(a => {
      if (a.prediction && a.prediction.annual_net_benefit) {
        totalProjectedRoi += Number(a.prediction.annual_net_benefit);
      }
    });

    return {
      totalProjectedRoi: `$${totalProjectedRoi.toLocaleString()}`,
      departmentsEngaged: departmentsEngaged.toLocaleString(),
      completedProjects: completedProjects.toLocaleString(),
    };
  }

  async getPipeline(userId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { user_id: userId },
    });

    // Simple status mapping for internal projects
    const initiated = assessments.length;
    const connected = assessments.filter(a => Number(a.ai_maturity) > 1 || a.status.toLowerCase() === 'completed').length;
    const modeled = assessments.filter(a => Number(a.ai_maturity) > 2 || a.status.toLowerCase() === 'completed').length;
    const deployed = assessments.filter(a => a.status.toLowerCase() === 'completed').length;
    const roiRealized = assessments.filter(a => a.status.toLowerCase() === 'completed' && Number(a.ai_budget) > 0).length;

    return [
      { label: "Assessments Initiated", value: initiated, displayValue: initiated.toString() },
      { label: "Data Connected", value: connected, displayValue: connected.toString() },
      { label: "Models Developed", value: modeled, displayValue: modeled.toString() },
      { label: "Projects Deployed", value: deployed, displayValue: deployed.toString() },
      { label: "ROI Realized", value: roiRealized, displayValue: roiRealized.toString() },
    ];
  }

  async getBudget(userId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { user_id: userId },
    });

    const budgetByDept: Record<string, number> = {};
    let totalBudget = 0;

    assessments.forEach(a => {
      const dept = a.department || "Other";
      const budget = Number(a.ai_budget || 0);
      if (budget > 0) {
        budgetByDept[dept] = (budgetByDept[dept] || 0) + budget;
        totalBudget += budget;
      }
    });

    const colors = ["#2980B9", "#6C3483", "#1D9E75", "#D4AC0D", "#C0392B", "#273746"];
    const result = Object.entries(budgetByDept).map(([name, value], idx) => ({
      name,
      value,
      percentage: totalBudget > 0 ? (value / totalBudget) * 100 : 0,
      color: colors[idx % colors.length]
    }));

    // Sort by largest budget first
    result.sort((a, b) => b.value - a.value);

    return result;
  }

  async getRisks(userId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { user_id: userId },
      include: { prediction: true },
    });

    let technical = 0, financial = 0, talent = 0, regulatory = 0, market = 0;
    let count = 0;

    assessments.forEach(a => {
      if (a.prediction) {
        technical += Number(a.prediction.risk_technical || 0);
        financial += Number(a.prediction.risk_financial || 0);
        talent += Number(a.prediction.risk_talent || 0);
        regulatory += Number(a.prediction.risk_regulatory || 0);
        market += Number(a.prediction.risk_market || 0);
        count++;
      }
    });

    if (count > 0) {
      technical /= count;
      financial /= count;
      talent /= count;
      regulatory /= count;
      market /= count;
    }

    return [
      { label: "Technical", score: count > 0 ? technical : 40, stripeStr: "repeating-linear-gradient(45deg, #3B82F6, #3B82F6 2px, #60A5FA 2px, #60A5FA 6px)" },
      { label: "Financial", score: count > 0 ? financial : 30, stripeStr: "repeating-linear-gradient(45deg, #10B981, #10B981 2px, #34D399 2px, #34D399 6px)" },
      { label: "Talent", score: count > 0 ? talent : 75, stripeStr: "repeating-linear-gradient(45deg, #EF4444, #EF4444 2px, #F87171 2px, #F87171 6px)" },
      { label: "Regulatory", score: count > 0 ? regulatory : 20, stripeStr: "repeating-linear-gradient(45deg, #8B5CF6, #8B5CF6 2px, #A78BFA 2px, #A78BFA 6px)" },
      { label: "Market", score: count > 0 ? market : 15, stripeStr: "repeating-linear-gradient(45deg, #F59E0B, #F59E0B 2px, #FBBF24 2px, #FBBF24 6px)" },
    ];
  }
}
