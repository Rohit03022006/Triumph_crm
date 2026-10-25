import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const fetchResource = async (type) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/resources/${type}`, { credentials: 'include' });
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.data;
};

const createResource = async ({ type, payload }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/resources/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
};

const deleteResource = async ({ type, id }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/resources/${type}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
};

const ResourceTab = ({ type, title }) => {
  const queryClient = useQueryClient();
  const [newValue, setNewValue] = useState('');

  const { data, isLoading } = useQuery({ 
    queryKey: ['resources', type], 
    queryFn: () => fetchResource(type) 
  });

  const createMutation = useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries(['resources', type]);
      setNewValue('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => queryClient.invalidateQueries(['resources', type])
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 max-w-sm">
        <Input 
          placeholder={`New ${title}...`} 
          value={newValue} 
          onChange={(e) => setNewValue(e.target.value)} 
        />
        <Button 
          onClick={() => newValue.trim() && createMutation.mutate({ type, payload: { name: newValue } })}
          disabled={createMutation.isPending || !newValue.trim()}
        >
          Add
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-4">No data found.</TableCell></TableRow>
            ) : (
              data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure?")) {
                          deleteMutation.mutate({ type, id: item.id });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
};

const SettingsPanel = () => {
  return (
    <div className="mt-6">
      <Tabs defaultValue="lead-sources" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="lead-sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="inventory-categories">Inventory Categories</TabsTrigger>
          <TabsTrigger value="pipeline-stages">Pipeline Stages</TabsTrigger>
        </TabsList>
        <TabsContent value="lead-sources">
          <ResourceTab type="lead-sources" title="Lead Source" />
        </TabsContent>
        <TabsContent value="inventory-categories">
          <ResourceTab type="inventory-categories" title="Category" />
        </TabsContent>
        <TabsContent value="pipeline-stages">
          <ResourceTab type="pipeline-stages" title="Stage" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPanel
