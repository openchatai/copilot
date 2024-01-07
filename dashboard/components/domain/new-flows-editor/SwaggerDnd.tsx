import { Button } from "@/components/ui/button";
import _ from "lodash";
import { FileJson, UploadCloud, X } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { ReactNode, useCallback, useMemo, useState } from "react";
import { getFileData, not, or } from "@/lib/misc";
import { useUpdateEffect } from 'react-use';
import { revalidateActions } from "./Controller";
import { useSwaggerAdd } from "@/hooks/useAddSwagger";

export function SwaggerDnd({ children, onChange, copilotId }: { children: ReactNode, copilotId: string, onChange?: (files: File[]) => void }) {
    const [state, addSwagger] = useSwaggerAdd({
        copilotId,
    });

    const [
        acceptedFiles,
        setAcceptedFiles,
    ] = useState<File[]>([]);
    const {
        getRootProps,
        getInputProps,
        isDragActive,
    } = useDropzone({
        multiple: false,
        noClick: true,
        validator(file) {
            if (file.type !== 'application/json') {
                return {
                    code: 'invalid-file-type',
                    message: 'Only JSON files are allowed',
                }
            }
            return null;
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            setAcceptedFiles(acceptedFiles);
        }
    });
    useUpdateEffect(() => {
        onChange?.(acceptedFiles);
    }, [acceptedFiles])
    const execCb = useCallback(
        // eslint-disable-next-line no-unused-vars
        <T extends (...args: any[]) => void>(cb: T) => cb,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [acceptedFiles]
    );
    const clearFiles = execCb(() => setAcceptedFiles([]))
    const active = or(isDragActive, not(_.isEmpty(acceptedFiles)));

    const fileData = useMemo(() => {
        const first = _.first(acceptedFiles)
        if (first) {
            return getFileData(first);
        }
        return null;
    }, [acceptedFiles]);


    const uploadSwagActions = execCb(async (file?: File) => {
        if (file && copilotId) {
            addSwagger({
                swagger: file,
                onSuccess: () => {
                    revalidateActions(copilotId);
                    _.delay(() => clearFiles(), 1000)
                },
            })
        }
    })

    // const uploadSwagActions = execCb(async (file?: File) => {
    //     if (file && copilotId) {
    //         const { data } = await $importActionsFromSwagger(copilotId, file);
    //         if (data.is_error === false) {
    //             revalidateActions(copilotId);
    //             toast({
    //                 variant: 'success',
    //                 title: 'Success',
    //                 description: 'Successfully imported actions from swagger file'
    //             })
    //             _.delay(() => clearFiles(), 1000)
    //         } else if (data.is_error === true) {
    //             toast({
    //                 variant: 'destructive',
    //                 title: 'Error',
    //                 description: data.message
    //             })
    //         }
    //     }
    // })

    return (
        <>
            <input className='hidden absolute' {...getInputProps()} />
            <div
                {...getRootProps({
                    className: cn('flex-1 relative', active ? 'overflow-hidden' : 'overflow-auto'),
                    'data-active': active,
                })}>
                {
                    active &&
                    <div
                        className='absolute z-20 inset-0 p-2 backdrop-blur-sm group-data-[active=false]:fade-out group-data-[active=false]:animate-out group-data-[active=true]:animate-in group-data-[active=true]:fade-in'>
                        <div className='w-full h-full flex-center bg-accent rounded-lg border-2 border-primary border-dashed relative'>
                            {
                                acceptedFiles.length > 0 && <div className='absolute top-2 right-2'>
                                    <Button size='fit' variant='destructive' onClick={clearFiles}>
                                        <X size={16} />
                                    </Button>
                                </div>
                            }
                            {
                                !_.isEmpty(acceptedFiles) ? <div className='flex items-start flex-col gap-2'>
                                    <FileJson size={40} className='self-center' />
                                    <table className='text-sm'>
                                        <tbody>
                                            <tr>
                                                <td>Name</td>
                                                <td>:</td>
                                                <td>{fileData?.name}</td>
                                            </tr>
                                            <tr>
                                                <td>Size</td>
                                                <td>:</td>
                                                <td>{fileData?.size}</td>
                                            </tr>
                                            <tr>
                                                <td>Type</td>
                                                <td>:</td>
                                                <td>{fileData?.type}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <Button loading={state.loading} size='fluid' variant='default' onClick={() => {
                                        uploadSwagActions(_.first(acceptedFiles))
                                    }}>
                                        Upload
                                    </Button>
                                </div> : <div className='flex flex-col items-center justify-center self-center'>
                                    <UploadCloud size={48} className='text-primary animate-bounce' />
                                    <p className='font-medium'>
                                        Drop the swagger file here ...
                                    </p>
                                </div>
                            }
                        </div>
                    </div>
                }
                <div style={{ display: active ? 'none' : 'contents' }}>
                    {children}
                </div>
            </div>
        </>
    )
}