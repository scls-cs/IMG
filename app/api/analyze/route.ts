import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log(request);
    const { filename } = await request.json();
    console.log(filename);

    const imageUrl = "";
    console.log("构建的图片URL:", imageUrl);
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2-VL-72B-Instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl, // 这里使用上传的图片路径
                },
              },
              {
                type: "text",
                text: "Describe the image.",
              },
            ],
          },
        ],
      }),
    };

    const response = await fetch(
      "https://api.siliconflow.cn/v1/chat/completions",
      options
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      description: data.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("分析失败:", error);
    return NextResponse.json(
      { error: error.message || "图片分析失败" },
      { status: 500 }
    );
  }
}
