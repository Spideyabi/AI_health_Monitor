import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Sign Up | Vitals AI",
  description: "Create your Vitals AI account.",
};

export default function SignUpPage() {
  return <AuthForm type="signup" />;
}
