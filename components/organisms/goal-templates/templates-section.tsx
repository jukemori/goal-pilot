"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateGrid } from "./template-grid";
import { GoalTemplate } from "@/lib/templates/goal-templates";
import { Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TemplatesSectionProps {
  hasActiveGoals: boolean;
}

export function TemplatesSection({ hasActiveGoals }: TemplatesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!hasActiveGoals); // Auto-expand if no active goals
  const router = useRouter();

  const handleUseTemplate = (template: GoalTemplate) => {
    // Store template data in sessionStorage to pre-fill the form
    sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
    // Navigate to goal creation form
    router.push("/goals/new?fromTemplate=true");
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              Goal Templates
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Jump-start your learning with pre-designed goal templates
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2 self-start md:self-auto"
          >
            <span>{isExpanded ? "Hide" : "Browse Templates"}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              opacity: { duration: 0.2 },
            }}
            style={{ overflow: "hidden" }}
          >
            <CardContent>
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <TemplateGrid
                  limit={hasActiveGoals ? 6 : 9} // Show more if no active goals
                  showMore={true}
                  onUseTemplate={handleUseTemplate}
                />
              </motion.div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
