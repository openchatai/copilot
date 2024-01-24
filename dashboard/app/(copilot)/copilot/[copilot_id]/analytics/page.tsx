import { HeaderShell } from '@/components/domain/HeaderShell'
import { SimpleCard } from '@/components/domain/simple-card'
import { Stack } from '@/components/ui/Stack'
import React from 'react'
import { EChart } from '@kbox-labs/react-echarts'
import { getAnalyticsData } from '@/data/copilot'

type Props = {
    params: {
        copilot_id: string
    }
}
export default async function AnalyticsPage(props: Props) {
    const data = await getAnalyticsData(props.params.copilot_id);
    console.log(data);
    return (
        <Stack direction='column' fluid className='h-full'>
            <HeaderShell>
                <h1 className="text-lg font-bold text-secondary-foreground">
                    Analytics
                </h1>
            </HeaderShell>
            <main className='flex-1 overflow-auto p-4 w-full flex flex-col gap-4'>
                <div className='grid grid-cols-3 gap-4'>
                    <SimpleCard title="Knowledgebase Calls" description="number of knowledgebase calls">
                        20
                    </SimpleCard>
                    <SimpleCard title="Api Calls" description="number of api calls">
                        20
                    </SimpleCard>
                </div>
                <div className='flex-1 w-full rounded-md grid grid-cols-2 overflow-hidden gap-5'>
                    <SimpleCard title="Messages Per session">
                        <EChart
                            renderer='svg'
                            className='size-full'
                            xAxis={{
                                type: "value",
                            }}
                            yAxis={{
                                type: "value",
                            }}
                            series={[{
                                type: "scatter",
                                symbolSize: 20,
                                data: [
                                    [10.0, 8.04],
                                    [8.0, 6.95],
                                    [13.0, 7.58],
                                    [9.0, 8.81],
                                    [11.0, 8.33],
                                    [14.0, 9.96],
                                    [6.0, 7.24],
                                    [4.0, 4.26],
                                    [12.0, 10.84],
                                    [7.0, 4.82],
                                    [5.0, 5.68],
                                ],
                            }]}
                        />
                    </SimpleCard>
                    <SimpleCard title="Action Calls">
                        <EChart
                            renderer='svg'
                            className='size-full'
                            xAxis={{
                                type: 'category'
                            }}
                            yAxis={{
                                type: 'value',
                                boundaryGap: [0, '30%']
                            }}
                            series={[
                                {
                                    type: "line",
                                    data: [120, 200, 150, 80, 70, 110, 130],
                                }
                            ]}
                        />
                    </SimpleCard>
                </div>
            </main>
        </Stack>
    )
}
