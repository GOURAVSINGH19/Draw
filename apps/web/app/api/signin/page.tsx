import { LoginForm } from "../../../components/Loginpage"

export default function LoginPage() {
  return (
    <div className="bg-[#121212] flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  )
}
