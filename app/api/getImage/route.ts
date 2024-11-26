export async function POST(req: Request) {
  if (req.method === "POST") {
    const { prompt } = await req.json();

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stabilityai/stable-diffusion-3-5-large",
        prompt: prompt,
        image_size: "768x512",
        batch_size: 2,
      }),
    };

    try {
      const response = await fetch(
        "https://api.siliconflow.cn/v1/images/generations",
        options
      );
      const data = await response.json();
      return new Response(JSON.stringify(data.images), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error generating images:", error);
      return new Response(
        JSON.stringify({ error: "Error generating images" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
}
