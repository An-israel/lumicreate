import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, Coins, AlertTriangle, CheckCircle, RefreshCw, Edit, Plus, Minus, TrendingUp, TrendingDown, User } from "lucide-react";
import { formatNaira, formatCoins } from "@/lib/constants";

interface UserWallet {
  user_id: string;
  balance: number;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
  full_name?: string | null;
  email?: string | null;
}

interface FailedTransaction {
  id: string;
  reference: string;
  amount: number;
  user_id: string | null;
  details: any;
  created_at: string;
  is_resolved: boolean;
  full_name?: string | null;
  email?: string | null;
}

export default function CoinManagement() {
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [failedTransactions, setFailedTransactions] = useState<FailedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWallet | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManualCreditDialogOpen, setIsManualCreditDialogOpen] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [manualCreditAmount, setManualCreditAmount] = useState("");
  const [manualCreditReason, setManualCreditReason] = useState("");
  const [manualCreditUserId, setManualCreditUserId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch wallets with user profiles (using left join, not inner)
    const { data: walletsData, error: walletsError } = await supabase
      .from("coin_wallets")
      .select(`
        user_id,
        balance,
        created_at,
        updated_at
      `)
      .order("balance", { ascending: false });

    if (walletsError) {
      console.error("Error fetching wallets:", walletsError);
    } else {
      // Fetch profiles separately to avoid inner join issues
      const userIds = walletsData?.map(w => w.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      
      const profileMap = new Map((profilesData || []).map(p => [p.id, { full_name: p.full_name, email: p.email }]));
      
      const walletsWithEmail: UserWallet[] = (walletsData || []).map((w: any) => {
        const profile = profileMap.get(w.user_id);
        return {
          user_id: w.user_id,
          balance: w.balance,
          full_name: profile?.full_name || `User ${w.user_id.slice(0, 8)}...`,
          email: profile?.email || null,
          created_at: w.created_at,
          updated_at: w.updated_at,
        };
      });
      
      setWallets(walletsWithEmail);
    }

    // Fetch recent transactions (without inner join)
    const { data: txData, error: txError } = await supabase
      .from("coin_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (txError) {
      console.error("Error fetching transactions:", txError);
    } else {
      // Fetch profiles for transactions
      const txUserIds = [...new Set((txData || []).map(tx => tx.user_id))];
      const { data: txProfilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", txUserIds);
      
      const txProfileMap = new Map((txProfilesData || []).map(p => [p.id, p.full_name]));
      
      setTransactions((txData || []).map((tx: any) => ({
        ...tx,
        full_name: txProfileMap.get(tx.user_id) || `User ${tx.user_id.slice(0, 8)}...`,
      })));
    }

    // Fetch failed coin-related payment alerts
    const { data: alertsData, error: alertsError } = await supabase
      .from("payment_alerts")
      .select("*")
      .in("type", ["failed_payment", "refund"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
    } else {
      setFailedTransactions((alertsData || []).map((alert: any) => ({
        id: alert.id,
        reference: alert.reference,
        amount: alert.amount,
        user_id: alert.user_id,
        details: alert.details,
        created_at: alert.created_at,
        is_resolved: alert.is_resolved,
      })));
    }

    setIsLoading(false);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser) return;

    const balance = parseInt(newBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error("Please enter a valid balance");
      return;
    }

    const { error } = await supabase
      .from("coin_wallets")
      .update({ balance })
      .eq("user_id", selectedUser.user_id);

    if (error) {
      toast.error("Failed to update balance");
      console.error(error);
    } else {
      // Log the adjustment
      const difference = balance - selectedUser.balance;
      await supabase.from("coin_transactions").insert({
        user_id: selectedUser.user_id,
        amount: difference,
        type: difference >= 0 ? "admin_credit" : "admin_debit",
        description: `Admin balance adjustment: ${selectedUser.balance} → ${balance}`,
        reference_id: `admin_adj_${Date.now()}`,
      });

      toast.success("Balance updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setNewBalance("");
      fetchData();
    }
  };

  const handleManualCredit = async () => {
    if (!manualCreditUserId) {
      toast.error("Please select a user");
      return;
    }

    const amount = parseInt(manualCreditAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Get current balance
    const { data: wallet, error: walletError } = await supabase
      .from("coin_wallets")
      .select("balance")
      .eq("user_id", manualCreditUserId)
      .single();

    if (walletError) {
      toast.error("Failed to fetch wallet");
      return;
    }

    const newBalanceValue = (wallet?.balance || 0) + amount;

    // Update balance
    const { error: updateError } = await supabase
      .from("coin_wallets")
      .update({ balance: newBalanceValue })
      .eq("user_id", manualCreditUserId);

    if (updateError) {
      toast.error("Failed to update balance");
      return;
    }

    // Log transaction
    await supabase.from("coin_transactions").insert({
      user_id: manualCreditUserId,
      amount: amount,
      type: amount >= 0 ? "admin_credit" : "admin_debit",
      description: manualCreditReason || `Admin ${amount >= 0 ? "credit" : "debit"}`,
      reference_id: `admin_manual_${Date.now()}`,
    });

    toast.success(`Successfully ${amount >= 0 ? "credited" : "debited"} ${Math.abs(amount)} coins`);
    setIsManualCreditDialogOpen(false);
    setManualCreditAmount("");
    setManualCreditReason("");
    setManualCreditUserId("");
    fetchData();
  };

  const handleResolveFailedTransaction = async (alertId: string, userId: string | null, details: any) => {
    if (!userId) {
      toast.error("Cannot resolve: No user associated with this transaction");
      return;
    }

    // Get the coins that should have been credited
    const coinsAmount = details?.metadata?.coinsAmount || 0;
    const bonusCoins = details?.metadata?.bonusCoins || 0;
    const totalCoins = coinsAmount + bonusCoins;

    if (totalCoins === 0) {
      toast.error("Cannot determine coin amount from transaction details");
      return;
    }

    // Get current balance
    const { data: wallet } = await supabase
      .from("coin_wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    const newBalanceValue = (wallet?.balance || 0) + totalCoins;

    // Update balance
    const { error: updateError } = await supabase
      .from("coin_wallets")
      .update({ balance: newBalanceValue })
      .eq("user_id", userId);

    if (updateError) {
      toast.error("Failed to credit coins");
      return;
    }

    // Log transaction
    await supabase.from("coin_transactions").insert({
      user_id: userId,
      amount: totalCoins,
      type: "admin_credit",
      description: `Manual resolution of failed transaction`,
      reference_id: `resolved_${details?.reference || alertId}`,
    });

    // Mark alert as resolved
    await supabase
      .from("payment_alerts")
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", alertId);

    toast.success(`Credited ${totalCoins} coins to user`);
    fetchData();
  };

  const filteredWallets = wallets.filter(w =>
    (w.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (w.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    w.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalCoins: wallets.reduce((sum, w) => sum + w.balance, 0),
    totalUsers: wallets.length,
    activeUsers: wallets.filter(w => w.balance > 0).length,
    pendingIssues: failedTransactions.filter(t => !t.is_resolved).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Coins</p>
                <p className="text-xl font-bold">{formatCoins(stats.totalCoins)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <User className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Issues</p>
                <p className="text-xl font-bold">{stats.pendingIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setIsManualCreditDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Manual Credit/Debit
        </Button>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="wallets">
        <TabsList>
          <TabsTrigger value="wallets">User Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="issues">
            Failed Transactions
            {stats.pendingIssues > 0 && (
              <Badge variant="destructive" className="ml-2">{stats.pendingIssues}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.user_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{wallet.full_name || "Unknown"}</p>
                        {wallet.email && (
                          <p className="text-xs text-muted-foreground">{wallet.email}</p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono">{wallet.user_id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={wallet.balance > 0 ? "default" : "secondary"}>
                        {formatCoins(wallet.balance)} coins
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(wallet.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(wallet);
                          setNewBalance(wallet.balance.toString());
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <p className="font-medium">{tx.full_name || "Unknown"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "purchase" ? "default" : tx.type.includes("admin") ? "secondary" : "outline"}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                        {tx.amount >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                        {tx.amount >= 0 ? "+" : ""}{formatCoins(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Failed Transactions</CardTitle>
              <CardDescription>
                Transactions that failed during processing. You can manually resolve these by crediting the user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {failedTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No failed transactions</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">
                          {tx.reference.slice(0, 12)}...
                        </TableCell>
                        <TableCell>
                          {tx.amount ? formatNaira(tx.amount) : "N/A"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.user_id ? `${tx.user_id.slice(0, 8)}...` : "Unknown"}
                        </TableCell>
                        <TableCell>
                          {tx.is_resolved ? (
                            <Badge variant="outline" className="text-green-600">Resolved</Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(tx.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {!tx.is_resolved && tx.user_id && (
                            <Button
                              size="sm"
                              onClick={() => handleResolveFailedTransaction(tx.id, tx.user_id, tx.details)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve & Credit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Balance Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coin Balance</DialogTitle>
            <DialogDescription>
              Adjust the coin balance for {selectedUser?.full_name || "this user"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Balance</Label>
              <p className="text-2xl font-bold">{formatCoins(selectedUser?.balance || 0)} coins</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBalance">New Balance</Label>
              <Input
                id="newBalance"
                type="number"
                min={0}
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance}>
              Update Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Credit Dialog */}
      <Dialog open={isManualCreditDialogOpen} onOpenChange={setIsManualCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Credit/Debit</DialogTitle>
            <DialogDescription>
              Add or remove coins from a user's wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Select User</Label>
              <select
                id="userId"
                value={manualCreditUserId}
                onChange={(e) => setManualCreditUserId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select a user...</option>
                {wallets.map((w) => (
                  <option key={w.user_id} value={w.user_id}>
                    {w.full_name || w.user_id.slice(0, 8)} ({formatCoins(w.balance)} coins)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (use negative for debit)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 100 or -50"
                value={manualCreditAmount}
                onChange={(e) => setManualCreditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="e.g. Compensation for failed transaction"
                value={manualCreditReason}
                onChange={(e) => setManualCreditReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualCreditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualCredit}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}