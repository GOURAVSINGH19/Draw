import { SignupForm } from "../../../components/Signupform"

export default function LoginPage() {
    return (
        <div className="bg-[#121212] flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <SignupForm />
            </div>
        </div>
    )
}
