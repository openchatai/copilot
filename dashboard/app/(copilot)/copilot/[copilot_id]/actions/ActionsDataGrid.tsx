'use client';
import { Input } from "@/components/ui/input";
import { useListActions } from "@/hooks/useActions";
import { ColumnDef, ColumnFiltersState, RowSelectionState, SortingState, getCoreRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { Stack } from "@/components/ui/Stack";
import { format } from "timeago.js";
import _ from "lodash";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { DataTablePagination } from "@/components/ui/TablePagination";
import { Action } from "./Action";
import { ActionWithModifiedParametersResponse } from "@/data/actions";

const columns: ColumnDef<ActionWithModifiedParametersResponse>[] = [
    {
        accessorKey: "id",
        id: "id"
    },
    {
        accessorKey: "name",
        id: "name"
    }, {
        accessorKey: "description",
        id: "description"
    }, {
        accessorKey: "request_type",
        id: "request_type"
    },
    {
        id: "created_at",
        accessorFn: (value) => format(value.created_at)
    },
    {
        id: "updated_at",
        accessorFn: (value) => format(value.updated_at)
    }
];

export function ActionsDataGrid({ copilot_id }: { copilot_id: string }) {
    const { data: actions } = useListActions(copilot_id);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const grid = useReactTable({
        data: actions || [],
        columns,
        pageCount: 1,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableFilters: true,
        enableColumnFilters: true,
        enableSorting: true,
        enableMultiRowSelection: false,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        }
    })

    const filterByName = useCallback((name: string) => {
        grid.getColumn("name")?.setFilterValue(name)
    }, [
        grid
    ])
    console.log(
        grid.getSelectedRowModel().rows
    )
    return (
        <div className="container">
            <Stack fluid direction="row" js="between" className="!gap-5">
                <Input placeholder="Search"
                    className="flex-1"
                    onChange={(e) => filterByName(e.target.value)}
                />
            </Stack>
            <div className="grid gap-4 grid-cols-12 mt-5">
                {_.isEmpty(grid.getRowModel().rows) ?
                    <EmptyBlock className="col-span-full">
                        <h1 className="text-lg font-semibold">No actions found</h1>
                        <p className="text-sm text-gray-500">Create a new action to get started</p>
                    </EmptyBlock>
                    : grid.getRowModel().rows.map((item, index) => (
                        <Action key={index} {...item} />
                    ))}
            </div>
            <div hidden={grid.getPageCount() === 1} className="mt-4">
                <DataTablePagination table={grid} />
            </div>
        </div>
    )
}