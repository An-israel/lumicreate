import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Order, OrderItem } from "@/types/database";

export function useOrders() {
  const { user, isStaff } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (!isStaff) {
      query = query.eq("user_id", user.id);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError);
    } else {
      setOrders(data as Order[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user, isStaff]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

export function useOrder(orderId: string | undefined) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId || !user) {
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);

      const [orderResult, itemsResult] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);

      if (orderResult.error) {
        setError(orderResult.error);
      } else {
        setOrder(orderResult.data as Order);
      }

      if (!itemsResult.error) {
        setOrderItems(itemsResult.data as OrderItem[]);
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId, user]);

  return { order, orderItems, isLoading, error };
}