import Carousel from "./components/Carousel";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 bg-zinc-50">
      <Carousel />
      <LoginForm />
    </main>
  );
}
