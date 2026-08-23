// ==============================================================================
// TheVrindaGroup - Agent CRM & Leads Workspace API Service
// Wraps all /api/agent/* endpoints with full TypeScript type safety.
// ==============================================================================

import { apiClient } from "../api-client";
import {
  AgentSafeLead,
  PaginatedAgentLeads,
  AgentDashboardMetrics,
  AgentLeadQueryDto,
} from "@/types/agent";
import { EnquiryStatus } from "@/types/admin";

export class AgentApiService {
  static async getLeads(params?: AgentLeadQueryDto): Promise<PaginatedAgentLeads> {
    const res = await apiClient.get<PaginatedAgentLeads>("/agent/leads", params as Record<string, unknown>);
    return res.data;
  }

  static async getLeadById(id: string): Promise<AgentSafeLead> {
    const res = await apiClient.get<{ lead: AgentSafeLead }>(`/agent/leads/${id}`);
    return res.data.lead;
  }

  static async updateLeadStatus(id: string, status: EnquiryStatus): Promise<AgentSafeLead> {
    const res = await apiClient.patch<{ lead: AgentSafeLead }>(`/agent/leads/${id}/status`, { status });
    return res.data.lead;
  }

  static async getDashboard(): Promise<AgentDashboardMetrics> {
    const res = await apiClient.get<AgentDashboardMetrics>("/agent/dashboard");
    return res.data;
  }
}
