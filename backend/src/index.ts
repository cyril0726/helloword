export default {
  async fetch(request: Request) {
    const url = new URL(request.url)

    if (url.pathname === '/api/hello') {
      return new Response(
        JSON.stringify({
          message: 'Hello World depuis Cloudflare Workers'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    return new Response('Not found', { status: 404 })
  }
}