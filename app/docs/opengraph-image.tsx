import { ogImage, ogSize } from "@/lib/og";

export const alt = "LuniBot docs: guides for every bot";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "LuniBot docs", line: "Install, configure, host and fix every bot." });
}
