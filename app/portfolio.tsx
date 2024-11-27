import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { saveAs } from "file-saver";

export default function Portfolio() {
  const [img1, setImage1] = useState("");
  const [img2, setImage2] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [img_prompt, setPrompt] = useState("");
  const placeholderImage = [
    "https://i.redd.it/jtmst3lgzr1e1.jpeg",
    "https://i.redd.it/6andcl69p60e1.jpeg",
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setAnalyzing(true);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (uploadResult.success) {
        const analyzeResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: uploadResult.url }),
        });

        const analyzeResult = await analyzeResponse.json();
        console.log(analyzeResult);
        if (analyzeResult.success) {
          setPrompt(analyzeResult.prompt);
        } else {
          console.error("Error analyzing image:", analyzeResult.error);
        }
      } else {
        console.error("Error uploading file:", uploadResult.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    try {
      setLoading(true);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: img_prompt,
        }),
      };
      const response = await fetch("/api/getImage", options);
      const images = await response.json();
      console.log(images);
      if (images && images.length >= 2) {
        setImage1(images[0].url);
        setImage2(images[1].url);
      }
    } catch (error) {
      console.error("Error generating images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
          {/* 标题区域 */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              AI Image Generator
            </h2>
            <p className="text-lg text-gray-600">
              Make your prompt as specific as possible for better results
            </p>
          </div>

          {/* 输入区域 */}
          <div className="mx-auto max-w-2xl mb-12">
            <div className="flex gap-4">
              <Input
                className="flex-1 text-lg p-4"
                placeholder="Enter your prompt here..."
                value={img_prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button
                className={`px-8 py-4 text-lg ${loading ? "opacity-70" : ""}`}
                onClick={sendMessage}
                disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {analyzing ? "Analyzing..." : "Generating..."}
                  </div>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </div>

          {/* 上传图片区域 */}
          <div className="mx-auto max-w-2xl mb-12">
            <input type="file" onChange={handleFileUpload} />
          </div>

          {/* 图片展示区域 */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {[img1, img2].map((img, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl">
                <div className="aspect-w-16 aspect-h-9 relative">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-pulse rounded-lg bg-gray-200 h-full w-full"></div>
                    </div>
                  ) : (
                    <img
                      src={img || placeholderImage[index]}
                      alt={img_prompt}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-900">
                    {img ? img_prompt : "Enter a prompt to generate images"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Version {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
