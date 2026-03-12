import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Login | Vitals AI",
  description: "Access your digital wellbeing dashboard.",
};

export default function LoginPage() {
  return <AuthForm type="login" />;
}
