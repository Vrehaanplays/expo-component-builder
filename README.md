# 🧠 Nuance — Train Your Judgment (Arena MVP)

Nuance is a modern, high-fidelity mental fitness web application designed to train logical reasoning and critical thinking. The Arena MVP focuses on daily critical thinking challenges, scored via shards and streaks, with a global competitive leaderboard.

## 🛠️ Technology Stack

- **Core**: React 19 + TypeScript + Vite 7
- **Routing**: TanStack Router (File-based routing)
- **State & Data Fetching**: TanStack React Query v5
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **AI Engine**: Gemini 2.5 Flash (for scenario generation) & Groq Llama-3.1-8b-instant (for quick critical thinking coach feedback)
- **Design System**: Vanilla CSS custom design system (defined in `src/styles.css`) + Radix UI / shadcn components for overlays

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env.local` file in the root directory (already configured in production Vercel):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_GROQ_API_KEY=your-groq-key
```

### 2. Install Dependencies
```bash
npm install
# or using pnpm
pnpm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build & Verify for Production
```bash
npm run build
npm run lint
```

---

## 🗄️ Database & RLS Structure

The application queries the following tables in the `public` schema on Supabase:
1. **`profiles`**: Stores username, streak metrics, accuracy, and total shards.
2. **`scenarios`**: Stores AI-generated logical fallacy scenarios, options, correct options, and explanations.
3. **`sessions`**: Records each game play (user answers, response times, correctness, and points earned).
4. **`daily_challenges`**: Maps dates (`YYYY-MM-DD`) to their active scenario IDs.

All migrations, policies, and helper functions are documented in `/supabase/migrations`.

---

## 🛠️ Version Control & Debugging Workflows

To ensure easy debugging, rollbacks, and code management, follow these Git and Vercel command workflows:

### 1. Reverting Code Changes (Local Git)
If a bug is introduced and you need to discard uncommitted changes:
```bash
# Discard all local unstaged modifications
git checkout -- .

# Discard all changes (including staged ones) and clean untracked files
git reset --hard HEAD
git clean -fd
```

To revert to a specific older commit:
```bash
# View git history (press Q to exit)
git log --oneline -n 20

# Revert to a specific commit by hash (creates a new commit that undoes changes)
git revert <commit-hash>

# Alternatively, temporarily check out a specific older commit to test it:
git checkout <commit-hash>
# Return to the main branch when done:
git checkout main
```

### 2. Branching & Merging
Always develop features on a separate branch before merging to `main`:
```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: implement your feature"

# Merge to main
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

### 3. Reverting Vercel Deployments
If a bad deployment is pushed to production, you can instantly roll back to a stable build using the Vercel CLI without pushing a Git revert:
```bash
# List recent deployments to find the stable deployment ID (e.g. dpl_xxx)
vercel list

# Promote the stable deployment ID directly to production (instant rollback)
vercel promote <stable-deployment-id>
```

---

## ⚙️ Testing & Seed Dashboard
Access `/debug` in your browser (e.g. `https://expo-component-builder.vercel.app/debug`) to:
- **Seed Leaderboard**: Instantly populate the all-time ranking with 10 mock competitive users.
- **Clear Mock Users**: Remove all mock users to clean up the leaderboard.
- **Reset Stats**: Wipe your personal gameplay sessions and reset shards to 0.
- **Quick Test Login**: Log in instantly with a test account to bypass signup forms.
