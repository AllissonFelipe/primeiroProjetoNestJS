import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Meu App</h1>
        <nav>
          <Link href="/" className="mr-4">
            Home
          </Link>
          <Link href="/register" className="mr-4">
            Cadastro
          </Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
