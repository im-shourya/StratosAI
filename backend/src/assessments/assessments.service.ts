import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { v4 as uuidv4 } from 'uuid';
import { MlIntegrationService } from '../ml-integration/ml-integration.service';
import { LlmService } from '../chat/llm.service';

import { VendorsService } from '../vendors/vendors.service';

// ── ML Feature Definitions ──────────────────────────────────────
// Maps directly to build_inference_row() in ml/feature_engineering.py
// These are the 7 fields the chat MUST collect.

export interface MlFieldDefinition {
  key: string;
  label: string;            // Human-readable label for the frontend tracker
  description: string;      // What to ask about
  type: 'float' | 'int' | 'text';  // text for descriptive fields like use_case
  min?: number;
  max?: number;
  unit: string;
  promptHint: string;       // Hint for the LLM to ask the right question
  fallbackRanges: string;   // Standardized ranges to offer when user doesn't know exact value
}

// Valid industries for the ML model (must match INDUSTRY_ORDER in ml/feature_engineering.py)
export const VALID_INDUSTRIES = [
  'Financial Services', 'Healthcare', 'Technology', 'Retail',
  'Manufacturing', 'Logistics', 'Energy', 'Education',
  'Agriculture', 'Telecom'
];

export const REQUIRED_ML_FIELDS: MlFieldDefinition[] = [
  {
    key: 'ai_investment_usd',
    label: 'Planned AI Budget (USD)',
    description: 'Total planned AI/ML investment or budget in US Dollars',
    type: 'float',
    min: 1000,
    max: 100_000_000_000,
    unit: 'USD',
    promptHint: 'Ask about their total planned AI/ML budget or investment amount in USD. Accept values in lakhs, crores, thousands (k), millions (M), or billions (B) and note the conversion.',
    fallbackRanges: 'Under $50K (use 25000) | $50K–$250K (use 150000) | $250K–$1M (use 625000) | $1M–$5M (use 3000000) | Over $5M (use 7500000)'
  },
  {
    key: 'ai_maturity_score',
    label: 'AI Maturity Level (1-10)',
    description: 'Current AI maturity on a 1-10 scale',
    type: 'float',
    min: 1.0,
    max: 10.0,
    unit: 'score',
    promptHint: 'Ask them to rate their current AI maturity on a scale of 1-10 (1 = no AI experience, 5 = some pilots running, 10 = AI-native organization).',
    fallbackRanges: 'Beginner / just exploring (use 2.0) | Some experiments running (use 4.0) | Active pilots in production (use 6.0) | AI integrated into core workflows (use 8.0) | AI-native organization (use 10.0)'
  },
  {
    key: 'automation_rate',
    label: 'Workflow Automation (%)',
    description: 'Percentage of workflows currently automated',
    type: 'float',
    min: 0.0,
    max: 1.0,
    unit: 'ratio (0-1)',
    promptHint: 'Ask what percentage of their current workflows or business processes are automated (0% to 100%). Store as a decimal ratio (e.g., 30% → 0.3).',
    fallbackRanges: 'Almost nothing automated (use 0.05) | A few key processes (use 0.2) | Roughly half (use 0.5) | Most workflows (use 0.75) | Fully automated (use 0.95)'
  },
  {
    key: 'ai_adoption_level',
    label: 'Org-Wide AI Adoption (%)',
    description: 'How widely AI has been adopted across the organization',
    type: 'float',
    min: 0.0,
    max: 1.0,
    unit: 'ratio (0-1)',
    promptHint: 'Ask how widely AI has been adopted across the organization. Map responses: "one team/pilot" → 0.1-0.2, "a few departments" → 0.3-0.4, "multiple departments" → 0.5-0.6, "most of the company" → 0.7-0.8, "company-wide" → 0.9-1.0.',
    fallbackRanges: 'One team or pilot project (use 0.15) | A few departments (use 0.35) | Multiple departments (use 0.55) | Most of the company (use 0.75) | Company-wide (use 0.9)'
  },
  {
    key: 'employee_training_hrs',
    label: 'AI Training (hrs/year)',
    description: 'Annual AI/ML training hours per employee',
    type: 'float',
    min: 0,
    max: 500,
    unit: 'hours',
    promptHint: 'Ask how many hours of AI/ML training each employee receives per year on average.',
    fallbackRanges: 'No formal training (use 0) | A few hours a year (use 8) | A week-long program (use 40) | Ongoing monthly training (use 100) | Intensive continuous learning (use 200)'
  },
  {
    key: 'num_deployments',
    label: 'Deployed AI Systems',
    description: 'Number of AI/ML systems currently deployed in production',
    type: 'int',
    min: 0,
    max: 500,
    unit: 'count',
    promptHint: 'Ask how many AI or ML models/systems they currently have running in production.',
    fallbackRanges: 'None yet (use 0) | 1–3 small tools (use 2) | 4–10 systems (use 7) | 10–25 across departments (use 18) | 25+ enterprise-wide (use 35)'
  },
  {
    key: 'use_case',
    label: 'AI Use Case',
    description: 'Brief description of the specific AI use case, business problem, or workflow they want to solve',
    type: 'text',
    unit: 'description',
    promptHint: 'Ask what specific business problem, workflow, or use case they want to solve with AI. Get a concrete description (e.g., "automate medical image diagnosis", "predict customer churn", "optimize supply chain routing").',
    fallbackRanges: 'Customer-facing AI (chatbots, recommendations) | Internal automation (process, workflow) | Analytics & prediction (forecasting, risk) | Content & creative (generation, synthesis) | Domain-specific (medical, legal, financial)'
  }
];

