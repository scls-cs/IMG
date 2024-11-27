import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const analyze_prompt = `You need to look at the screenshot and take the following actions:
  
  1.  Identify the species as specifically as possible.
      
  2.  Describe the image with rich detail. Include the species name, its physical appearance, the setting or background, and any notable behavior or action the animal is performing in the image. Mention details like the animal's age (if possible to infer), color, size, and any notable physical features (e.g., "a young golden retriever with a shiny golden coat and expressive eyes"). Be as descriptive as possible to help someone visualize the scene. Please return the result in JSON format with keys 'species' and 'description'.`;

  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    // 第一步：描述图片
    const describeOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2-VL-72B-Instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
              {
                type: "text",
                text: analyze_prompt,
              },
            ],
          },
        ],
        stream: false, // 设置为 false 以获取完整响应
      }),
    };

    const describeResponse = await fetch(
      "https://api.siliconflow.cn/v1/chat/completions",
      describeOptions
    );

    if (!describeResponse.ok) {
      const errorText = await describeResponse.text();
      throw new Error(
        `描述API请求失败: ${describeResponse.status} - ${errorText}`
      );
    }

    const describeData = await describeResponse.json();

    if (
      !describeData.choices ||
      describeData.choices.length === 0 ||
      !describeData.choices[0].message ||
      !describeData.choices[0].message.content
    ) {
      throw new Error("描述API返回的数据格式不正确");
    }

    const description = describeData.choices[0].message.content;
    console.log(description);

    // 第二步：生成头像生成提示
    const generatePromptOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V2.5",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Generate a prompt for image genetar: Based on the following species and description, create a **Mosaic avatar** that **cutely** resembles the real animal in the image. Ensure that the avatar accurately reflects the animal's species, color, physical traits, and any unique features visible in the image. It has to The avatar should maintain the same pose, expression, and overall appearance to create a faithful representation of the real animal. ${description}`,
              },
            ],
          },
        ],
        stream: false, // 设置为 false 以获取完整响应
      }),
    };

    const generatePromptResponse = await fetch(
      "https://api.siliconflow.cn/v1/chat/completions",
      generatePromptOptions
    );

    if (!generatePromptResponse.ok) {
      const errorText = await generatePromptResponse.text();
      throw new Error(
        `生成提示API请求失败: ${generatePromptResponse.status} - ${errorText}`
      );
    }

    const generatePromptData = await generatePromptResponse.json();

    if (
      !generatePromptData.choices ||
      generatePromptData.choices.length === 0 ||
      !generatePromptData.choices[0].message ||
      !generatePromptData.choices[0].message.content
    ) {
      throw new Error("生成提示API返回的数据格式不正确");
    }

    const avatar_generation_prompt =
      generatePromptData.choices[0].message.content;
    console.log(avatar_generation_prompt);

    return NextResponse.json({
      success: true,
      prompt: avatar_generation_prompt,
    });
  } catch (error: any) {
    console.error("分析失败:", error);
    return NextResponse.json(
      { error: error.message || "图片分析失败" },
      { status: 500 }
    );
  }
}
