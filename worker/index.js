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
    const url = new URL(request.url)
    const acceptsHtml = request.headers.get('accept')?.includes('text/html')
    const isAppRoute = acceptsHtml && !url.pathname.split('/').at(-1).includes('.')
    let response = isAppRoute
      ? await env.ASSETS.fetch(
          new Request(new URL('/', request.url), request),
        )
      : await env.ASSETS.fetch(request)

    if (response.status === 404 && acceptsHtml) {
      const rootUrl = new URL('/', request.url)
      response = await env.ASSETS.fetch(new Request(rootUrl, request))
    }

    if (response.headers.get('content-type')?.includes('text/html')) {
      return toHtmlResponse(response, request)
    }

    return response
  },
}
