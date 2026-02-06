interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps) {
  return (
    <a
      href="/auth/login"
      className={`inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 ${className ?? ''}`}
    >
      Sign in
    </a>
  );
}
