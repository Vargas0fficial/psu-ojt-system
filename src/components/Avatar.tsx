/** Shows a user's uploaded photo if present, otherwise a colored circle with their initial. */
export function Avatar({
  name,
  avatar,
  size = 40,
  className = "",
}: {
  name: string;
  avatar?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };

  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL, not a static/optimizable asset
      <img
        src={avatar}
        alt={name}
        style={style}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full bg-navy-900 text-white flex items-center justify-center font-semibold shrink-0 ${className}`}
    >
      {name?.charAt(0) ?? "?"}
    </div>
  );
}