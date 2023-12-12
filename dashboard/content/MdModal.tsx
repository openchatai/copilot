'use client';
import { Button } from "@/components/ui/button";
import { MdContentType } from "./getContent";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { Wizard, useWizard } from "react-use-wizard";

function Footer() {
    const { activeStep, isFirstStep, isLastStep, nextStep, previousStep } = useWizard();
    function handleCloseDialog() { }

    return <DialogFooter className="p-4 space-x-4">
        {
            !isFirstStep && <Button onClick={previousStep} variant='outline'>Back</Button>
        }
        {
            !isLastStep && <Button onClick={nextStep}>Next</Button>
        }
        {
            isLastStep && <Button onClick={handleCloseDialog} className='max-w-[50%] w-full mx-auto'>Finish</Button>
        }
    </DialogFooter>
}

export default function MdModal({ content }: { content: MdContentType[] }) {
    const pages = content.reverse()
    if (!pages) return null

    return <Dialog defaultOpen>
        <DialogContent className="outline-none p-0 bg-accent overflow-hidden">
            <Wizard footer={<Footer />}>
                {
                    pages.map((page, i) => {
                        return <div key={i} className="animate-in fade-in slide-in-from-right-5">
                            <DialogHeader className="p-6 border-b">
                                <DialogTitle className="text-center">{page.attributes.title}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-grow overflow-auto p-4">
                                <ReactMarkdown className='prose prose-sm prose-slate text-accent-foreground'>{page.body}</ReactMarkdown>
                            </div>
                        </div>
                    })
                }
            </Wizard>
        </DialogContent>
    </Dialog>
}