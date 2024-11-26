import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="text" placeholder="A beautiful bird in Amazon Forest" />
      <Button type="submit">Generate Image</Button>
      <div></div>
    </div>
  );
}
