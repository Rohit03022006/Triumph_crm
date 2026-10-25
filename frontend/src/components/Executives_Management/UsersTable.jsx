import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck, Edit, UserX, MoreVertical, User } from "lucide-react";

const UsersTable = ({ users, totalPages, currentPage, onPageChange, isLoading, onVerify, onEdit, onDelete, selectedIds = [], setSelectedIds }) => {
  const navigate = useNavigate();
  
  const allIdsOnPage = users?.map(u => u.id) || [];
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedIds.includes(id));
  const isSomeSelected = allIdsOnPage.some(id => selectedIds.includes(id));

  const toggleSelectAll = (checked) => {
    if (checked) {
      const newIds = new Set([...selectedIds, ...allIdsOnPage]);
      setSelectedIds(Array.from(newIds));
    } else {
      setSelectedIds(selectedIds.filter(id => !allIdsOnPage.includes(id)));
    }
  };

  const toggleSelectOne = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/60 bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12 px-6 py-4">
              <Checkbox 
                checked={isAllSelected || (isSomeSelected && "indeterminate")} 
                onCheckedChange={toggleSelectAll} 
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-[11px] tracking-wider uppercase h-12">
              NAME
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-[11px] tracking-wider uppercase h-12">
              EMAIL
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-[11px] tracking-wider uppercase h-12">
              ROLE
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-[11px] tracking-wider uppercase h-12">
              VERIFICATION
            </TableHead>
            
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-[11px] tracking-wider uppercase h-12 text-right">
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Loading staff data...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/users/${user.id}`)}>
                <TableCell className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedIds.includes(user.id)} 
                    onCheckedChange={(checked) => toggleSelectOne({stopPropagation: ()=>{}}, user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-200">
                      {user.image && (
                        <AvatarImage src={user.image} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-slate-200 text-foreground/80 font-semibold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">
                      {user.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-muted-foreground text-sm">
                  {user.email}
                </TableCell>
                <TableCell className="px-6 py-4 text-foreground/80 font-medium text-sm">
                  {user.role === "ADMIN" ? "Administrator" : "Executive"}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className={`inline-flex items-center text-xs font-semibold ${user.emailVerified ? 'text-success' : 'text-warning'}`}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </TableCell> 
                <TableCell className="px-6 py-4 text-right pr-4">
                  <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-foreground/80 h-8 w-8"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-xl"
                    >
                      {!user.emailVerified && (
                        <DropdownMenuItem
                          onClick={() => onVerify(user.id)}
                          className="cursor-pointer font-medium text-warning"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" /> Verify Email
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit(user)}
                        className="cursor-pointer font-medium text-foreground/80"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Edit Staff
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        className="cursor-pointer font-medium text-danger focus:text-danger focus:bg-danger/10"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to completely delete this user? This action cannot be undone.",
                            )
                          ) {
                            onDelete(user.id);
                          }
                        }}
                      >
                        <UserX className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
