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
import { Textarea } from "@/components/ui/textarea";
import { 
  Clipboard, 
  ClipboardCheck, 
  Plus, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle
} from "lucide-react";

// Import our AdminDataPanel component
import AdminDataPanel from "../../../shared/components/AdminDataPanel";

const InvitationCodesPage = () => {
  const { user } = useAuth();
  const [invitationCodes, setInvitationCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  // Use our custom search hook for optimized search
  const { 
    inputValue: searchQuery, 
    debouncedValue: debouncedSearchQuery,
    isStale,
    handleInputChange 
  } = useSearch('');

  // Track filtered codes
  const [filteredCodes, setFilteredCodes] = useState([]);

  useEffect(() => {
    fetchInvitationCodes();
  }, []);

  // Filter codes when search query or codes change
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setFilteredCodes(invitationCodes);
      return;
    }

    const lowerQuery = debouncedSearchQuery.toLowerCase();
    const filtered = invitationCodes.filter(code => 
      code.code.toLowerCase().includes(lowerQuery) ||
      (code.notes && code.notes.toLowerCase().includes(lowerQuery))
    );
    
    setFilteredCodes(filtered);
  }, [debouncedSearchQuery, invitationCodes]);

  const fetchInvitationCodes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/admin/invitation-codes");
      
      if (response.data.success) {
        const codes = response.data.invitationCodes || [];
        setInvitationCodes(codes);
        setFilteredCodes(codes);
      } else {
        toast.error("Failed to fetch invitation codes");
      }
    } catch (error) {
      toast.error("Error fetching invitation codes: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const refreshInvitationCodes = async () => {
    setRefreshing(true);
    await fetchInvitationCodes();
    setRefreshing(false);
  };

  const generateInvitationCode = async () => {
    setGeneratingCode(true);
    try {
      const response = await axiosInstance.post("/api/admin/invitation-codes", {
        notes,
      });
      
      if (response.data.success) {
        toast.success("Invitation code generated successfully");
        setInvitationCodes([response.data.invitationCode, ...invitationCodes]);
        setFilteredCodes([response.data.invitationCode, ...filteredCodes]);
        setGenerateDialogOpen(false);
        setNotes("");
      } else {
        toast.error("Failed to generate invitation code");
      }
    } catch (error) {
      toast.error("Error generating invitation code: " + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCodeId(id);
        toast.success("Code copied to clipboard");
        
        // Reset copied state after 3 seconds
        setTimeout(() => {
          setCopiedCodeId(null);
        }, 3000);
      })
      .catch(() => {
        toast.error("Failed to copy code");
      });
  };



  // Helper function to check if code is expired
  const isCodeExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  // Format relative time (e.g., "2 minutes ago")
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return format(new Date(date), "MMM d, yyyy");
  };

  // Action button for the panel header
  const generateButton = (
    <Button 
      size="sm"
      onClick={() => setGenerateDialogOpen(true)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Generate New Code
    </Button>
  );

  // Define table columns
  const columns = [
    {
      header: "Code",
      accessor: "code",
      cell: (code) => <span className="font-mono">{code.code}</span>,
    },
    {
      header: "Created",
      accessor: "createdAt",
      cell: (code) => formatRelativeTime(code.createdAt),
    },
    {
      header: "Expires",
      accessor: "expiresAt",
      cell: (code) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
          {format(new Date(code.expiresAt), "MMM d, h:mm a")}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (code) => {
        const expired = isCodeExpired(code.expiresAt);
        const used = code.used;
        
        if (used) {
          return (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              Used
            </Badge>
          );
        } else if (expired) {
          return (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Expired
            </Badge>
          );
        } else {
          return (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </Badge>
          );
        }
      },
    },
    {
      header: "Notes",
      accessor: "notes",
      cellClassName: "max-w-[200px] truncate",
      cell: (code) => code.notes || "-",
    },
    {
      header: "Actions",
      accessor: "",
      className: "text-right",
      cellClassName: "text-right",
      cell: (code) => {
        const expired = isCodeExpired(code.expiresAt);
        const used = code.used;
        
        return (
          <div className="flex justify-end space-x-1">
            {/* Copy Code button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(code.code, code.id)}
              disabled={used || expired}
              title="Copy Code"
            >
              {copiedCodeId === code.id ? (
                <ClipboardCheck className="h-4 w-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
            

          </div>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Invitation Codes</h1>
      
      {/* Using our new AdminDataPanel component */}
      <AdminDataPanel
        title="Invitation Codes"
        description="Generate and manage invitation codes for new user registrations."
        columns={columns}
        data={filteredCodes}
        loading={loading}
        isStale={isStale}
        searchValue={searchQuery}
        onSearchChange={handleInputChange}
        onRefresh={refreshInvitationCodes}
        refreshing={refreshing}
        searchPlaceholder="Search codes or notes..."
        emptyMessage="No invitation codes found. Generate a new code to get started."
        actions={generateButton}
      />

      {/* Generate Code Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Invitation Code</DialogTitle>
            <DialogDescription>
              Create a new invitation code that will be valid for 1 hour. You can add optional notes to track its purpose.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            <label className="block text-sm font-medium mb-1">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="What is this code for? (e.g., 'New finance team member')"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGenerateDialogOpen(false)}
              disabled={generatingCode}
            >
              Cancel
            </Button>
            <Button
              onClick={generateInvitationCode}
              disabled={generatingCode}
            >
              {generatingCode ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvitationCodesPage;