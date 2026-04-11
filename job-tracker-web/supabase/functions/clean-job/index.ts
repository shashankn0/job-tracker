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
