import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, Video, Mic, Camera, Monitor, Radio } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  question: string;
  options: {
    label: string;
    value: string;
    icon?: React.ElementType;
    description?: string;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "What type of content do you primarily create?",
    options: [
      { label: "YouTube Videos", value: "youtube", icon: Video, description: "Long-form video content" },
      { label: "TikTok/Reels", value: "tiktok", icon: Video, description: "Short-form vertical videos" },
      { label: "Podcasts", value: "podcast", icon: Mic, description: "Audio-focused content" },
      { label: "Live Streaming", value: "streaming", icon: Radio, description: "Real-time broadcasts" },
      { label: "Photography", value: "photography", icon: Camera, description: "Still images & portraits" },
    ],
  },
  {
    id: 2,
    question: "What's your current experience level?",
    options: [
      { label: "Just Starting", value: "beginner", description: "New to content creation" },
      { label: "Some Experience", value: "intermediate", description: "Created content for 6+ months" },
      { label: "Experienced", value: "advanced", description: "Creating content for 2+ years" },
      { label: "Professional", value: "professional", description: "Full-time creator or agency" },
    ],
  },
  {
    id: 3,
    question: "What's your budget range?",
    options: [
      { label: "Under ₦50,000", value: "basic", description: "Starting with essentials" },
      { label: "₦50,000 - ₦150,000", value: "mid", description: "Ready to invest in quality" },
      { label: "₦150,000 - ₦300,000", value: "premium", description: "Serious about production" },
      { label: "₦300,000+", value: "diamond", description: "Professional-grade setup" },
    ],
  },
  {
    id: 4,
    question: "What's your biggest challenge right now?",
    options: [
      { label: "Audio Quality", value: "audio", icon: Mic, description: "Sound is unclear or echoes" },
      { label: "Lighting", value: "lighting", icon: Monitor, description: "Videos look dark or unflattering" },
      { label: "Video Quality", value: "video", icon: Camera, description: "Footage isn't sharp enough" },
      { label: "Complete Setup", value: "complete", description: "Need everything from scratch" },
    ],
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Determine recommended tier based on answers
      const budget = answers[3];
      let tier = "basic";
      if (budget === "premium" || budget === "diamond") {
        tier = budget === "diamond" ? "diamond" : "premium";
      } else if (budget === "mid") {
        tier = "premium";
      }
      
      navigate(`/packages?tier=${tier}&content=${answers[1]}`);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const isAnswered = answers[question.id] !== undefined;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-12 md:py-20">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              Equipment Quiz
            </Badge>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-2">
              Find Your Perfect Setup
            </h1>
            <p className="text-muted-foreground">
              Answer a few questions and we'll recommend the best equipment for you
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {question.question}
              </h2>

              <div className="grid gap-3">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.value;
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      {Icon && (
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        )}
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="gap-2"
            >
              {currentQuestion === questions.length - 1 ? "See Recommendations" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;
