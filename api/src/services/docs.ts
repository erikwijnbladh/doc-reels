export async function fetchDocs(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DocReels/1.0' },
  })
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`)

  const contentType = res.headers.get('content-type') ?? ''
  const text = await res.text()

  if (contentType.includes('text/html')) {
    return extractTextFromHtml(text)
  }
  return text
}

function extractTextFromHtml(html: string): string {
  // Strip head, scripts, styles, nav, footer
  html = html.replace(/<head[\s\S]*?<\/head>/gi, '')
  html = html.replace(
    /<(script|style|nav|footer|header|aside)[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  )
  // Strip remaining tags
  html = html.replace(/<[^>]+>/g, ' ')
  // Decode entities
  html = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  // Normalize whitespace
  return html.replace(/\s+/g, ' ').trim()
}
