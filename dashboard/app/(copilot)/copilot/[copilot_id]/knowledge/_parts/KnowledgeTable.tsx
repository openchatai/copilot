"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Trash2, ChevronsUpDown } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import _ from "lodash";
import { timeSince } from "@/lib/timesince";
import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { searchQueryAtom } from "./searchAtom";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
export type DataSources = {
  id: string;
  name: string;
  type: string;
  status: "pending" | "error" | "success";
  date: Date | number | string;
};
const columns: ColumnDef<DataSources>[] = [
  {
    id: "select",
    header({ table }) {
      return (
        <Checkbox
          CheckedIcon={Minus}
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      );
    },
    cell({ row }) {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    accessorKey: "id",
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <span>Name</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <span className="line-clamp-1 w-full whitespace-nowrap text-accent-foreground">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => row.getValue("type"),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span>{timeSince(row.getValue("date"))} ago</span>,
  },
];
const data: DataSources[] = [
  {
    id: "1",
    date: "2021-10-01T00:00:00.000Z",
    name: "Your Website title",
    status: "pending",
    type: "URL",
  },
  {
    id: "2",
    date: "2021-10-01T00:00:00.000Z",
    name: "Your Website url",
    status: "error",
    type: "URL",
  },
];
export function KnowledgeTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableFilters: true,
    enableColumnFilters: true,
    enableSorting: true,
  });
  const searchName = useAtomValue(searchQueryAtom);
  useEffect(() => {
    table.getColumn("name")?.setFilterValue(searchName.toLowerCase());
  }, [searchName, table]);
  const selection = table.getSelectedRowModel();
  return (
    <HoverCard open={!_.isEmpty(selection.rows)}>
      <Table wrapperClassName="rounded-none">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="px-8">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <HoverCardTrigger asChild>
          <TableBody className="odd:bg-white">
            {!_.isEmpty(table.getRowModel().rows) ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className="bg-white animate-in fade-in-50 transition-all"
                  style={{
                    animationDelay: `max(${i * 50}ms, 100ms)`,
                  }}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-8 data-[role=checkbox]:w-2 data-[role=checkbox]:pl-8"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-5 text-center">
                  <EmptyBlock>No results.</EmptyBlock>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </HoverCardTrigger>
      </Table>
      <HoverCardContent
        side="bottom"
        className="h-14 w-[400px] rounded-xl border-none bg-[#33373A] p-2 text-white"
      >
        <div className="ml-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="flex-center h-4 w-4 rounded bg-[#5D6264] text-white"
              onClick={() => {
                table.setRowSelection({});
              }}
            >
              <Minus className="h-3 w-3" />
            </button>
            <div className="text-sm text-muted-foreground">
              <span>
                <span className="text-white">{selection.rows.length}</span>{" "}
                documents selected
              </span>
            </div>
          </div>
          <button className="flex-center rounded-lg bg-[#5D6264] p-3 text-white">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
