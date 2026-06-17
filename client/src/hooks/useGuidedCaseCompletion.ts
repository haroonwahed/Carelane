import { useState, useCallback } from "react";

export type GuidedStep = {
  id: string;
  label: string;
  fieldId: string;
  completed: boolean;
};

export function useGuidedCaseCompletion(initialSteps: GuidedStep[]) {
  const [steps, setSteps] = useState<GuidedStep[]>(initialSteps);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex] ?? null;
  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const isComplete = completedCount === totalSteps;

  const start = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
    // Auto-scroll to first incomplete step
    const firstIncompleteIndex = steps.findIndex(s => !s.completed);
    if (firstIncompleteIndex >= 0) {
      setCurrentStepIndex(firstIncompleteIndex);
      setTimeout(() => {
        const element = document.getElementById(steps[firstIncompleteIndex]?.fieldId ?? "");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }, 100);
    }
  }, [steps]);

  const markStepComplete = useCallback((stepId: string) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
    // Move to next incomplete step
    const nextIncompleteIndex = steps.findIndex((s, i) => i > currentStepIndex && !s.completed);
    if (nextIncompleteIndex >= 0) {
      setCurrentStepIndex(nextIncompleteIndex);
      setTimeout(() => {
        const element = document.getElementById(steps[nextIncompleteIndex]?.fieldId ?? "");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }, 100);
    } else if (isComplete) {
      setIsActive(false);
    }
  }, [steps, currentStepIndex, isComplete]);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    steps,
    completedCount,
    totalSteps,
    isComplete,
    start,
    markStepComplete,
    stop,
  };
}
