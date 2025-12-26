import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConsultations } from "@/hooks/useConsultations";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Coins, Check, Star, Users, Mic, Video } from "lucide-react";
import { CONSULTATION_TYPES, formatNaira, formatCoins } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"
];

export default function Consultations() {
  const { user, wallet } = useAuth();
  const { bookConsultation } = useConsultations();
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

    const coinBalance = wallet?.balance || 0;
    if (coinBalance < selectedConsultation.coins) {
      toast.error("Insufficient coins. Please purchase more coins first.");
      navigate("/buy-coins");
      return;
    }

    setIsProcessing(true);
    
    const { error } = await bookConsultation(
      selectedConsultation.id as any,
      format(selectedDate, "yyyy-MM-dd"),
      selectedTime,
      selectedConsultation.coins
    );

    setIsProcessing(false);

    if (!error) {
      setIsBookingOpen(false);
      setSelectedType(null);
      setSelectedDate(undefined);
      setSelectedTime("");
      navigate("/dashboard");
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
      <div className="container-main py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-accent text-accent-foreground">
            Expert Guidance
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Book a <span className="text-gradient">Consultation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized advice from our content creation experts.
            From equipment selection to full content strategy.
          </p>

          {/* Coin Balance */}
          {user && (
            <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border">
              <Coins className="h-6 w-6 text-secondary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold">{formatCoins(wallet?.balance || 0)} coins</p>
              </div>
            </div>
          )}
        </div>

        {/* Consultation Types */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {CONSULTATION_TYPES.map((type) => {
            const Icon = getTypeIcon(type.id);
            const isRecommended = "recommended" in type && type.recommended;

            return (
              <Card
                key={type.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 card-hover",
                  isRecommended && "border-primary shadow-lg"
                )}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                    RECOMMENDED
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "p-3 rounded-full",
                        isRecommended ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isRecommended ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-secondary font-bold">
                        <Coins className="h-4 w-4" />
                        {formatCoins(type.coins)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Value: {formatNaira(type.nairaValue)}
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{type.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {type.duration}
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">What's included:</p>
                    <ul className="space-y-1">
                      {type.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
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
                    <p className="text-sm font-semibold mb-2">Best for:</p>
                    <div className="flex flex-wrap gap-2">
                      {type.bestFor.slice(0, 2).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className={cn("w-full", isRecommended && "gradient-primary")}
                    onClick={() => handleSelectType(type.id)}
                  >
                    Book Now
                  </Button>
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
                        <div className="flex items-center gap-1 text-secondary font-bold">
                          <Coins className="h-4 w-4" />
                          {formatCoins(selectedConsultation.coins)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Balance: {formatCoins(wallet?.balance || 0)}
                        </p>
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
                {isProcessing ? "Booking..." : "Confirm Booking"}
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
                  Sign in to book a consultation and pay with coins
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
