'use client';
import React, { useState } from 'react'
import { Dialog, DialogCancel, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GetActionsFromSwagger } from '@/components/domain/SwaggerUpload';
import { Upload, ZapIcon } from 'lucide-react';
import { useSwaggerAdd } from '@/hooks/useAddSwagger';
import _ from 'lodash';
import { Tooltip } from '@/components/domain/Tooltip';

export function SwaggerUpload({ copilotId }: { copilotId: string }) {
    const [state, addSwagger] = useSwaggerAdd({ copilotId })
    const [swaggerFiles, setSwaggerFiles] = useState<File[]>([]);
    const isEmpty = _.isEmpty(swaggerFiles)
    return (
        <Dialog>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <ZapIcon className='size-6 text-primary me-2 inline' />
                        Get actions from a swagger file
                    </DialogTitle>
                </DialogHeader>
                <GetActionsFromSwagger swaggerFiles={swaggerFiles} onChange={setSwaggerFiles} />
                <DialogFooter>
                    <Button disabled={isEmpty} loading={state.loading} onClick={async () => {
                        const swag = swaggerFiles.at(0);
                        if (swag) {
                            addSwagger({
                                swagger: swag,
                                onSuccess(data) {
                                    setSwaggerFiles([])
                                },
                            })
                        }
                    }}>
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
            <Tooltip content="Upload swagger file and extract the actions out from it ">
                <DialogTrigger asChild>
                    <Button variant='outline'>
                        <Upload className='size-4 me-1' />
                        Upload
                    </Button>
                </DialogTrigger>
            </Tooltip>
        </Dialog>
    )
}
