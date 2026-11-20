import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Shield, UserPlus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserWithRoles {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: string[];
  created_at: string;
}

export default function StaffManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "staff">("staff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    setIsLoading(true);
    
    // Get all profiles (admins can see all)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at");

    if (profilesError) {
      toast.error("Failed to fetch users");
      setIsLoading(false);
      return;
    }

    // Get all user roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast.error("Failed to fetch roles");
      setIsLoading(false);
      return;
    }

    // Get emails from auth (we'll use the profile's user_id to match)
    // Note: We can't directly query auth.users, so we'll display user_id as fallback
    
    // Combine the data
    const usersMap = new Map<string, UserWithRoles>();
    
    profiles?.forEach((profile) => {
      usersMap.set(profile.user_id, {
        user_id: profile.user_id,
        email: profile.user_id.substring(0, 8) + "...", // Placeholder - will show partial ID
        full_name: profile.full_name,
        roles: [],
        created_at: profile.created_at,
      });
    });

    roles?.forEach((role) => {
      const user = usersMap.get(role.user_id);
      if (user) {
        user.roles.push(role.role);
      }
    });

    // Filter to show only users with admin or staff roles, or all users for adding
    const allUsers = Array.from(usersMap.values());
    setUsers(allUsers);
    setIsLoading(false);
  };

  const addRoleToUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error("Please enter a user ID");
      return;
    }

    setIsSubmitting(true);

    // First check if user exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", newUserEmail.trim())
      .single();

    if (profileError || !profile) {
      toast.error("User not found. Make sure you enter the correct User ID.");
      setIsSubmitting(false);
      return;
    }

    // Check if role already exists
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", profile.user_id)
      .eq("role", newUserRole)
      .single();

    if (existingRole) {
      toast.error(`User already has the ${newUserRole} role`);
      setIsSubmitting(false);
      return;
    }

    // Add the role
    const { error } = await supabase
      .from("user_roles")
      .insert({
        user_id: profile.user_id,
        role: newUserRole,
      });

    if (error) {
      toast.error("Failed to add role: " + error.message);
    } else {
      toast.success(`Successfully added ${newUserRole} role`);
      setIsAddDialogOpen(false);
      setNewUserEmail("");
      fetchUsersWithRoles();
    }

    setIsSubmitting(false);
  };

  const removeRole = async (userId: string, role: string) => {
    if (!confirm(`Are you sure you want to remove the ${role} role from this user?`)) return;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role as "admin" | "staff" | "user");

    if (error) {
      toast.error("Failed to remove role: " + error.message);
    } else {
      toast.success("Role removed successfully");
      fetchUsersWithRoles();
    }
  };

  // Filter to show staff/admin users or all if searching
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasStaffRole = user.roles.includes("admin") || user.roles.includes("staff");
    
    return searchTerm ? matchesSearch : hasStaffRole;
  });

  if (!isAdmin) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only administrators can manage staff roles.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Staff Management</h2>
          <p className="text-muted-foreground">Manage admin and staff roles for users</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                Promote an existing user to staff or admin. You'll need their User ID from the database.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID (UUID)"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can find User IDs in the users list below
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
              <Select value={newUserRole} onValueChange={(v: string) => setNewUserRole(v as "admin" | "staff")}>
                <SelectTrigger>
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addRoleToUser} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>How to add staff:</strong> First, have the user sign up as a regular user. Then use their User ID here to promote them to Staff or Admin.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} {searchTerm ? "results" : "staff members"}
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No users found" : "No staff members yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {user.user_id.substring(0, 8)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(user.user_id);
                        toast.success("User ID copied!");
                      }}
                    >
                      Copy
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === "admin" ? "default" : role === "staff" ? "secondary" : "outline"}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.roles.filter(r => r !== "user").map((role) => (
                        <Button
                          key={role}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-destructive hover:text-destructive"
                          onClick={() => removeRole(user.user_id, role)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove {role}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* All Users Section for reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Registered Users</CardTitle>
          <CardDescription>
            Reference list of all users. Copy a User ID to promote them to staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Current Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 10).map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.full_name || "—"}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {user.user_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(user.user_id);
                        toast.success("User ID copied!");
                      }}
                    >
                      Copy
                    </Button>
                  </TableCell>
                  <TableCell>
                    {user.roles.length > 0 ? user.roles.join(", ") : "user"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length > 10 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Showing first 10 users. Use search to find specific users.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
