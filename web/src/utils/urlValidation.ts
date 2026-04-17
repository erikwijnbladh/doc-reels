export function looksLikeDocs(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url)
    const docKeywords = /docs?|documentation|reference|guide|manual|wiki|learn|api|dev/i
    return docKeywords.test(hostname) || docKeywords.test(pathname)
  } catch {
    return false
  }
}
