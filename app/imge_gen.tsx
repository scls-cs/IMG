"use client";
import { send } from "process";
import { useState } from "react";

export default function () {
  const [img, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [img_prompt, setPrompt] = useState("");
  const sendMessage = async () => {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stabilityai/stable-diffusion-3-5-large",
        prompt: img_prompt,
        image_size: "768x512",
        batch_size: 1,
      }),
    };

    fetch("https://api.siliconflow.cn/v1/images/generations", options)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setImage(response.images[0].url); // Update image URL here
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };
  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <figure>
        <img
          src={
            img ||
            "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          }
          alt="Shoes"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">Shoes!</h2>
        <p>If a dog chews shoes whose shoes does he choose?</p>

        <div className="card-actions justify-end">
          <button
            className="mt-2 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={sendMessage}>
            Generate Image
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
        value={img_prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
    </div>
  );
}
