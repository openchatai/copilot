"use client";
import { SimpleCard } from "@/components/domain/simple-card";
import useSWR from "swr";
import { getAnalyticsData } from "@/data/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Counter } from "@/components/ui/Counter";

export function SimpleAnalyticsCards({ copilot_id }: {
  copilot_id: string
}) {
  const {
    data: analyticsData,
    isLoading
  } = useSWR([copilot_id, 'copilot-analytics'], () => getAnalyticsData(copilot_id))
  return (
    <div className="grid grid-cols-3 gap-4">
      <SimpleCard title="Number of api calls">
        <Skeleton isLoading={isLoading}>
          <h2 className="text-lg font-bold">
            <Counter value={analyticsData?.api_called_count} />
          </h2>
        </Skeleton>
      </SimpleCard>

      <SimpleCard title="Knowledge Base Queries">
        <Skeleton isLoading={isLoading}>
          <h2 className="text-lg font-bold">
            <Counter value={analyticsData?.knowledgebase_called_count} />
          </h2>
        </Skeleton>
      </SimpleCard>

      <SimpleCard title="Misc Queries">
        <Skeleton isLoading={isLoading}>
          <h2 className="text-lg font-bold">
            <Counter value={analyticsData?.other_count} />
          </h2>
        </Skeleton>
      </SimpleCard>

    </div>
  );
}
