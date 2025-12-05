"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

const onboardingSteps = [
  {
    title: "Welcome to TripSplit",
    description: "Manage trip expenses easily with your friends. Track every expense and never worry about splitting bills again.",
    image: "/assets/onboarding-welcome.png", // Direct path to public folder
  },
  {
    title: "Track Who Owes Whom",
    description: "Smart calculations show exactly who owes what. Split expenses fairly and transparently across all members.",
    image: "/assets/onboarding-split.png",
  },
  {
    title: "Scan QR & Settle Faster",
    description: "Generate QR codes for quick payments. Mark settlements instantly and keep everyone updated in real-time.",
    image: "/assets/onboarding-settle.png",
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (hasSeen) {
      router.push("/login");
    }
  }, [router]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      router.push("/login");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    router.push("/login");
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Image */}
          <div className="flex justify-center mb-8">
            <img 
              src={step.image}
              alt={step.title}
              className="w-full max-w-sm h-auto rounded-2xl shadow-float animate-scale-in object-contain max-h-[300px]"
            />
          </div>

          {/* Content */}
          <div className="text-center space-y-4 animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">
              {step.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 py-6">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNext}
              className="flex-1 gradient-primary hover:opacity-90 transition-opacity"
            >
              {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Skip Button */}
          {currentStep < onboardingSteps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;