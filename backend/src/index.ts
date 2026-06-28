export default {
  async fetch(request: Request) {
    const { pathname } = new URL(request.url)

    if (pathname === "/api/hello") {
      return Response.json(
        { message: "Hello World depuis Cloudflare Workers" },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    if (pathname === "/") {
      return new Response("Worker API running 🚀")
    }

    return new Response("Not found", { status: 404 })
  },
}