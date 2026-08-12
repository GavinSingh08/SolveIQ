# SolveIQ

> A coding analytics platform that helps developers understand their LeetCode progress, identify weaknesses, and improve their problem-solving skills.

SolveIQ connects to your LeetCode account and transforms your coding activity into actionable insights through a centralized analytics dashboard.

## Features

### 📊 Coding Analytics
- Track total problems solved
- Break down solved problems by difficulty
- Analyze progress over time
- Visualize LeetCode activity
- Track topic coverage and problem-solving patterns

### 🧩 Problem Tracking
- Automatically retrieve recently solved problems
- Store problem metadata including:
  - Problem title
  - Difficulty
  - Topics
  - Submission date
- View recently solved problems directly from the dashboard

### 📈 Topic Analysis
- Identify the topics you practice most
- Track problems solved across different categories
- Highlight areas where additional practice may be beneficial

### 🎨 Customizable Dashboard
- Multiple color themes
- Responsive dashboard interface
- Dark, minimal UI designed around data visualization

### 🔐 Authentication
- GitHub OAuth authentication
- User-specific data storage
- Secure association between authenticated users and their coding data

### 🤖 AI Coach *(Planned)*
- Personalized coding recommendations
- Identify weaknesses based on solving history
- Suggest problems based on individual progress
- AI-generated insights into coding habits

---

## Tech Stack

### Frontend
- **Next.js**
- **React**
- **TypeScript**
- CSS / responsive UI

### Backend & Data
- **Supabase**
- **PostgreSQL**
- Supabase Authentication
- Supabase database

### APIs
- **LeetCode GraphQL API**
- GitHub OAuth

### Development
- Node.js
- Git / GitHub

---

## Architecture

```text
                         ┌─────────────────┐
                         │     User        │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   SolveIQ UI    │
                         │ Next.js / React  │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐        ┌─────────────────┐
           │   LeetCode API  │        │    Supabase     │
           │    GraphQL      │        │ Auth + Database │
           └────────┬────────┘        └────────┬────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Analytics &     │
                         │ Recommendations │
                         └─────────────────┘
