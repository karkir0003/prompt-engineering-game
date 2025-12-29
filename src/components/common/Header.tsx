import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
}

export function Header({ title = "Daily Challenge", showLogout = true }: HeaderProps = {}) {
  return (
    <header className="border-b border-zinc-200 bg-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      {showLogout && <LogoutButton variant="outline" size="default" />}
    </header>
  );
}
