import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import axiosInstance from "../../../shared/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clipboard, ClipboardCheck, Plus, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react";

const InvitationCodesPage = () => {
  const { user } = useAuth();
  const [invitationCodes, setInvitationCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvitationCodes();
  }, []);

  const fetchInvitationCodes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/admin/invitation-codes");
      
      if (response.data.success) {
        setInvitationCodes(response.data.invitationCodes || []);
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Invitation Codes</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Invitation Codes</CardTitle>
              <CardDescription>
                Generate and manage invitation codes for new user registrations.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshInvitationCodes}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                size="sm"
                onClick={() => setGenerateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate New Code
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invitationCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invitation codes found. Generate a new code to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitationCodes.map((code) => {
                    const expired = isCodeExpired(code.expiresAt);
                    const used = code.used;
                    
                    return (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono">{code.code}</TableCell>
                        <TableCell>{formatRelativeTime(code.createdAt)}</TableCell>
                        <TableCell className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          {format(new Date(code.expiresAt), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell>
                          {used ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              Used
                            </Badge>
                          ) : expired ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Expired
                            </Badge>
                          ) : (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {code.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code.code, code.id)}
                            disabled={used || expired}
                          >
                            {copiedCodeId === code.id ? (
                              <ClipboardCheck className="h-4 w-4" />
                            ) : (
                              <Clipboard className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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