import { useState } from "react";
import { Mail, Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface EmailCaptureProps {
  quizAnswers: Record<string, string>;
}

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
});

const EmailCapture = ({ quizAnswers }: EmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      // Subscribe to newsletter with quiz context
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: validation.data.email,
        });

      if (error) {
        if (error.code === "23505") {
          // Already subscribed
          toast.success("You're already subscribed! We'll send your recommendations.");
          setIsSubmitted(true);
        } else {
          throw error;
        }
      } else {
        toast.success("Recommendations saved! Check your inbox soon.");
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error saving email:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-muted/40">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">You're all set!</p>
              <p className="text-sm text-muted-foreground">
                We'll send your personalized recommendations to your inbox.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/40">
      <CardContent className="py-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
            <Mail className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground mb-1">
              Save Your Recommendations
            </h3>
            <p className="text-sm text-muted-foreground">
              Get your personalized equipment list sent to your inbox, plus exclusive deals on your recommended products.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={isSubmitting}
            required
          />
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailCapture;
