import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { initializePayment } from "@/lib/paystack";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Star, Users, Mic, Video, CreditCard } from "lucide-react";
import { CONSULTATION_TYPES, formatNaira } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"
];

export default function Consultations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedConsultation = CONSULTATION_TYPES.find((c) => c.id === selectedType);

  const handleSelectType = (typeId: string) => {
    if (!user) {
      toast.error("Please sign in to book a consultation");
      navigate("/auth");
      return;
    }
    setSelectedType(typeId);
    setIsBookingOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedConsultation || !selectedDate || !selectedTime || !user) return;

    setIsProcessing(true);
    
    try {
      // Create the consultation record first (pending payment)
      const { data: consultationData, error: consultationError } = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          consultation_type: selectedConsultation.id,
          scheduled_date: format(selectedDate, "yyyy-MM-dd"),
          scheduled_time: selectedTime,
          coins_paid: selectedConsultation.nairaValue, // Store naira value in coins_paid field for now
          status: "pending",
        })
        .select()
        .single();

      if (consultationError) {
        console.error("Consultation creation error:", consultationError);
        toast.error("Failed to book consultation. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Initialize Paystack payment
      const result = await initializePayment({
        type: "order", // Reuse order type for consultations
        amount: selectedConsultation.nairaValue,
        email: user.email || "",
        userId: user.id,
        metadata: {
          orderId: consultationData.id, // Use consultation ID
        },
      });

      if (result.success && result.authorization_url) {
        window.location.href = result.authorization_url;
        return;
      } else {
        console.error("Payment initialization error:", result.error);
        // Delete the consultation if payment failed to initialize
        await supabase.from("consultations").delete().eq("id", consultationData.id);
        toast.error(result.error || "Failed to initialize payment. Please try again.");
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const getTypeIcon = (id: string) => {
    switch (id) {
      case "equipment_selection":
        return Mic;
      case "setup_support":
        return Video;
      case "content_strategy":
        return Star;
      case "complete_package":
        return Users;
      default:
        return Star;
    }
  };

  return (
    <Layout>
      <PageHero
        eyebrow="Expert guidance"
        title="Book a consultation"
        subtitle="Personalised advice from our content creation experts — from equipment selection to full content strategy."
      />
      <div className="container py-16 md:py-24">

        {/* Consultation Types */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {CONSULTATION_TYPES.map((type) => {
            const Icon = getTypeIcon(type.id);
            const isRecommended = "recommended" in type && type.recommended;

            return (
              <Card
                key={type.id}
                className={cn(
                  "relative flex flex-col overflow-hidden transition-colors",
                  isRecommended ? "border-foreground" : "hover:border-foreground/20"
                )}
              >
                {isRecommended && (
                  <span className="absolute top-6 right-6 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
                    Recommended
                  </span>
                )}

                <CardHeader>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-xl">{type.name}</CardTitle>
                  <p className="text-2xl font-semibold tracking-tight">{formatNaira(type.nairaValue)}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {type.duration}
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col space-y-5">
                  <div>
                    <p className="text-sm font-medium mb-3">What's included</p>
                    <ul className="space-y-2">
                      {type.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                      {type.features.length > 4 && (
                        <li className="text-sm text-muted-foreground pl-6">
                          +{type.features.length - 4} more...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Best for</p>
                    <div className="flex flex-wrap gap-2">
                      {type.bestFor.slice(0, 2).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <Button
                      className="w-full"
                      variant={isRecommended ? "default" : "outline"}
                      onClick={() => handleSelectType(type.id)}
                    >
                      <CreditCard />
                      Book now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Booking Dialog */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book {selectedConsultation?.name}</DialogTitle>
              <DialogDescription>
                Select a date and time for your consultation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 30), date)
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              {selectedConsultation && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{selectedConsultation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedConsultation.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          {formatNaira(selectedConsultation.nairaValue)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay with Paystack"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Not logged in CTA */}
        {!user && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Sign in to book a consultation
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
