'use client';

import { SimpleCard } from "@/components/domain/simple-card";
import { getMostCalledActions } from "@/data/analytics";
import { EChart } from "@kbox-labs/react-echarts";
import useSWR from "swr";

type Props = {
    copilot_id: string
}

export function AnalyticsActions({ copilot_id }: Props) {
    const {
        data: mostCalledActions,
    } = useSWR([copilot_id, 'copilot-mostCalledActions'], () => getMostCalledActions(copilot_id));
    const noMostCalledActions = mostCalledActions?.length === 0 || !mostCalledActions;
    return (
        <SimpleCard title="Most Called Actions" className="relative overflow-hidden">
            {noMostCalledActions ? <div className="h-full flex-center">
                <p className="text-center text-xl">No actions called yet</p>
            </div> : <EChart
                renderer='svg'
                className='size-full'
                xAxis={{
                    type: 'category',
                    data: mostCalledActions?.map((action) => action.operation_id) ?? [],
                }}
                yAxis={{
                    type: 'value',
                }}
                series={{
                    data: mostCalledActions?.map((action) => (action.count)) ?? [],
                    type: 'bar',
                }}
            />}
        </SimpleCard>
    )
}
