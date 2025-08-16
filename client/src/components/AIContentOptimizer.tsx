import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Zap, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TaskOptimization {
  optimizedTitle: string;
  optimizedDescription: string;
  optimizedRequirements: string;
  seoKeywords: string[];
  engagementTips: string[];
}

interface AIContentOptimizerProps {
  title: string;
  description: string;
  requirements: string;
  onOptimization?: (optimization: TaskOptimization) => void;
  disabled?: boolean;
}

export default function AIContentOptimizer({ 
  title, 
  description, 
  requirements,
  onOptimization,
  disabled = false 
}: AIContentOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<TaskOptimization | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const optimizeContent = async () => {
    if (!title.trim() || !description.trim() || !requirements.trim()) {
      toast({
        title: "Input Required",
        description: "Please fill in title, description, and requirements before optimizing",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await apiRequest("POST", "/api/admin/ai/optimize-content", {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim()
      });
      
      const data = await response.json();
      setOptimization(data);
      setShowComparison(true);
      
      toast({
        title: "Content Optimized",
        description: `Generated optimized content with ${data.seoKeywords?.length || 0} SEO keywords and ${data.engagementTips?.length || 0} engagement tips`,
      });
      
      if (onOptimization) {
        onOptimization(data);
      }
    } catch (error) {
      
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyOptimization = () => {
    if (optimization && onOptimization) {
      onOptimization(optimization);
      toast({
        title: "Optimization Applied",
        description: "The optimized content has been applied to your task",
      });
    }
  };

  const canOptimize = !disabled && title.trim() && description.trim() && requirements.trim() && !isOptimizing;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            AI Content Optimizer
          </CardTitle>
          <CardDescription>
            Enhance your task content for better engagement, clarity, and SEO performance
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Button
            onClick={optimizeContent}
            disabled={!canOptimize}
            className="w-full"
            data-testid="button-optimize-content"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Content with AI
              </>
            )}
          </Button>

          {/* Input Requirement Message */}
          {(!title.trim() || !description.trim() || !requirements.trim()) && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Fill in all task fields above to enable AI content optimization
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimization && showComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Optimized Content
            </CardTitle>
            <CardDescription>
              AI-enhanced content with improved engagement and SEO
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Before/After Comparison */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Original Title */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Original Title</h4>
                  <div className="p-3 border rounded-md bg-red-50">
                    <p className="text-sm">{title}</p>
                  </div>
                </div>
                
                {/* Optimized Title */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700">Optimized Title</h4>
                  <div className="p-3 border rounded-md bg-green-50">
                    <p className="text-sm font-medium">{optimization.optimizedTitle}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Original Description */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Original Description</h4>
                  <div className="p-3 border rounded-md bg-red-50">
                    <Textarea 
                      value={description} 
                      readOnly 
                      className="min-h-[100px] bg-transparent border-none p-0 resize-none"
                    />
                  </div>
                </div>
                
                {/* Optimized Description */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700">Optimized Description</h4>
                  <div className="p-3 border rounded-md bg-green-50">
                    <Textarea 
                      value={optimization.optimizedDescription} 
                      readOnly 
                      className="min-h-[100px] bg-transparent border-none p-0 resize-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Original Requirements */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Original Requirements</h4>
                  <div className="p-3 border rounded-md bg-red-50">
                    <Textarea 
                      value={requirements} 
                      readOnly 
                      className="min-h-[80px] bg-transparent border-none p-0 resize-none"
                    />
                  </div>
                </div>
                
                {/* Optimized Requirements */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700">Optimized Requirements</h4>
                  <div className="p-3 border rounded-md bg-green-50">
                    <Textarea 
                      value={optimization.optimizedRequirements} 
                      readOnly 
                      className="min-h-[80px] bg-transparent border-none p-0 resize-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Keywords */}
            {optimization.seoKeywords && optimization.seoKeywords.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  SEO Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {optimization.seoKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Tips */}
            {optimization.engagementTips && optimization.engagementTips.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Engagement Tips
                </h4>
                <ul className="space-y-1">
                  {optimization.engagementTips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply Button */}
            <Button
              onClick={applyOptimization}
              className="w-full"
              data-testid="button-apply-optimization"
            >
              <Target className="mr-2 h-4 w-4" />
              Apply Optimized Content
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}