import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSearch } from "../../../shared/hooks/useSearch";
import axiosInstance from "../../../shared/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserCog, AlertTriangle } from "lucide-react";

// Import our AdminDataPanel component
import AdminDataPanel from "../../../shared/components/AdminDataPanel";

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
  const [refreshing, setRefreshing] = useState(false);

  // Use our custom search hook for optimized search
  const { 
    inputValue: searchQuery, 
    debouncedValue: debouncedSearchQuery,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    // Reset to first page when refreshing explicitly
    setPagination((prev) => ({ ...prev, page: 1 }));
    await fetchUsers();
    setRefreshing(false);
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

  // Define table columns
  const columns = [
    {
      header: "Name",
      accessor: "name",
      cell: (user) => <span className="font-medium">{user.name}</span>,
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      accessor: "role",
      cell: (user) => (
        <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
          {user.role === "ADMIN" ? "Admin" : "Regular"}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessor: "created_at",
      cell: (user) => (
        user.created_at 
          ? format(new Date(user.created_at), 'MMM d, yyyy') 
          : 'N/A'
      ),
    },
    {
      header: "Status",
      accessor: "active",
      cell: (user) => (
        <Badge variant={user.active ? "success" : "destructive"}>
          {user.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "",
      className: "text-right",
      cellClassName: "text-right",
      cell: (user) => (
        <Button
          variant={user.active ? "destructive" : "default"}
          size="sm"
          onClick={() => openConfirmDialog(
            user,
            user.active ? "deactivate" : "activate"
          )}
          disabled={user.id === 1} // Disable action for default admin account
        >
          {user.active ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">User Management</h1>

      {/* Using our new AdminDataPanel component */}
      <AdminDataPanel
        title="Users"
        description="Manage all users in the system. You can activate or deactivate accounts as needed."
        columns={columns}
        data={users}
        loading={loading}
        isStale={isStale}
        searchValue={searchQuery}
        onSearchChange={handleInputChange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        searchPlaceholder="Search by name or email..."
        emptyMessage="No users found"
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange,
        }}
      />

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