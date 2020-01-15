function base64UrlEncode(base64) {
  return base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(base64url) {
  const padding = 4 - (base64url.length % 4)

  return base64url
    .padEnd(base64url.length + (padding !== 4 ? padding : 0), '=')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
}

module.exports = {
  base64UrlDecode,
  base64UrlEncode
}
