import React from "react"

export interface AppBotInfo {
  id: string
  uid: string
  display_name: string
  description: string
  avatar: string
  scope: "platform" | "space"
}

interface BotCardProps {
  bot: AppBotInfo
  onOpen: (bot: AppBotInfo) => void
}

function isSafeImageUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
  "linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)",
]

function pickGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

/** Default Bot icon SVG for when no avatar is provided */
function BotAvatarFallback() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="16" height="12" rx="3" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="9" cy="14" r="1.5" fill="white" />
      <circle cx="15" cy="14" r="1.5" fill="white" />
      <path d="M9.5 17.5C10 18.5 11 19 12 19C13 19 14 18.5 14.5 17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="3.5" r="1.5" fill="white" />
      <line x1="2" y1="12" x2="4" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function BotCard({ bot, onOpen }: BotCardProps) {
  const showImage = isSafeImageUrl(bot.avatar)
  const gradient = pickGradient(bot.uid || bot.id)

  const handleClick = () => onOpen(bot)
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onOpen(bot)
    }
  }

  return (
    <div
      className="appbot-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      <div className="appbot-card-head">
        <div
          className="appbot-card-avatar"
          style={!showImage ? { background: gradient } : undefined}
        >
          {showImage
            ? <img src={bot.avatar} alt={bot.display_name} />
            : <BotAvatarFallback />
          }
        </div>
        <div className="appbot-card-title">
          <div className="appbot-card-name" title={bot.display_name}>{bot.display_name}</div>
        </div>
      </div>
      <div className="appbot-card-desc">
        {bot.description || "暂无描述"}
      </div>
      <div className="appbot-card-footer">
        <span className="appbot-card-cta">发起对话 &gt;</span>
      </div>
    </div>
  )
}
