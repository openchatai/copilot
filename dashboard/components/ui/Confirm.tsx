// Confirm component
import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from './alert-dialog'
import { Button } from './button';

type DispatchBool = React.Dispatch<React.SetStateAction<boolean>>

type Props = {
    title: string
    description: string
    onConfirm?: (setOpen: DispatchBool) => void
    variant?: 'default' | 'destructive';
    actionTrigger?: (setOpen: DispatchBool) => React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export function Confirm({ title, description, icon, onConfirm, actionTrigger, children, variant = 'default' }: Props) {
    const [
        open,
        setOpen
    ] = React.useState(false);

    return (
        <AlertDialog
            open={open}
            onOpenChange={setOpen}
        >
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {icon && <span className='me-2 inline-block'>{icon}</span>}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant='secondary' size='sm'>
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        {
                            actionTrigger ? actionTrigger(setOpen) : <Button size='sm' variant={variant} onClick={() => onConfirm?.(setOpen)}>
                                Confirm
                            </Button>
                        }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}