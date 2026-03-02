"use client";

import { updateLeadStatus } from "@/lib/actions";
import { Select } from "@/components/ui/select";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export function LeadActions({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateLeadStatus(leadId, e.target.value);
  };

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none"
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
