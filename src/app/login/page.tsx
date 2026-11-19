import LoginPage from "./LoginPage";

export default async function Login({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const params = await searchParams;
  return <LoginPage initialRole={params.role || "customer"} />;
}
