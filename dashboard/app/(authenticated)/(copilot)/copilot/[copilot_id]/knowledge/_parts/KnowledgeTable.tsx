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
import { Minus, Trash2, ChevronsUpDown, CheckCircle, XCircle, RotateCw } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { searchQueryAtom } from "./searchAtom";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import useSWR from "swr";
import { DataSources, getDataSourcesByBotId } from "@/data/knowledge";
import { useCopilot } from "../../../CopilotProvider";
import { Link } from "@/lib/router-events";
import { format } from 'timeago.js'
import { DataTablePagination } from "@/components/ui/TablePagination";

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
      row.getValue("name")
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status").toUpperCase() as DataSources['status'];
      switch (status) {
        case "PENDING":
          return <RotateCw className="h-5 w-5 text-accent-foreground animate-spin" />
        case "SUCCESS":
        case "COMPLETED":
          return <CheckCircle className="h-5 w-5 text-primary" />
        case "FAILED":
          return <XCircle className="h-5 w-5 text-destructive" />
        default:
          return status;
      }
    }
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => row.getValue("type"),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span>{format(row.getValue("date"), 'en-us')}</span>,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => <Link href={row.getValue("source")} target="_blank" className="text-primary">
      visit
    </Link>,
  }
];
export function KnowledgeTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const {
    id: copilotId,
  } = useCopilot();
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const {
    data: dataSources,
  } = useSWR<DataSources[]>(copilotId + '/data_sources', async () => getDataSourcesByBotId(copilotId), {
    refreshInterval: 1000 * 10,
  })
  const table = useReactTable({
    data: dataSources || [],
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
  const query = useAtomValue(searchQueryAtom);
  // :spagetti:
  // @TODO: refactor this
  useEffect(() => {
    const name = query.text;
    const type = query.filters.filter((item) => item.key === "type")
    if (name) {
      table.getColumn("name")?.setFilterValue(name);
    } else {
      table.getColumn("name")?.setFilterValue('');
    }
    if (type.length) {
      table.getColumn("type")?.setFilterValue(type?.[0]?.v || '');
    } else {
      table.getColumn("type")?.setFilterValue('');
    }

  }, [query]);
  const selection = table?.getSelectedRowModel();
  return (
    <HoverCard open={!_.isEmpty(selection.rows)}>
      <Table wrapperClassName="rounded-none border-b-0">
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
                      data-name={cell.column.id}
                      data-role={cell.column.id === "select" ? "checkbox" : "cell"}
                      className={"px-8 data-[role=checkbox]:w-2 data-[role=checkbox]:pl-8 data-[name=name]:max-w-xs data-[name=name]:line-clamp-1"}
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
      <div className="sticky bottom-0 w-full inset-x-0 container flex items-center justify-between bg-white/80 border-t backdrop-blur-sm h-header">
        <DataTablePagination table={table} />
      </div>
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