const REQUIRED_FIELD_KEYS = REQUIRED_ML_FIELDS.map(f => f.key);

// ── Extraction Prompt Template ──────────────────────────────────
// Lightweight, structured output call that ONLY targets missing fields.

function buildExtractionPrompt(chatTranscript: string, missingFields: MlFieldDefinition[]): string {
  const fieldDescriptions = missingFields.map(f => {
    if (f.type === 'text') {
      return `- "${f.key}": ${f.description}. Type: text (string). Unit: ${f.unit}.`;
    }
    return `- "${f.key}": ${f.description}. Type: ${f.type}. Valid range: ${f.min}–${f.max}. Unit: ${f.unit}. Fallback ranges: ${f.fallbackRanges}.`;
  }).join('\n');

  return `You are a precise data extraction engine. Analyze the following chat transcript and extract ONLY the fields listed below if the user has provided enough information to determine them.

FIELDS TO EXTRACT (only extract if the user has clearly stated or implied a value):
${fieldDescriptions}

IMPORTANT RULES:
- Return ONLY a JSON object with the fields you could extract.
- For numeric fields: each extracted field must have "value" (number), "raw_answer" (the exact user text you based this on), "confidence" ("high" or "low").
- For text fields (like use_case): use "value" (string — a concise summary of what the user described), "raw_answer" (the exact user text), "confidence" ("high" or "low").
- For automation_rate and ai_adoption_level: convert percentages to decimal (e.g., 30% → 0.3).
- For ai_investment_usd: convert any currency mentions to USD (1 lakh INR ≈ 1,200 USD, 1 crore INR ≈ 120,000 USD, "50k" → 50000, "2M" → 2000000).
- If the user selected a RANGE instead of an exact number (e.g., "$50K–$250K" or "a few departments"), use the median value specified in the fallback ranges above.
- Do NOT guess or fabricate values. If the user hasn't mentioned a field, omit it entirely.
- If a value falls outside the valid range, still extract it but note it.
- Return ONLY raw JSON, no markdown, no explanation.

CHAT TRANSCRIPT:
${chatTranscript}`;
}

// ── System Prompt Builder ───────────────────────────────────────
// Dynamically injects missing fields so the LLM targets them.

