import { Instagram, Youtube, Twitter } from "lucide-react"

export default function PlatformIcon({ platform }) {
  if (platform === "instagram") return <Instagram size={18} />
  if (platform === "youtube") return <Youtube size={18} />
  if (platform === "x") return <Twitter size={18} />
  return null
}
