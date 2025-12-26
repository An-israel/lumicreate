import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Consultation } from "@/types/database";
import { toast } from "sonner";

export function useConsultations() {
  const { user, isStaff } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConsultations = async () => {
    if (!user) {
      setConsultations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let query = supabase
      .from("consultations")
      .select("*")
      .order("scheduled_date", { ascending: true });

    if (!isStaff) {
      query = query.eq("user_id", user.id);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError);
    } else {
      setConsultations(data as Consultation[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConsultations();
  }, [user, isStaff]);

  const bookConsultation = async (
    consultationType: Consultation["consultation_type"],
    scheduledDate: string,
    scheduledTime: string,
    coinsCost: number
  ) => {
    if (!user) {
      toast.error("Please sign in to book a consultation");
      return { error: new Error("Not authenticated") };
    }

    const { error } = await supabase.from("consultations").insert({
      user_id: user.id,
      consultation_type: consultationType,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      coins_paid: coinsCost,
    });

    if (error) {
      toast.error("Failed to book consultation");
      return { error };
    }

    toast.success("Consultation booked successfully!");
    await fetchConsultations();
    return { error: null };
  };

  return { consultations, isLoading, error, refetch: fetchConsultations, bookConsultation };
}