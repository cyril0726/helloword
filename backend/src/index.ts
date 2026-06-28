export default {
  async fetch(request: Request) {
    const url = new URL(request.url)

    // normalisation robuste
    const pathname = url.pathname.replace(/\/+$/, '')

    if (pathname === '/api/hello') {
      return Response.json(
        { message: 'Hello World depuis Cloudflare Workers' },
        {
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    if (pathname === '' || pathname === '/') {
      return new Response("Worker API running 🚀")
    }

    return new Response(JSON.stringify({
  pathname: url.pathname,
  url: request.url
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
  }
}