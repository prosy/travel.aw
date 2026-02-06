export function LogoutButton() {
  return (
    <a
      href="/auth/logout"
      className="text-sm text-zinc-400 transition-colors hover:text-white"
    >
      Log out
    </a>
  );
}
