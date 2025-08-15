import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Brain, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TaskSuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  suggestedTitle?: string;
  suggestedDescription?: string;
  estimatedReward: number;
  estimatedTimeLimit: number;
}

interface AITaskSuggestionsProps {
  onTaskSuggestionSelect?: (suggestion: TaskSuggestion) => void;
}

const categoryLabels = {
  app_download: "App Download",
  business_review: "Business Review", 
  product_review: "Product Review",
  channel_subscribe: "Channel Subscribe",
  comment_like: "Comments & Likes",
  youtube_video_see: "YouTube Video View"
};

const categoryIcons = {
  app_download: "📱",
  business_review: "⭐",
  product_review: "🛍️",
  channel_subscribe: "▶️",
  comment_like: "👍",
  youtube_video_see: "👁️"
};

export default function AITaskSuggestions({ onTaskSuggestionSelect }: AITaskSuggestionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();

  const generateSuggestions = async (targetCategory?: string) => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/admin/ai/generate-suggestions", {
        targetCategory
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      
      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${data.suggestions?.length || 0} task suggestions`,
      });
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI task suggestions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Task Suggestions
          </CardTitle>
          <CardDescription>
            Generate intelligent task suggestions based on platform trends and user engagement patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
              data-testid="filter-all-categories"
            >
              All Categories
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                data-testid={`filter-category-${key}`}
              >
                {categoryIcons[key as keyof typeof categoryIcons]} {label}
              </Button>
            ))}
          </div>

          {/* Generate Button */}
          <Button
            onClick={() => generateSuggestions(selectedCategory || undefined)}
            disabled={isGenerating}
            className="w-full"
            data-testid="button-generate-suggestions"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating AI Suggestions...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Task Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Suggestions Display */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Suggested Tasks ({suggestions.length})
          </h3>
          
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {categoryIcons[suggestion.category as keyof typeof categoryIcons]}
                    </span>
                    <div>
                      <CardTitle className="text-lg">
                        {suggestion.suggestedTitle || "AI-Generated Task"}
                      </CardTitle>
                      <CardDescription>
                        {categoryLabels[suggestion.category as keyof typeof categoryLabels]}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getConfidenceColor(suggestion.confidence)}>
                      {getConfidenceLabel(suggestion.confidence)} ({(suggestion.confidence * 100).toFixed(0)}%)
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      ₹{suggestion.estimatedReward} • {suggestion.estimatedTimeLimit}min
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {suggestion.suggestedDescription && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description:</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.suggestedDescription}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-sm mb-1">AI Reasoning:</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {suggestion.reasoning}
                  </p>
                </div>

                {onTaskSuggestionSelect && (
                  <Button
                    onClick={() => onTaskSuggestionSelect(suggestion)}
                    size="sm"
                    className="w-full mt-3"
                    data-testid={`button-use-suggestion-${index}`}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Use This Suggestion
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !isGenerating && (
        <Card className="text-center py-8">
          <CardContent>
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Click "Generate Task Suggestions" to get AI-powered task recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}