function buildSystemPrompt(missingFields: MlFieldDefinition[], collectedFields: string[]): string {
  const collectedStr = collectedFields.length > 0
    ? `\n\nYou have already collected: ${collectedFields.map(k => {
        const f = REQUIRED_ML_FIELDS.find(f => f.key === k);
        return f ? f.label : k;
      }).join(', ')}.`
    : '';

  const missingStr = missingFields.length > 0
    ? missingFields.map(f => `  • ${f.label}: ${f.promptHint}`).join('\n')
    : '  All data collected!';

  const fallbackStr = missingFields.length > 0
    ? missingFields.map(f => `  • ${f.label}: ${f.fallbackRanges}`).join('\n')
    : '';

  return `You are StratosAI, a world-class Corporate AI Strategy Advisor powering a predictive ML engine. Your mission is to collect specific, quantifiable data points from the user through a professional and engaging conversation.

CONVERSATION RULES:
- Ask ONE clear, focused question at a time.
- Be conversational, warm, and professional — you are advising a C-suite executive.
- When the user gives a vague answer, ask a brief clarifying follow-up to get a precise number.
- Do NOT ask about data points you've already collected.
- Keep responses concise (2-4 sentences max per turn).
- After collecting each data point, briefly acknowledge it before moving to the next.
${collectedStr}

HANDLING UNCERTAIN USERS:
If the user says they don't know, aren't sure, or are "just exploring" for ANY metric, DO NOT keep re-asking the same question. Instead, offer them a set of standardized ranges to choose from. This makes it easy for them to give a rough estimate. Present the ranges naturally, like: "No problem — to give you a useful analysis, would you say your expected budget is closer to: under $50K, $50K–$250K, $250K–$1M, or over $1M?"

FALLBACK RANGES PER FIELD:
${fallbackStr}

Never ask the same question more than twice. On the second attempt, always offer ranges.

DATA POINTS YOU STILL NEED TO COLLECT (prioritize these in order):
${missingStr}

${missingFields.length === 0 ? 'All required data has been collected. Thank the user, summarize the key metrics you gathered, and let them know they can now generate their strategic report.' : ''}

IMPORTANT: You are NOT making predictions or giving advice yet. You are gathering the precise inputs needed for the ML models to generate an accurate ROI prediction, risk assessment, and strategic roadmap.`;
}

