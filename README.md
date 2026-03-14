# LifePilot AI - Full Stack AI Life Manager

LifePilot AI is a comprehensive, AI-powered personal organization system designed to help you manage every aspect of your life—from daily tasks and study schedules to expense tracking and goal setting.

## Features
- **AI Daily Planner**: Transform your intent into a structured schedule.
- **Smart Task Management**: AI-driven prioritization and tracking.
- **Expense Insights**: Categorized spending with AI budget analysis.
- **AI Study Planner**: Customized study schedules for students.
- **Goal Decomposer**: Break big dreams into actionable steps using AI.
- **Voice Assistant**: Natural language commands for hands-free management.
- **Modern UI**: Dark-mode first, glassmorphic responsive design.

## Tech Stack
- Frontend: Next.js 14, Tailwind CSS, Framer Motion, Lucide Icons
- Backend: Node.js, Express
- Database: MongoDB (via Mongoose)
- AI: Groq Cloud (Llama 3 model)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Groq API Key

### Backend Setup
1. `cd server`
2. `npm install`
3. Create `.env` file from `.env.example` (or use the one generated)
4. `npm start` (Runs on port 5000)

### Frontend Setup
1. `cd client`
2. `npm install`
3. `npm run dev` (Runs on port 3000)

## Deployment
- **Frontend**: Connect your GitHub repo to Vercel.
- **Backend**: Deploy to Render or Heroku. Ensure `MONGODB_URI` and `OPENAI_API_KEY` environment variables are set.

---
Built with ❤️ by Antigravity AI
