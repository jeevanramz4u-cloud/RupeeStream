import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  estimatedReward: number;
  estimatedTimeLimit: number;
}

interface AISmartCategorizationProps {
  title: string;
  description: string;
  onCategorySuggestion?: (suggestion: CategorySuggestion) => void;
  disabled?: boolean;
}

const categoryLabels = {
  app_download: "App Download",
  business_review: "Business Review", 
  product_review: "Product Review",
  channel_subscribe: "Channel Subscribe",
  comment_like: "Comments & Likes",
  youtube_video_see: "YouTube Video See Task"
};

const categoryIcons = {
  app_download: "📱",
  business_review: "⭐",
  product_review: "🛍️",
  channel_subscribe: "▶️",
  comment_like: "👍"
};

export default function AISmartCategorization({ 
  title, 
  description, 
  onCategorySuggestion,
  disabled = false 
}: AISmartCategorizationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null);
  const { toast } = useToast();

  const analyzeTask = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter both title and description before analyzing",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/admin/ai/suggest-category", {
        title: title.trim(),
        description: description.trim()
      });
      
      const data = await response.json();
      setSuggestion(data);
      
      toast({
        title: "Analysis Complete",
        description: `AI suggests "${categoryLabels[data.category as keyof typeof categoryLabels]}" category with ${(data.confidence * 100).toFixed(0)}% confidence`,
      });
      
      if (onCategorySuggestion) {
        onCategorySuggestion(data);
      }
    } catch (error) {
      console.error("Error analyzing task category:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze task category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  const canAnalyze = !disabled && title.trim() && description.trim() && !isAnalyzing;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Smart Categorization
        </CardTitle>
        <CardDescription>
          Let AI analyze your task content and suggest the most appropriate category
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Analyze Button */}
        <Button
          onClick={analyzeTask}
          disabled={!canAnalyze}
          className="w-full"
          variant={suggestion ? "outline" : "default"}
          data-testid="button-analyze-category"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Task...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {suggestion ? "Re-analyze Category" : "Analyze Category"}
            </>
          )}
        </Button>

        {/* Analysis Result */}
        {suggestion && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {categoryIcons[suggestion.category as keyof typeof categoryIcons]}
                </span>
                <div>
                  <h4 className="font-semibold">
                    {categoryLabels[suggestion.category as keyof typeof categoryLabels]}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Suggested reward: ₹{suggestion.estimatedReward} • Time: {suggestion.estimatedTimeLimit}min
                  </p>
                </div>
              </div>
              <Badge className={getConfidenceColor(suggestion.confidence)}>
                {getConfidenceLabel(suggestion.confidence)} ({(suggestion.confidence * 100).toFixed(0)}%)
              </Badge>
            </div>

            <div>
              <h5 className="font-medium text-sm mb-1">AI Reasoning:</h5>
              <p className="text-sm text-muted-foreground italic">
                {suggestion.reasoning}
              </p>
            </div>

            {suggestion.confidence < 0.6 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Low Confidence Warning</p>
                  <p className="text-yellow-700">
                    The AI is not very confident about this categorization. Please review the suggested category carefully.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Requirement Message */}
        {(!title.trim() || !description.trim()) && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Enter task title and description above to enable AI categorization
          </div>
        )}
      </CardContent>
    </Card>
  );
}