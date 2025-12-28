import { useState } from "react";
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareResultsProps {
  quizAnswers: Record<string, string>;
}

const ShareResults = ({ quizAnswers }: ShareResultsProps) => {
  const [copied, setCopied] = useState(false);

  // Generate shareable URL with quiz answers
  const params = new URLSearchParams(quizAnswers);
  const shareUrl = `${window.location.origin}/quiz/results?${params.toString()}`;
  
  const shareTitle = "Check out my personalized creator equipment recommendations!";
  const shareText = `I just took the equipment quiz and found my perfect creator setup. Take the quiz to find yours!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    }
  };

  const socialButtons = [
    { icon: Twitter, label: "Twitter", onClick: shareToTwitter, className: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]" },
    { icon: Facebook, label: "Facebook", onClick: shareToFacebook, className: "hover:bg-[#4267B2]/10 hover:text-[#4267B2]" },
    { icon: Linkedin, label: "LinkedIn", onClick: shareToLinkedIn, className: "hover:bg-[#0077B5]/10 hover:text-[#0077B5]" },
    { icon: MessageCircle, label: "WhatsApp", onClick: shareToWhatsApp, className: "hover:bg-[#25D366]/10 hover:text-[#25D366]" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Recommendations</DialogTitle>
          <DialogDescription>
            Share your personalized equipment recommendations with friends or save the link for later.
          </DialogDescription>
        </DialogHeader>

        {/* Native Share (Mobile) */}
        {typeof navigator !== "undefined" && navigator.share && (
          <Button onClick={handleNativeShare} className="w-full gap-2 mb-4">
            <Share2 className="h-4 w-4" />
            Share via...
          </Button>
        )}

        {/* Social Media Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {socialButtons.map((social) => (
            <Button
              key={social.label}
              variant="outline"
              size="lg"
              className={`flex flex-col items-center gap-1 h-auto py-3 ${social.className}`}
              onClick={social.onClick}
            >
              <social.icon className="h-5 w-5" />
              <span className="text-xs">{social.label}</span>
            </Button>
          ))}
        </div>

        {/* Copy Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Or copy link</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareResults;
