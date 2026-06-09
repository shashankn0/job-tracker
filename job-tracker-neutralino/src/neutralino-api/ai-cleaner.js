export async function cleanJobDescription(rawText, company, title, apiKey) {
  const fallback = {
    company: company || '',
    title: title || '',
    location: '',
    role_id: '',
    cleaned_text: rawText,
  }

  if (!apiKey) {
    return fallback
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
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

Return ONLY the JSON, no other text.`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    })

    const data = await response.json()
    if (!data.choices?.[0]?.message?.content) {
      return fallback
    }

    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return fallback
    }

    const aiResult = JSON.parse(jsonMatch[0])
    let formattedText = rawText

    if (aiResult.cleaned_text && typeof aiResult.cleaned_text === 'object') {
      formattedText = Object.entries(aiResult.cleaned_text)
        .map(([section, sectionContent]) => `${section}\n\n${sectionContent}`)
        .join('\n\n')
    } else if (aiResult.cleaned_text) {
      formattedText = aiResult.cleaned_text
    }

    return {
      company: aiResult.company || company || '',
      title: aiResult.title || title || '',
      location: aiResult.location || '',
      role_id: aiResult.role_id || '',
      cleaned_text: formattedText,
    }
  } catch (error) {
    console.error('AI cleaning failed:', error)
    return fallback
  }
}
