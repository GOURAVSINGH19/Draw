"use client"

import type React from "react"

import { cn } from "@workspace/ui/lib/utils"
import "@workspace/ui/globals.css"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import { User } from "lucide-react"
import * as z from "zod"

const scheam = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string()
})

type schema = z.infer<typeof scheam>

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const route = useRouter();
    const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(scheam),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof scheam>) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("email", data.email)
            formData.append("password", data.password)
            const res = await axios.post(`${process.env.NEXT_PUBLIC_URL_HTTP_URL}/signup`, formData, {
                headers: {
                    "Content-Type":"application/json",
                },
            })
            console.log(res.data);
            route.push("/api/signin")
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleGitHubSignIn = async () => {
        try {
            await signIn("github", { callbackUrl: "/" })
        } catch (error) {
            console.error("GitHub sign-in error:", error)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await signIn("google", { callbackUrl: "/" })
        } catch (error) {
            console.error("Google sign-in error:", error)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6 ", className)} {...props}>
            <Card className="bg-[#222222] text-white border-zinc-600">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create Account</CardTitle>
                    <CardDescription className="text-gray-500">Sign up with your Github or Google account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-4">
                        <Button variant="outline" className="w-full bg-transparent" onClick={handleGitHubSignIn}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.867 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.135 20.175 22 16.427 22 12.012 22 6.484 17.523 2 12 2z" />
                            </svg>
                            Sign up with Github
                        </Button>
                        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full  bg-transparent">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                />
                            </svg>
                            Sign up with Google
                        </Button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-card text-black relative z-10 px-2 rounded-[4px]">Or continue with</span>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            required
                                            className="placeholder:text-grey-500 pl-10"
                                            {...register("name")}
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>

                                {/* Email Field */}
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        className="placeholder:text-grey-500"
                                        {...register("email")}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a password"
                                        required
                                        {...register("password")}
                                    />
                                    <p className="text-sm text-gray-400">
                                        Must be at least 8 characters with uppercase, lowercase, and number
                                    </p>
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                                </div>

                                <Button type="submit" disabled={isSubmitting}
                                    className="w-full bg-[#a3a85e]">
                                    {isSubmitting ? "Creating Account..." : "Create Account"}
                                </Button>
                            </div>
                            <div className="flex justify-between text-sm">
                                Already have an account?{" "}
                                <Link href="/api/signin" className="underline ml-5 underline-offset-4">
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
