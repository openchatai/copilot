'use client';
import React from 'react'
import { Dialog, DialogCancel, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GetActionsFromSwagger } from '@/components/domain/SwaggerUpload';
import { Upload, ZapIcon } from 'lucide-react';
export function SwaggerUpload() {
    return (
        <Dialog>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <ZapIcon className='size-6 text-primary me-2 inline' />
                        Get actions from a swagger file
                    </DialogTitle>
                </DialogHeader>
                <GetActionsFromSwagger />
                <DialogFooter>
                    <Button>
                        Upload
                        <Upload className='size-4 ms-2' />
                    </Button>
                    <DialogCancel asChild>
                        <Button variant='outline'>
                            Cancel
                        </Button>
                    </DialogCancel>
                </DialogFooter>
            </DialogContent>
            <DialogTrigger asChild>
                <Button variant='outline'>
                    <Upload className='size-4 me-1' />
                    Upload
                </Button>
            </DialogTrigger>
        </Dialog>
    )
}