// ─────────────────────────────────────────────────────────────────

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    private readonly mlIntegration: MlIntegrationService,
    @Inject(forwardRef(() => LlmService))
    private readonly llmService: LlmService,
    private readonly vendorsService: VendorsService
  ) {}

  // ═══════════════════════════════════════════════════════════════
  //  START ASSESSMENT
  // ═══════════════════════════════════════════════════════════════

  async startAssessment(data: StartAssessmentDto) {
    const sessionId = uuidv4();
    
    // 1. Create Assessment in PostgreSQL (Prisma)
    const assessment = await this.prisma.assessment.create({
      data: {
        user_id: data.user_id as string,
        session_id: sessionId,
        project_name: data.project_name || 'New Project',
        department: data.department || 'Unknown',
        ai_budget: 0,
        ai_maturity: 1,
        status: 'IN_PROGRESS'
      }
    });

    const initialExtractedData: any = {};
    if (data.department) initialExtractedData.department = data.department;
    if (data.project_name) initialExtractedData.project_name = data.project_name;

    const projectStr = data.project_name ? ` for the **${data.project_name}** project` : '';
    const deptStr = data.department ? ` in the **${data.department}** department` : '';
    
    // Build initial system prompt with ALL fields missing
    const systemPrompt = buildSystemPrompt(REQUIRED_ML_FIELDS, []);

    const initialMessage = {
      role: 'assistant',
      content: `Welcome to StratosAI — your AI-powered Strategic Intelligence Platform${projectStr}${deptStr}.\n\nI'll guide you through a brief assessment to build a comprehensive AI strategy roadmap tailored to your organization. I need to collect a few key data points to power our predictive models.\n\nLet's start with the most important one: **What is your organization's total planned budget or investment for AI initiatives?** Feel free to share in any currency — I'll handle the conversion.`,
      timestamp: new Date()
    };

    // 2. Create Conversation in MongoDB (Mongoose)
    const conversation = await this.conversationModel.create({
      assessment_id: assessment.id,
      session_id: sessionId,
      extracted_data: initialExtractedData,
      validated_fields: {},
      completion_pct: 0,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
          timestamp: new Date()
        },
        initialMessage
      ]
    });

    return {
      assessment_id: assessment.id,
      status: assessment.status,
      message: initialMessage,
      completion_status: this.getCompletionStatus({})
    };
  }

  // ═══════════════════════════════════════════════════════════════
  //  FIELD EXTRACTION & VALIDATION ENGINE
  // ═══════════════════════════════════════════════════════════════

  /**
   * After each user message, run a lightweight LLM extraction prompt
   * that targets ONLY the missing fields. Returns newly extracted fields.
   */
  async extractAndValidateFields(assessmentId: string): Promise<{
    newlyExtracted: Record<string, any>;
    completionStatus: ReturnType<typeof this.getCompletionStatus>;
  }> {
    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const currentValidated = conversation.validated_fields || {};
    const collectedKeys = Object.keys(currentValidated).filter(k => currentValidated[k]?.is_valid);
    const missingFieldDefs = REQUIRED_ML_FIELDS.filter(f => !collectedKeys.includes(f.key));

    // If all fields are already collected, skip extraction
    if (missingFieldDefs.length === 0) {
      return {
        newlyExtracted: {},
        completionStatus: this.getCompletionStatus(currentValidated)
      };
    }

    // Build a minimal transcript (skip system messages, keep last 10 messages for context)
    const recentMessages = conversation.messages
      .filter((m: any) => m.role !== 'system')
      .slice(-10);
    const chatTranscript = recentMessages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const extractionPrompt = buildExtractionPrompt(chatTranscript, missingFieldDefs);

    let extracted: Record<string, any> = {};
    try {
      const result = await this.llmService.generateResponse([
        { role: 'user', content: extractionPrompt }
      ], true); // isReportGeneration=true for single-shot, no chat history needed

      const cleanJson = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      extracted = JSON.parse(cleanJson);
      this.logger.log(`Extraction result: ${JSON.stringify(extracted)}`);
    } catch (err: any) {
      this.logger.warn(`Field extraction failed: ${err.message}`);
      return {
        newlyExtracted: {},
        completionStatus: this.getCompletionStatus(currentValidated)
      };
    }

    // Validate and merge newly extracted fields
    const newlyValidated: Record<string, any> = {};
    for (const fieldDef of missingFieldDefs) {
      const extractedField = extracted[fieldDef.key];
      if (!extractedField || extractedField.value === undefined || extractedField.value === null) continue;

      const validated = this.validateField(fieldDef, extractedField.value);
      if (validated.is_valid) {
        newlyValidated[fieldDef.key] = {
          value: validated.value,
          raw_answer: extractedField.raw_answer || '',
          is_valid: true,
          extracted_at: new Date()
        };
      }
    }

    // Merge into existing validated_fields
    const updatedValidated = { ...currentValidated, ...newlyValidated };
    const completionPct = this.calculateCompletionPct(updatedValidated);

    // Persist to MongoDB
    await this.conversationModel.updateOne(
      { assessment_id: assessmentId },
      {
        $set: {
          validated_fields: updatedValidated,
          completion_pct: completionPct,
          extracted_data: {
            ...conversation.extracted_data,
            ...Object.fromEntries(
              Object.entries(newlyValidated).map(([k, v]: [string, any]) => [k, v.value])
            )
          }
        }
      }
    );

    // Also sync key fields to PostgreSQL Assessment record
    if (Object.keys(newlyValidated).length > 0) {
      const prismaUpdate: any = {};
      if (newlyValidated.ai_investment_usd) prismaUpdate.ai_budget = newlyValidated.ai_investment_usd.value;
      if (newlyValidated.ai_maturity_score) prismaUpdate.ai_maturity = Math.round(newlyValidated.ai_maturity_score.value);
      if (newlyValidated.automation_rate) prismaUpdate.automation_rate = newlyValidated.automation_rate.value;
      if (newlyValidated.employee_training_hrs) prismaUpdate.employee_training_hours = newlyValidated.employee_training_hrs.value;
      if (newlyValidated.num_deployments) prismaUpdate.num_ai_deployments = newlyValidated.num_deployments.value;

      if (Object.keys(prismaUpdate).length > 0) {
        await this.prisma.assessment.update({
          where: { id: assessmentId },
          data: prismaUpdate
        });
      }
    }

    const completionStatus = this.getCompletionStatus(updatedValidated);

    // If all fields are now complete, mark conversation
    if (completionStatus.isComplete) {
      await this.conversationModel.updateOne(
        { assessment_id: assessmentId },
        { $set: { complete: true, phase: 'COMPLETE' } }
      );
    }

    return { newlyExtracted: newlyValidated, completionStatus };
  }

  /**
   * Validates a single field value against the ML model's expected range.
   */
  private validateField(fieldDef: MlFieldDefinition, rawValue: any): { is_valid: boolean; value: number | string } {
    // Text fields: just validate non-empty
    if (fieldDef.type === 'text') {
      const strValue = String(rawValue || '').trim();
      return { is_valid: strValue.length > 0, value: strValue };
    }

    // Numeric fields
    let value = typeof rawValue === 'string' ? parseFloat(rawValue) : Number(rawValue);

    if (isNaN(value)) {
      return { is_valid: false, value: 0 };
    }

    // Clamp to valid range
    if (fieldDef.type === 'int') {
      value = Math.round(value);
    }

    // Check if within valid range (with small tolerance)
    const isWithinRange = value >= (fieldDef.min ?? 0) && value <= (fieldDef.max ?? Infinity);

    if (!isWithinRange) {
      // Auto-correct common mistakes
      if (fieldDef.key === 'automation_rate' || fieldDef.key === 'ai_adoption_level') {
        // User might say "30" meaning 30% → convert to 0.3
        if (value > 1 && value <= 100) {
          value = value / 100;
        }
      }
      // Re-check after correction
      if (fieldDef.min !== undefined && value < fieldDef.min) value = fieldDef.min;
      if (fieldDef.max !== undefined && value > fieldDef.max) value = fieldDef.max;
    }

    return { is_valid: true, value };
  }

  /**
   * Returns completion status for the frontend tracker.
   */
  getCompletionStatus(validatedFields: Record<string, any>) {
    const fields = REQUIRED_ML_FIELDS.map(f => {
      const validated = validatedFields[f.key];
      return {
        key: f.key,
        label: f.label,
        description: f.description,
        unit: f.unit,
        collected: !!(validated?.is_valid),
        value: validated?.is_valid ? validated.value : null,
        raw_answer: validated?.raw_answer || null
      };
    });

    const collectedCount = fields.filter(f => f.collected).length;
    const totalCount = fields.length;
    const pct = Math.round((collectedCount / totalCount) * 100);

    return {
      fields,
      collectedCount,
      totalCount,
      pct,
      isComplete: collectedCount === totalCount,
      missingFields: fields.filter(f => !f.collected).map(f => f.label)
    };
  }

  private calculateCompletionPct(validatedFields: Record<string, any>): number {
    const collectedCount = REQUIRED_FIELD_KEYS.filter(
      k => validatedFields[k]?.is_valid
    ).length;
    return Math.round((collectedCount / REQUIRED_FIELD_KEYS.length) * 100);
  }

  /**
   * Infers the target industry for the ML model from assessment context.
   * Uses LLM to map (project_name + department + use_case) → one of the 10 valid industries.
   * A tech company building healthcare AI → "Healthcare", not "Technology".
   */
  async inferTargetIndustry(projectName: string, department: string, useCase: string): Promise<string> {
    const validList = VALID_INDUSTRIES.join(', ');

    const prompt = `You are a classification engine. Given the following AI project context, determine which SINGLE industry category this project targets. The industry should reflect the DOMAIN the AI is being applied to, NOT the company's own industry.

PROJECT NAME: ${projectName || 'N/A'}
DEPARTMENT: ${department || 'N/A'}
AI USE CASE: ${useCase || 'N/A'}

VALID INDUSTRIES (pick exactly one):
${validList}

Return ONLY the industry name from the list above, nothing else. No quotes, no explanation.`;

    try {
      const result = await this.llmService.generateResponse([
        { role: 'user', content: prompt }
      ], true);

      const cleaned = result.trim().replace(/['"]/g, '');

      // Find the closest match from valid industries
      const exactMatch = VALID_INDUSTRIES.find(
        i => i.toLowerCase() === cleaned.toLowerCase()
      );
      if (exactMatch) return exactMatch;

      // Partial match (e.g., LLM returns "healthcare" instead of "Healthcare")
      const partialMatch = VALID_INDUSTRIES.find(
        i => cleaned.toLowerCase().includes(i.toLowerCase()) ||
             i.toLowerCase().includes(cleaned.toLowerCase())
      );
      if (partialMatch) return partialMatch;

      this.logger.warn(`LLM returned unrecognized industry "${cleaned}", falling back to keyword matching`);
    } catch (err: any) {
      this.logger.warn(`Industry inference LLM call failed: ${err.message}, using keyword fallback`);
    }

    // Keyword-based fallback
    const context = `${projectName} ${department} ${useCase}`.toLowerCase();
    const keywordMap: Record<string, string[]> = {
      'Healthcare': ['health', 'medical', 'clinical', 'patient', 'hospital', 'pharma', 'diagnosis', 'ehr', 'imaging'],
      'Financial Services': ['finance', 'banking', 'insurance', 'trading', 'fintech', 'payment', 'credit', 'loan', 'investment'],
      'Retail': ['retail', 'ecommerce', 'e-commerce', 'shopping', 'store', 'inventory', 'customer', 'product recommendation'],
      'Manufacturing': ['manufacturing', 'factory', 'production', 'quality control', 'assembly', 'industrial'],
      'Logistics': ['logistics', 'supply chain', 'shipping', 'warehouse', 'delivery', 'fleet', 'routing', 'transport'],
      'Energy': ['energy', 'oil', 'gas', 'solar', 'wind', 'power', 'grid', 'utility', 'renewable'],
      'Education': ['education', 'learning', 'student', 'university', 'school', 'training', 'edtech', 'curriculum'],
      'Agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'agritech', 'soil', 'harvest', 'irrigation'],
      'Telecom': ['telecom', 'network', 'wireless', '5g', 'broadband', 'mobile', 'connectivity'],
      'Technology': ['software', 'saas', 'platform', 'cloud', 'devops', 'api', 'data platform'],
    };

    for (const [industry, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(kw => context.includes(kw))) {
        return industry;
      }
    }

    return 'Technology'; // Ultimate fallback
  }

  /**
   * Updates the system prompt with current missing-field awareness.
   * Called before generating the LLM response so it targets the right data.
   */
  async updateSystemPromptForTurn(assessmentId: string): Promise<void> {
    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) return;

    const currentValidated = conversation.validated_fields || {};
    const collectedKeys = Object.keys(currentValidated).filter(k => currentValidated[k]?.is_valid);
    const missingFieldDefs = REQUIRED_ML_FIELDS.filter(f => !collectedKeys.includes(f.key));

    const updatedSystemPrompt = buildSystemPrompt(missingFieldDefs, collectedKeys);

    // Update the system message in the conversation
    const messages = conversation.messages;
    if (messages.length > 0 && messages[0].role === 'system') {
      messages[0].content = updatedSystemPrompt;
    } else {
      messages.unshift({
        role: 'system',
        content: updatedSystemPrompt,
        timestamp: new Date()
      } as any);
    }

    await this.conversationModel.updateOne(
      { assessment_id: assessmentId },
      { $set: { messages } }
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  GET ASSESSMENT
  // ═══════════════════════════════════════════════════════════════

  async getAssessment(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({ 
      where: { id: assessmentId },
      include: { prediction: true, user: true }
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    return {
      ...assessment,
      chat_history: conversation.messages,
      extracted_data: conversation.extracted_data,
      validated_fields: conversation.validated_fields || {},
      completion_status: this.getCompletionStatus(conversation.validated_fields || {}),
      phase: conversation.phase
    };
  }

  // ═══════════════════════════════════════════════════════════════
  //  GET ALL ASSESSMENTS
  // ═══════════════════════════════════════════════════════════════

  async getAllAssessments(userId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { user_id: userId },
      include: { prediction: true },
      orderBy: { created_at: 'desc' }
    });

    const assessmentIds = assessments.map(a => a.id);
    const conversations = await this.conversationModel.find({ assessment_id: { $in: assessmentIds } });

    return assessments.map(a => {
      let progress = 0;
      if (a.status === 'completed' || a.status === 'COMPLETED') progress = 100;
      else if (a.status === 'error' || a.status === 'FAILED') progress = 40;
      else {
        const conversation = conversations.find(c => c.assessment_id === a.id);
        if (conversation) {
          // Use field-based completion instead of message count
          progress = conversation.completion_pct || 0;
          // If completion_pct isn't set yet, fall back to message-based estimate
          if (progress === 0 && conversation.messages) {
            const assistantMsgs = conversation.messages.filter((m: any) => m.role === 'assistant').length;
            progress = Math.min(95, Math.round((assistantMsgs / 7) * 100));
          }
        } else {
          progress = 5;
        }
      }

      return {
        id: a.id,
        project_name: a.project_name,
        department: a.department,
        status: a.status.toLowerCase(),
        date: a.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        roi: a.prediction?.roi_percentage ? `${a.prediction.roi_percentage}%` : '--',
        progress
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  ADD MESSAGE
  // ═══════════════════════════════════════════════════════════════

  async addMessage(assessmentId: string, message: { role: string; content: string; timestamp: Date }) {
    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    conversation.messages.push(message);
    await conversation.save();
    return message;
  }

  // ═══════════════════════════════════════════════════════════════
  //  ANALYZE ASSESSMENT (ML Pipeline)
  // ═══════════════════════════════════════════════════════════════

  async analyzeAssessment(assessmentId: string, userId: string) {
    // Verify all fields are collected before running analysis
    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const completionStatus = this.getCompletionStatus(conversation.validated_fields || {});
    if (!completionStatus.isComplete) {
      throw new BadRequestException(
        `Cannot analyze: ${completionStatus.missingFields.length} required field(s) still missing: ${completionStatus.missingFields.join(', ')}. Complete the chat assessment first.`
      );
    }

    this.logger.log(`Starting analysis for assessment ${assessmentId} (User: ${userId})`);
    const results = await this.executeAnalysis(assessmentId, userId);
    return { status: 'COMPLETED', results };
  }

  async executeAnalysis(assessmentId: string, userId: string) {
    const assessment = await this.getAssessment(assessmentId);
    const validatedFields = assessment.validated_fields || {};

    try {
      // ── Build ML features from validated chat data ────────────
      // Use validated_fields directly — NO hardcoded defaults.
      // The fields are guaranteed to exist because analyzeAssessment() checks completeness.
      const extractedFeatures = {
        ai_investment_usd: Number(validatedFields.ai_investment_usd?.value),
        ai_maturity_score: Number(validatedFields.ai_maturity_score?.value),
        automation_rate: Number(validatedFields.automation_rate?.value),
        ai_adoption_level: Number(validatedFields.ai_adoption_level?.value),
        employee_training_hrs: Number(validatedFields.employee_training_hrs?.value),
        num_deployments: Number(validatedFields.num_deployments?.value),
      };

      this.logger.log(`Using validated ML features: ${JSON.stringify(extractedFeatures)}`);

      // Sync validated features to Postgres
      await this.prisma.assessment.update({
        where: { id: assessment.id },
        data: {
          ai_budget: extractedFeatures.ai_investment_usd,
          ai_maturity: Math.round(extractedFeatures.ai_maturity_score),
          automation_rate: extractedFeatures.automation_rate,
          employee_training_hours: extractedFeatures.employee_training_hrs,
          num_ai_deployments: extractedFeatures.num_deployments,
        }
      });

      // Save to MongoDB extracted_data as well
      await this.conversationModel.updateOne(
        { assessment_id: assessment.id },
        { $set: { extracted_data: { ...assessment.extracted_data, ...extractedFeatures } } }
      );

      // ── Infer target industry from assessment context ────────
      // Don't use user.industry — a tech company might be building healthcare AI.
      // Instead, infer from project_name + department + use_case.
      const useCase = validatedFields.use_case?.value as string || '';
      const inferredIndustry = await this.inferTargetIndustry(
        assessment.project_name,
        assessment.department || '',
        useCase
      );
      this.logger.log(`Inferred target industry: ${inferredIndustry} (from project: ${assessment.project_name}, dept: ${assessment.department}, use_case: ${useCase})`);

      // ── Call ML Integration ───────────────────────────────────
      const features = {
        industry: inferredIndustry,
        country: assessment.user?.country || 'US',
        budget: extractedFeatures.ai_investment_usd,
        maturity: extractedFeatures.ai_maturity_score,
        ...extractedFeatures
      };
      
      const mlResults = await this.mlIntegration.predictFull(features);

      // Map nested Flask response to flat Prisma fields
      const roi         = mlResults.roi || {};
      const prod        = mlResults.productivity || {};
      const risk        = mlResults.risk || {};
      const riskScores  = risk.risk_scores || {};
      const maturity    = mlResults.maturity || {};
      const scenarios   = mlResults.scenarios || {};
      const readiness   = mlResults.readiness || {};
      const tfScore     = mlResults.transformation_score || 0;

      // Save ML results to predictions table and update Assessment using a Transaction
      await this.prisma.$transaction([
        this.prisma.prediction.upsert({
          where: { assessment_id: assessment.id },
          update: {
            annual_revenue_impact: roi.quarterly_revenue_impact ? roi.quarterly_revenue_impact * 4 : 0,
            quarterly_revenue_impact: roi.quarterly_revenue_impact || 0,
            annual_net_benefit: roi.annual_net_benefit || 0,
            productivity_gain_pct: prod.predicted_productivity_gain || 0,
            roi_percentage: roi.roi_percentage || 0,
            payback_months: roi.payback_months || 0,
            risk_score: riskScores.technical?.score || riskScores.technical || 0,
            transformation_score: tfScore,
            readiness_level: readiness.readiness_level || 'LOW',
            maturity_tier: maturity.maturity_tier || 1,
            peer_percentile: maturity.peer_percentile || 0,
            risk_technical: typeof riskScores.technical === 'object' ? riskScores.technical.score : (riskScores.technical || 0),
            risk_financial: typeof riskScores.financial === 'object' ? riskScores.financial.score : (riskScores.financial || 0),
            risk_talent: typeof riskScores.talent === 'object' ? riskScores.talent.score : (riskScores.talent || 0),
            risk_regulatory: typeof riskScores.regulatory === 'object' ? riskScores.regulatory.score : (riskScores.regulatory || 0),
            risk_market: typeof riskScores.market === 'object' ? riskScores.market.score : (riskScores.market || 0),
            scenario_baseline_roi: scenarios.conservative?.roi_pct || roi.roi_percentage || 0,
            scenario_cautious_roi: scenarios.cautious?.roi_pct || 0,
            scenario_aggressive_roi: scenarios.aggressive?.roi_pct || 0,
            board_recommendation: scenarios.board_recommendation || '',
            model_version: '2.0.0',
            predicted_at: new Date()
          },
          create: {
            assessment_id: assessment.id,
            annual_revenue_impact: roi.quarterly_revenue_impact ? roi.quarterly_revenue_impact * 4 : 0,
            quarterly_revenue_impact: roi.quarterly_revenue_impact || 0,
            annual_net_benefit: roi.annual_net_benefit || 0,
            productivity_gain_pct: prod.predicted_productivity_gain || 0,
            roi_percentage: roi.roi_percentage || 0,
            payback_months: roi.payback_months || 0,
            risk_score: riskScores.technical?.score || riskScores.technical || 0,
            transformation_score: tfScore,
            readiness_level: readiness.readiness_level || 'LOW',
            maturity_tier: maturity.maturity_tier || 1,
            peer_percentile: maturity.peer_percentile || 0,
            risk_technical: typeof riskScores.technical === 'object' ? riskScores.technical.score : (riskScores.technical || 0),
            risk_financial: typeof riskScores.financial === 'object' ? riskScores.financial.score : (riskScores.financial || 0),
            risk_talent: typeof riskScores.talent === 'object' ? riskScores.talent.score : (riskScores.technical || 0),
            risk_regulatory: typeof riskScores.regulatory === 'object' ? riskScores.regulatory.score : (riskScores.regulatory || 0),
            risk_market: typeof riskScores.market === 'object' ? riskScores.market.score : (riskScores.market || 0),
            scenario_baseline_roi: scenarios.conservative?.roi_pct || roi.roi_percentage || 0,
            scenario_cautious_roi: scenarios.cautious?.roi_pct || 0,
            scenario_aggressive_roi: scenarios.aggressive?.roi_pct || 0,
            board_recommendation: scenarios.board_recommendation || '',
            model_version: '2.0.0'
          }
        }),
        this.prisma.assessment.update({
          where: { id: assessment.id },
          data: { status: 'COMPLETED' }
        })
      ]);

      return mlResults;
    } catch (error: any) {
      this.logger.error(`Analysis failed for ${assessmentId} (User: ${userId}), performing soft rollback. Error: ${error.message}`);
      
      // Soft Delete / Rollback
      await this.prisma.assessment.update({
        where: { id: assessmentId },
        data: { status: 'FAILED' }
      });

      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  GLOBAL SEARCH
  // ═══════════════════════════════════════════════════════════════

  async searchGlobal(userId: string, query: string) {
    if (!query || query.length < 2) return { assessments: [], vendors: [] };

    // Check if query is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);

    const orConditions: any[] = [
      { project_name: { contains: query, mode: 'insensitive' } },
      { department: { contains: query, mode: 'insensitive' } }
    ];

    if (isUuid) {
      orConditions.push({ id: query });
    }

    // Search assessments by project name, department, or exact ID
    const assessments = await this.prisma.assessment.findMany({
      where: {
        user_id: userId,
        OR: orConditions
      },
      take: 5,
      select: {
        id: true,
        project_name: true,
        department: true,
        status: true,
        created_at: true
      }
    });

    // Search vendors
    const vendors = await this.vendorsService.search(query);

    return { assessments, vendors };
  }
}
