"use client";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import Imge_gen from "./imge_gen";
import Portfolio from "./portfolio";
import Upload from "./upload";

export default function Home() {
  const [number, setNumber] = useState(0);
  const [color, setColor] = useState("red");

  const colorlist = ["text-gray-50", "text-orange-900"];

  useEffect(() => {
    setColor(colorlist[number % 2]);
  }, [number]);

  return (
    <div>
      <Portfolio />
    </div>
  );
}
