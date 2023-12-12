'use client';
import { MdContentType } from "./getContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { usePathname } from "next/navigation";

export default function MdModal({ content }: { content: MdContentType[] }) {
    const pathname = usePathname();
    const page = content.find((page) => page.attributes.pathname === pathname);
    if (!page) return null;

    return <Dialog defaultOpen>
        <DialogContent className="outline-none">
            <DialogHeader>
                <DialogTitle className="text-center text-xl">{page.attributes.name}</DialogTitle>
            </DialogHeader>
            <ReactMarkdown className="prose prose-base">{page.body}</ReactMarkdown>
        </DialogContent>
    </Dialog>
}