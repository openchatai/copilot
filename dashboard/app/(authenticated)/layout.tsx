import React from 'react'
import { SearchModal } from './(main)/_parts/SearchModal'

type Props = {
    children: React.ReactNode
}

export default async function AuthenticatedLayout({ children }: Props) {
    return (
        <>
            {children}
            <SearchModal />
        </>
    )
}