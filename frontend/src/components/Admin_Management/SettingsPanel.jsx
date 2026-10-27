import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Tag, Layers, GitBranch, Calendar } from "lucide-react";

const fetchResource = async (type) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/resources/${type}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.data;
};

const createResource = async ({ type, payload }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/resources/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
};

const deleteResource = async ({ type, id }) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/resources/${type}/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
};

const ResourceTab = ({ type, title, icon: Icon, description }) => {
  const queryClient = useQueryClient();
  const [newValue, setNewValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["resources", type],
    queryFn: () => fetchResource(type),
  });

  const createMutation = useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries(["resources", type]);
      setNewValue("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => queryClient.invalidateQueries(["resources", type]),
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newValue.trim() || createMutation.isPending) return;
    createMutation.mutate({ type, payload: { name: newValue.trim() } });
  };

  return (
    <div className="bg-white border border-border/70 rounded-xl p-5 shadow-xs space-y-6">
      {/* Tab Header & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary shadow-2xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              {title} Configurations
            </h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 self-start sm:self-auto">
          {data?.length || 0} configured
        </span>
      </div>

      {/* Add Input Form */}
      <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <Input
          placeholder={`Enter new ${title.toLowerCase()}...`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="h-10 text-sm bg-muted/40 border-border/70 rounded-lg focus-visible:ring-1"
        />
        <Button
          type="submit"
          disabled={createMutation.isPending || !newValue.trim()}
          className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs sm:text-sm h-10 px-4 shrink-0 shadow-2xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </Button>
      </form>

      {/* Resources Table */}
      <div className="border border-border/70 rounded-xl overflow-hidden bg-white shadow-2xs">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-b border-border/70">
              <TableHead className="py-3 px-4 text-xs font-bold uppercase text-slate-600 tracking-wider">
                Name
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-bold uppercase text-slate-600 tracking-wider">
                Created
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-bold uppercase text-slate-600 tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-xs text-slate-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading resources...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-xs text-slate-400 italic"
                >
                  No {title.toLowerCase()} entries found. Add your first item above.
                </TableCell>
              </TableRow>
            ) : (
              data?.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-900 text-xs sm:text-sm py-3 px-4">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 py-3 px-4">
                    {item.createdAt ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete ${item.name}?`)) {
                          deleteMutation.mutate({ type, id: item.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const SettingsPanel = () => {
  return (
    <div className="mt-4">
      <Tabs defaultValue="lead-sources" className="w-full space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
          <TabsTrigger
            value="lead-sources"
            className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs transition-all"
          >
            Lead Sources
          </TabsTrigger>
          <TabsTrigger
            value="inventory-categories"
            className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs transition-all"
          >
            Inventory Categories
          </TabsTrigger>
          <TabsTrigger
            value="pipeline-stages"
            className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs transition-all"
          >
            Pipeline Stages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lead-sources">
          <ResourceTab
            type="lead-sources"
            title="Lead Source"
            icon={Tag}
            description="Manage marketing channels and acquisition sources for inbound customer leads."
          />
        </TabsContent>

        <TabsContent value="inventory-categories">
          <ResourceTab
            type="inventory-categories"
            title="Category"
            icon={Layers}
            description="Define property categories for residential and commercial real estate inventory."
          />
        </TabsContent>

        <TabsContent value="pipeline-stages">
          <ResourceTab
            type="pipeline-stages"
            title="Stage"
            icon={GitBranch}
            description="Configure sales progression stages from new inquiry to deal closing."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
