const toHtmlResponse = async (response, request) => {
  const html = await response.text()
  const origin = new URL(request.url).origin
  const headers = new Headers(response.headers)

  headers.delete('content-length')
  return new Response(html.replaceAll('__SITE_ORIGIN__', origin), {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

export default {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request)
    const acceptsHtml = request.headers.get('accept')?.includes('text/html')

    if (response.status === 404 && acceptsHtml) {
      const indexUrl = new URL('/index.html', request.url)
      response = await env.ASSETS.fetch(new Request(indexUrl, request))
    }

    if (response.headers.get('content-type')?.includes('text/html')) {
      return toHtmlResponse(response, request)
    }

    return response
  },
}
