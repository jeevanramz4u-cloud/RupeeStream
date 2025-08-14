import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ModeIndicator() {
  // Detect mode from environment or API response
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
  
  return (
    <div className="mb-4">
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center gap-2">
          <span className="text-blue-800">Platform Mode:</span>
          <Badge variant={isDevelopment ? "secondary" : "default"}>
            {isDevelopment ? "Development" : "Production"}
          </Badge>
          {isDevelopment && (
            <span className="text-sm text-blue-600">
              Using sample data - database not required
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}