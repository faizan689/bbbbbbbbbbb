import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, TrendingUp } from "lucide-react";
import { type Property } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { toast } = useToast();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "residential":
        return "bg-secondary/10 text-secondary";
      case "commercial":
        return "bg-accent/10 text-accent";
      case "industrial":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";
    }
  };

  const tokenProgress = property.totalTokens > 0 
    ? ((property.totalTokens - property.availableTokens) / property.totalTokens) * 100 
    : 0;

  const handleInvest = () => {
    toast({
      title: "Investment Initiated",
      description: `Mock: Starting investment process for ${property.title}. This would open an investment dialog.`,
    });
  };

  return (
    <div className="property-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <img 
        src={property.imageUrl} 
        alt={property.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">
            {property.title}
          </h3>
          <Badge className={getPropertyTypeColor(property.propertyType)}>
            {property.propertyType}
          </Badge>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
          {property.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(property.totalValue)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Expected ROI</div>
            <div className="text-lg font-semibold text-secondary flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {property.expectedROI}%
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Tokens Available</span>
            <span className="text-gray-900 dark:text-white">
              {property.availableTokens.toLocaleString()} / {property.totalTokens.toLocaleString()}
            </span>
          </div>
          <Progress value={tokenProgress} className="h-2" />
        </div>
        
        <Button 
          onClick={handleInvest}
          className="w-full bg-primary hover:bg-primary/90"
          disabled={property.availableTokens === 0}
        >
          {property.availableTokens === 0 
            ? "Fully Funded" 
            : `Invest Now - Min ${formatCurrency(property.minInvestment)}`
          }
        </Button>
      </div>
    </div>
  );
}
