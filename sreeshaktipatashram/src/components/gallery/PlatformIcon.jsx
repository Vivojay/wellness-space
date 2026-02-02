import { FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa"

export default function PlatformIcon({ platform }) {
  if (platform === "instagram") return <FaInstagram size={18} />
  if (platform === "youtube") return <FaYoutube size={18} />
  if (platform === "x") return <FaTwitter size={18} />
  return null
}
