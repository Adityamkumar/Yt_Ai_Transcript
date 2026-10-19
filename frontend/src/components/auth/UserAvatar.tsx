import { useState } from "react";
import { getApiBaseUrl } from "@/lib/axios";

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: number;
  className?: string;
}

function getAvatarGradient(name: string): string {
  const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 60) % 360}, 70%, 45%))`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({ name = "User", avatar, size = 36, className = "" }: UserAvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  const baseURL = getApiBaseUrl();

  const avatarUrl =
    avatar && avatar.includes("googleusercontent.com")
      ? `${baseURL}/api/v1/user/avatar-proxy?url=${encodeURIComponent(avatar)}`
      : avatar;

  if (avatar && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          background: gradient,
        }}
        aria-label={`${name}'s avatar`}
      >
        <span
          className="flex items-center justify-center font-semibold text-white select-none"
          style={{ fontSize: size * 0.38 }}
        >
          {initials}
        </span>
        <img
          src={avatarUrl}
          alt={`${name}'s avatar`}
          width={size}
          height={size}
          className="absolute inset-0 h-full w-full rounded-full object-cover"
          style={{
            display: imageLoaded ? "block" : "none",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full shrink-0 font-semibold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: gradient,
        fontSize: size * 0.38,
      }}
      aria-label={`${name}'s avatar`}
    >
      {initials}
    </span>
  );
}
