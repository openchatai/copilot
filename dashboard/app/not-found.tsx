'use client';
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

export const metadata = {
    title: "404",
    description: "Page not found",
    keywords: "404, page not found, not found",
    robots: "noindex, nofollow",
}

export default function NotFoundPage() {
    const router = useRouter()
    return (
        <div className="w-full h-full flex-center">
            <div className="flex flex-col items-center gap-2 justify-center">
                <div className="aspect-square relative w-56 mx-auto">
                    <Image
                        src='/404.gif'
                        alt="404"
                        fill
                    />
                </div>
                <h1 className="text-5xl font-bold">404</h1>
                <Button onClick={router.back}>
                    Go back
                </Button>
            </div>
        </div>
    )
}