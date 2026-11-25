'use client';

export default function LogoutButton() {
  return (
    <button
      className="btn ghost"
      onClick={async () => {
        await fetch('/bff/auth/logout', { method: 'POST' });
        window.location.href = '/login';
      }}
    >
      Sign out
    </button>
  );
}
