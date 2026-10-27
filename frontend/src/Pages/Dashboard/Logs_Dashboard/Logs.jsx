import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "@/api/logs";
import LogsHeader from "@/components/Logs_Management/LogsHeader";
import LeadsLogsCard from "@/components/Logs_Management/LeadsLogsCard";
import PropertyLogsCard from "@/components/Logs_Management/PropertyLogsCard";
import LogDiffDialog from "@/components/Logs_Management/LogDiffDialog";

const Logs = () => {
  // Selected Log for Diff Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch recent logs for preview
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit-logs-preview"],
    queryFn: () => fetchLogs({ page: 1, limit: 5 }),
    staleTime: 30 * 1000,
  });

  const logs = data?.logs || [];
  const totalCount = data?.pagination?.total || 0;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-16 overflow-x-hidden">
      {/* Page Header */}
      <LogsHeader
        totalCount={totalCount}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      {/* 2-Column Overview Layout: Left (Leads) & Right (Properties) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full min-w-0">
        {/* Left Column: Leads Audit Trail */}
        <div className="min-w-0 w-full flex flex-col">
          <LeadsLogsCard />
        </div>

        {/* Right Column: Property Audit Logs Preview */}
        <div className="min-w-0 w-full flex flex-col">
          <PropertyLogsCard
            logs={logs}
            totalCount={totalCount}
            isLoading={isLoading}
            onSelectLog={setSelectedLog}
          />
        </div>
      </div>

      {/* Inspect Diff Modal */}
      <LogDiffDialog
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default Logs;
