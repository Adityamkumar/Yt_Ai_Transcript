/**
 * UserAvatar — displays a user's Google profile picture or a gradient
 * initials fallback consistent with the app's dark glassmorphism aesthetic.
 */

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: number;       // pixel size (width + height)
  className?: string;
}

// Derive a consistent gradient from the user's name
function getAvatarGradient(name: string): string {
  const hue = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 60) % 360}, 70%, 45%))`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserAvatar({ name = 'User', avatar, size = 36, className = '' }: UserAvatarProps) {
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.style.background = gradient;
          }
        }}
      />
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full flex-shrink-0 font-semibold text-white select-none ${className}`}
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
