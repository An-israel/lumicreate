import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export function useCoinTransactions() {
  const { user } = useAuth();

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ["coin-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoinTransaction[];
    },
    enabled: !!user,
  });

  return {
    transactions: transactions || [],
    isLoading,
    refetch,
  };
}
