import React, { useState, useEffect, memo } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSearch } from "../../../shared/hooks/useSearch";
import axiosInstance from "../../../shared/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Search, UserCog, AlertTriangle } from "lucide-react";

// Memoized user table component to prevent unnecessary re-renders
const UserTable = memo(function UserTable({ users, onOpenConfirmDialog, isStale }) {
  return (
    <div
      style={{
        opacity: isStale ? 0.7 : 1,
        transition: isStale ? 'opacity 0.2s 0.2s linear' : 'opacity 0s 0s linear'
      }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "outline"}
                  >
                    {user.role === "ADMIN" ? "Admin" : "Regular"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at 
                    ? format(new Date(user.created_at), 'MMM d, yyyy') 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.active ? "success" : "destructive"}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={user.active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => onOpenConfirmDialog(
                      user,
                      user.active ? "deactivate" : "activate"
                    )}
                    disabled={user.id === 1} // Disable action for default admin account
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});

const UserManagementPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");

  // Use our custom search hook for optimized search
  const { 
    inputValue: searchQuery, 
    debouncedValue: debouncedSearchQuery,
    deferredValue: deferredSearchQuery,
    isStale,
    handleInputChange 
  } = useSearch("", 300); // 300ms debounce delay

  // Fetch users on component mount and when debounced pagination or search changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, debouncedSearchQuery]); // Use debounced value for API calls

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/admin/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchQuery,
        },
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      toast.error(
        "Error fetching users: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching (handled in effect above)
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const openConfirmDialog = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setConfirmDialogOpen(true);
  };

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;

    try {
      const newActiveStatus = !selectedUser.active;
      const response = await axiosInstance.patch(
        `/api/admin/users/${selectedUser.id}`,
        {
          active: newActiveStatus,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Update user in the state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === selectedUser.id ? { ...u, active: newActiveStatus } : u
          )
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        "Error updating user: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setConfirmDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // Function to render pagination controls
  const renderPagination = () => {
    const { page, totalPages } = pagination;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && handlePageChange(page - 1)}
              disabled={page <= 1}
            />
          </PaginationItem>

          {/* Always show first page */}
          {page > 2 && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(1)}>
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Show ellipsis if needed */}
          {page > 3 && (
            <PaginationItem>
              <PaginationLink disabled>...</PaginationLink>
            </PaginationItem>
          )}

          {/* Show current page and adjacent pages */}
          {page > 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(page - 1)}>
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink isActive>{page}</PaginationLink>
          </PaginationItem>

          {page < totalPages && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(page + 1)}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Show ellipsis if needed */}
          {page < totalPages - 2 && (
            <PaginationItem>
              <PaginationLink disabled>...</PaginationLink>
            </PaginationItem>
          )}

          {/* Always show last page */}
          {page < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              disabled={page >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">User Management</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Users</CardTitle>
          <CardDescription>
            Manage all users in the system. You can activate or deactivate
            accounts as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>

          {/* Users table */}
          {loading && !isStale ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <UserTable 
                users={users} 
                onOpenConfirmDialog={openConfirmDialog}
                isStale={isStale}
              />
              
              {/* Show loading indicator below the table when updating stale content */}
              {isStale && loading && (
                <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Updating results...</span>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center">{renderPagination()}</div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm{" "}
              {actionType === "deactivate" ? "Deactivation" : "Activation"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "deactivate"
                ? "Deactivating a user will prevent them from logging in and accessing the system. Their data will be preserved."
                : "Activating a user will allow them to log in and access the system again."}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-2">
              <p className="font-medium">
                {actionType === "deactivate" ? "Deactivate" : "Activate"} this
                user?
              </p>
              <div className="mt-2 flex items-center p-2 border rounded bg-muted">
                <UserCog className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "deactivate" ? "destructive" : "default"}
              onClick={handleToggleUserStatus}
            >
              {actionType === "deactivate" ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;