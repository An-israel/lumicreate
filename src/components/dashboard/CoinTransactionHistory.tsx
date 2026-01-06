import { Link } from "react-router-dom";
import { Coins, TrendingUp, TrendingDown, ShoppingCart, Gift, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCoinTransactions } from "@/hooks/useCoinTransactions";
import { formatCoins } from "@/lib/constants";
import { cn } from "@/lib/utils";

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "purchase":
      return TrendingUp;
    case "spend":
      return ShoppingCart;
    case "bonus":
      return Gift;
    case "refund":
      return TrendingDown;
    default:
      return Coins;
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case "purchase":
    case "bonus":
    case "refund":
      return "text-green-500";
    case "spend":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};

const getTransactionBadge = (type: string) => {
  switch (type) {
    case "purchase":
      return { label: "Purchase", variant: "default" as const };
    case "spend":
      return { label: "Spent", variant: "secondary" as const };
    case "bonus":
      return { label: "Bonus", variant: "outline" as const };
    case "refund":
      return { label: "Refund", variant: "outline" as const };
    default:
      return { label: type, variant: "outline" as const };
  }
};

interface CoinTransactionHistoryProps {
  limit?: number;
  showViewAll?: boolean;
}

export function CoinTransactionHistory({ limit = 5, showViewAll = true }: CoinTransactionHistoryProps) {
  const { transactions, isLoading } = useCoinTransactions();

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-coin" />
            Coin Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-coin" />
            Coin Activity
          </CardTitle>
          {showViewAll && transactions.length > limit && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/transactions">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayTransactions.length > 0 ? (
          <ScrollArea className={limit > 5 ? "h-[400px]" : ""}>
            <div className="space-y-3">
              {displayTransactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                const badge = getTransactionBadge(transaction.type);
                const isPositive = ["purchase", "bonus", "refund"].includes(transaction.type);

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("p-2 rounded-full bg-muted", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {transaction.description || "Coin transaction"}
                        </p>
                        <Badge variant={badge.variant} className="text-xs shrink-0">
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className={cn("font-semibold text-right", colorClass)}>
                      {isPositive ? "+" : "-"}{formatCoins(Math.abs(transaction.amount))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No coin transactions yet</p>
            <Button variant="link" asChild>
              <Link to="/buy-coins">Buy your first coins</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
