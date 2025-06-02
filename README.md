# CRM-Misogi

A modern, AI-powered Customer Relationship Management (CRM) system built with Next.js and Supabase.

## Tech Stack

- **Frontend**: 
  - Next.js 15.2.4
  - React 19
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Lucide React icons

- **Backend**:
  - Supabase (PostgreSQL database)
  - Next.js API routes
  - OpenAI API integration

- **State Management & Forms**:
  - React Hook Form
  - Zod validation

- **Data Visualization**:
  - Recharts
  - Date-fns

## Core Components

### 1. Contact Management
- Create, view, edit, and delete contacts
- Contact details and history tracking
- Dual approach for contact storage:
  - Primary: Supabase database
  - Fallback: In-memory storage when database is unavailable

### 2. Deal Management
- Deal pipeline with customizable stages
- Deal value and probability tracking
- Win/loss analysis
- Deal details and history

### 3. Activity Management
- Activity tracking and reminders
- Activity timeline view
- Activity completion workflow
- Filtering and sorting

### 4. Reports & Analytics
- Key metrics dashboard
- Pipeline summary charts
- Deal value summaries
- Activity status reports

### 5. User Interface
- Responsive design
- Modern UI with shadcn/ui components
- Intuitive navigation
- Consistent styling across all pages

## AI Features & Prompts

### 1. Objection Handler
- AI-powered responses to customer objections
- Structured responses that:
  - Acknowledge customer concerns
  - Reframe objections positively
  - Provide value-based counterpoints
  - Suggest clear next steps
- Copy-to-clipboard functionality for responses

**AI Prompt:**
```
You are an expert sales professional.
Provide a concise and convincing response to handle this customer objection.
Your response should:
1. Acknowledge their concern empathetically
2. Reframe the objection positively
3. Provide specific value-based counter-points
4. Suggest a clear next step

Keep your response between 60-90 words and maintain a professional, confident tone.
```

### 2. Deal Analysis
- Win/loss analysis using AI
- Identifies key factors that contributed to deal outcomes
- Provides actionable insights and recommendations
- Analyzes patterns for future deal improvement

**AI Prompt for Win/Loss Analysis:**
```
You are an expert sales analyst.
Analyze this {won/lost} deal and provide insights.

Your analysis should include:
1. Key factors that contributed to the {win/loss}
2. Patterns or insights that can be applied to future deals
3. Specific recommendations for the sales team

Keep your response professional and actionable.
```

### 3. Deal Coach
- AI coaching for ongoing deals
- Provides actionable advice to improve close probability
- Focuses on practical next steps and objection handling
- Tailored to specific deal stages and values

**AI Prompt for Deal Coaching:**
```
You are an expert sales coach AI assistant.

Deal Information:
- Name: {deal.name}
- Stage: {deal.stage}
- Amount: ${deal.amount}
- Probability: {deal.probability}%
- Description: {deal.description}

Provide helpful, actionable advice to improve the close probability of this deal.
Focus on practical next steps, objection handling, and value proposition enhancement.
Be concise but thorough in your response.
```

### 4. Conversation Analysis
- AI analysis of sales conversations
- Identifies key points and potential objections
- Performs sentiment analysis
- Recommends follow-up questions and next steps

**AI Prompt for Conversation Analysis:**
```
You are an expert sales coach AI assistant.
Analyze the following conversation from a sales deal and provide actionable insights.
Focus on identifying:
1. Key points from the conversation
2. Potential customer objections
3. Sentiment analysis
4. Recommended next steps
5. Follow-up questions to ask

Your response should be structured and concise, with specific recommendations based on the deal stage.
Avoid generic advice and focus on what's relevant to this specific conversation.
```

### 5. Customer Persona Generation
- Creates detailed customer personas
- Analyzes contact information and interaction history
- Provides insights into customer behavior and preferences

**AI Prompt for Persona Generation:**
```
Generate a detailed customer persona based on the following information:

Contact Information:
Name: {name}
Job Title: {jobTitle}
Company: {company}
Industry: {industry}
Company Size: {companySize}

Communication Preferences:
Preferred Contact Time: {preferredContactTime}
Preferred Channels: {preferredChannels}
Response Time Expectation: {responseTimeExpectation}

Business Context:
Current Solution: {currentSolution}
Decision Timeline: {decisionTimeline}
Budget Range: {budgetRange}

Challenges and Goals:
Business Challenges: {businessChallenges}
Pain Points: {painPoints}
Goals: {goals}
Evaluation Criteria: {evaluationCriteria}
Decision Makers: {decisionMakers}

Please provide a detailed persona that includes:
1. Profile information (name, job title, company, industry, etc.)
2. Communication preferences and style
3. Decision-making process and timeline
4. Business challenges and pain points
5. Goals and objectives
6. Common objections and how to address them
7. Next steps and action items
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm-misogi
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env.local`
   - Fill in your Supabase URL, Supabase anon key, and OpenAI API key

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Database Setup

The application uses Supabase as its database. The schema includes tables for:
- contacts
- deals
- activities
- conversations
