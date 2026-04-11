# Job Tracker Web

A web-based job application tracker with AI-powered job description cleaning, built with React, Vite, Supabase, and deployed to Vercel.

## Features

- **AI-Powered Cleaning**: Automatically extracts company name, job title, location, and role ID from job descriptions
- **User Authentication**: Sign in with Google or email/password via Supabase Auth
- **Cloud Storage**: All job data stored in Supabase with row-level security
- **Clean Formatting**: Organizes job descriptions into standardized sections
- **Dark Mode UI**: Modern dark theme with deep red/crimson accent palette

## Tech Stack

- **Frontend**: React, Vite, React Router
- **Styling**: Tailwind CSS with custom color palette
- **Backend**: Supabase (database + auth)
- **AI**: Supabase Edge Function with Claude 3 Haiku
- **Deployment**: Vercel

## Prerequisites

- Node.js (v18 or higher)
- Supabase account (free tier)
- OpenRouter API key (for Claude via OpenRouter)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually 1-2 minutes)
3. Go to Project Settings → API to get your:
   - Project URL
   - anon/public key

### 2. Set Up the Database Schema

1. Go to the Supabase SQL Editor
2. Run the following SQL:

```sql
create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company text,
  title text,
  role_id text,
  location text,
  saved_date timestamptz default now(),
  cleaned_text text,
  raw_text text
);

alter table jobs enable row level security;

create policy "Users can only access their own jobs"
on jobs for all
using (auth.uid() = user_id);
```

### 3. Set Up Google OAuth

1. Go to Supabase Auth → Providers
2. Enable Google provider
3. Add your Google OAuth credentials (follow Supabase's instructions)
4. Add your app's URL to the allowed redirect URLs

### 4. Create the Supabase Edge Function

1. Install Supabase CLI: `npm install -g supabase`
2. In your project root, run: `supabase functions new clean-job`
3. Edit the generated `supabase/functions/clean-job/index.ts` file:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')

serve(async (req) => {
  try {
    const { rawText } = await req.json()

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://your-app-url.com',
        'X-Title': 'Job Tracker',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: `Extract and clean the following job posting. Return ONLY a JSON object with these exact keys:
- company: the company name
- title: the job title
- location: the location (city, state, or remote)
- role_id: the job ID or requisition number if present
- cleaned_text: a clean, well-formatted version of the job description with standardized sections

For cleaned_text, organize the description into these standard sections (use these exact section headers):
- About the Company
- Position Overview
- Responsibilities
- Qualifications
- Additional Information

If a section doesn't have information, omit it. Use consistent formatting with proper spacing between sections.

Job posting:
${rawText}

Return ONLY the JSON, no other text.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      company: '',
      title: '',
      location: '',
      role_id: '',
      cleaned_text: rawText
    }

    let formattedText = rawText
    if (aiResult.cleaned_text && typeof aiResult.cleaned_text === 'object') {
      formattedText = Object.entries(aiResult.cleaned_text)
        .map(([section, content]) => `${section}\n\n${content}`)
        .join('\n\n')
    } else if (aiResult.cleaned_text) {
      formattedText = aiResult.cleaned_text
    }

    return new Response(
      JSON.stringify({
        cleaned_data: {
          company: aiResult.company,
          title: aiResult.title,
          location: aiResult.location,
          role_id: aiResult.role_id,
          cleaned_text: formattedText
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

4. Deploy the function: `supabase functions deploy clean-job`
5. Add your OpenRouter API key as an environment variable:
   - In Supabase dashboard: Edge Functions → clean-job → Environment Variables
   - Add: `OPENROUTER_API_KEY=your_openrouter_api_key`

### 5. Set Up the Web App

1. Clone the repository:
```bash
git clone <repository-url>
cd job-tracker-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## License

MIT
