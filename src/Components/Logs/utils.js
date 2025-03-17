export const parseUserAgent = (userAgent) => {
  const osRegex = /\(([^)]+)\)/
  const browserRegex = /Chrome\/([\d.]+)/
  const webkitRegex = /AppleWebKit\/([\d.]+)/

  const osMatch = userAgent.match(osRegex)
  const browserMatch = userAgent.match(browserRegex)
  const webkitMatch = userAgent.match(webkitRegex)

  const os = osMatch ? osMatch[1] : ""
  const browser = browserMatch ? `Chrome ${browserMatch[1]}` : ""
  const webkit = webkitMatch ? `AppleWebKit ${webkitMatch[1]}` : ""

  return `${os} ${browser} ${webkit}`
}
