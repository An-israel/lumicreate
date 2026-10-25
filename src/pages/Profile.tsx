import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, Plus, Trash2, Check, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryAddress } from "@/types/database";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number").optional().or(z.literal("")),
});

const addressSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, "Invalid phone number"),
  address_line1: z.string().min(1, "Address is required").max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
});

const Profile = () => {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });
  
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    const { data, error } = await supabase
      .from("delivery_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    
    if (!error && data) {
      setAddresses(data as DeliveryAddress[]);
    }
    setLoadingAddresses(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = profileSchema.safeParse(profileForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone || null,
      })
      .eq("user_id", user?.id);

    if (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully!" });
      refreshProfile();
    }
    setSavingProfile(false);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = addressSchema.safeParse(addressForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSavingAddress(true);
    
    if (editingAddress) {
      const { error } = await supabase
        .from("delivery_addresses")
        .update({
          ...addressForm,
          address_line2: addressForm.address_line2 || null,
        })
        .eq("id", editingAddress.id);
      
      if (error) {
        toast({ title: "Failed to update address", variant: "destructive" });
      } else {
        toast({ title: "Address updated!" });
        fetchAddresses();
        setAddressDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from("delivery_addresses")
        .insert({
          user_id: user?.id,
          ...addressForm,
          address_line2: addressForm.address_line2 || null,
          is_default: addresses.length === 0,
        });
      
      if (error) {
        toast({ title: "Failed to add address", variant: "destructive" });
      } else {
        toast({ title: "Address added!" });
        fetchAddresses();
        setAddressDialogOpen(false);
      }
    }
    
    setSavingAddress(false);
  };

  const handleSetDefault = async (addressId: string) => {
    // First, unset all defaults
    await supabase
      .from("delivery_addresses")
      .update({ is_default: false })
      .eq("user_id", user?.id);
    
    // Then set the new default
    await supabase
      .from("delivery_addresses")
      .update({ is_default: true })
      .eq("id", addressId);
    
    toast({ title: "Default address updated!" });
    fetchAddresses();
  };

  const handleDeleteAddress = async (addressId: string) => {
    const { error } = await supabase
      .from("delivery_addresses")
      .delete()
      .eq("id", addressId);
    
    if (error) {
      toast({ title: "Failed to delete address", variant: "destructive" });
    } else {
      toast({ title: "Address deleted!" });
      fetchAddresses();
    }
  };

  const openAddressDialog = (address?: DeliveryAddress) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        full_name: address.full_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || "",
        city: address.city,
        state: address.state,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
      });
    }
    setErrors({});
    setAddressDialogOpen(true);
  };

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen py-8 md:py-12">
        <div className="container max-w-4xl">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-8">
            Profile Settings
          </h1>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your name and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                        className={errors.full_name ? "border-destructive" : ""}
                      />
                      {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+234 or 0..."
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email || ""} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Delivery Addresses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Addresses
                    </CardTitle>
                    <CardDescription>
                      Manage your shipping addresses
                    </CardDescription>
                  </div>
                  <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => openAddressDialog()}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                        <DialogDescription>
                          Enter the delivery address details
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="addr_name">Full Name</Label>
                            <Input
                              id="addr_name"
                              value={addressForm.full_name}
                              onChange={(e) => setAddressForm(a => ({ ...a, full_name: e.target.value }))}
                              className={errors.full_name ? "border-destructive" : ""}
                            />
                            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addr_phone">Phone</Label>
                            <Input
                              id="addr_phone"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm(a => ({ ...a, phone: e.target.value }))}
                              className={errors.phone ? "border-destructive" : ""}
                            />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_line1">Address Line 1</Label>
                          <Input
                            id="address_line1"
                            value={addressForm.address_line1}
                            onChange={(e) => setAddressForm(a => ({ ...a, address_line1: e.target.value }))}
                            className={errors.address_line1 ? "border-destructive" : ""}
                          />
                          {errors.address_line1 && <p className="text-sm text-destructive">{errors.address_line1}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                          <Input
                            id="address_line2"
                            value={addressForm.address_line2}
                            onChange={(e) => setAddressForm(a => ({ ...a, address_line2: e.target.value }))}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm(a => ({ ...a, city: e.target.value }))}
                              className={errors.city ? "border-destructive" : ""}
                            />
                            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm(a => ({ ...a, state: e.target.value }))}
                              className={errors.state ? "border-destructive" : ""}
                            />
                            {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setAddressDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={savingAddress}>
                            {savingAddress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingAddress ? "Update" : "Add"} Address
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAddresses ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-start justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{address.full_name}</p>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!address.is_default && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSetDefault(address.id)}
                              title="Set as default"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAddressDialog(address)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No addresses saved yet</p>
                    <Button variant="link" onClick={() => openAddressDialog()}>
                      Add your first address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
