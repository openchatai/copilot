'use client';
import { Input } from "@/components/ui/input";
import { ActionResponseType } from "@/data/actions";
import { useListActions } from "@/hooks/useActions";
import { cn } from "@/lib/utils";
import { ColumnDef, ColumnFiltersState, GroupingState, Row, RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useCallback, useRef, useState } from "react";
import { methodVariants } from "@/components/domain/MethodRenderer";
import { Stack } from "@/components/ui/Stack";
import { format } from "timeago.js";
import { Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Action({ getValue, getIsSelected, toggleSelected, order }: Row<ActionResponseType> & { order: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isSelected = getIsSelected();
    return <Stack
        ref={containerRef}
        ic="start"
        gap={5}
        direction="column"
        className={cn('bg-secondary p-3.5 rounded-lg col-span-full lg:col-span-6 xl:col-span-4 border-2', isSelected ? 'border-primary/50 bg-secondary shadow-sm' : 'border-transparent')}>
        <Stack ic="start" gap={10} id="some" direction="row">
            <div className='text-sm font-semibold flex-1'>{getValue("name")}</div>
            {/* @ts-ignore */}
            <div className={methodVariants({ size: "tiny", method: String(getValue("request_type")).toUpperCase() })}>{getValue("request_type")}</div>
        </Stack>
        <div className='text-xs text-gray-500'>{getValue("description")}</div>
        <Stack className="mt-auto gap-1" js="end">
            <Button variant='outline' size='fit' onClick={() => toggleSelected()}>
                <Settings2 size={15} />
            </Button>
            <Button variant='destructiveOutline' size='fit'>
                <Trash2 size={15} />
            </Button>
        </Stack>
    </Stack>
}

const columns: ColumnDef<ActionResponseType>[] = [
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
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [grouping, setGrouping] = useState<GroupingState>([]);
    const grid = useReactTable({
        data: actions || [],
        columns,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGroupingChange: setGrouping,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        enableFilters: true,
        enableColumnFilters: true,
        enableSorting: true,
        enableMultiRowSelection: false,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            grouping
        }
    })
    const filterByName = useCallback((name: string) => {
        grid.getColumn("name")?.setFilterValue(name)
    }, [
        grid
    ])
    const groupBy = useCallback((method: "request_type" | "none") => {
        grid.setGrouping(prev => [...prev, method])
    }, [grid])
    console.log(grid.getGroupedRowModel())
    return (
        <div>
            <Stack fluid direction="row" js="between" className="!gap-5">
                <Input placeholder="Search"
                    className="flex-1"
                    onChange={(e) => filterByName(e.target.value)}
                />
                <Select name="group_by" defaultValue="none" onValueChange={(v) => groupBy(v as any)}>
                    <SelectTrigger className="shrink min-w-fit w-20">
                        <SelectValue placeholder="Group By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="request_type">Method</SelectItem>
                    </SelectContent>
                </Select>
            </Stack>
            <div className="grid gap-4 grid-cols-12 mt-5">
                {grid.getGroupedRowModel().rows.map((item, index) => {
                    return (
                        <Action key={index} {...item} order={index} />
                    )
                })}
            </div>
        </div>
    )

}