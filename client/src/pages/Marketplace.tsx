import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PropertyCard from "@/components/PropertyCard";
import { type Property } from "@shared/schema";
import { Search } from "lucide-react";

export default function Marketplace() {
  const [filters, setFilters] = useState({
    location: "",
    propertyType: "",
    expectedROI: "",
    investmentRange: "",
    search: ""
  });

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const filteredProperties = properties.filter(property => {
    if (filters.location && filters.location !== "all" && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.propertyType && filters.propertyType !== "all" && property.propertyType !== filters.propertyType) {
      return false;
    }
    if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.expectedROI && filters.expectedROI !== "all") {
      const roi = parseFloat(property.expectedROI);
      switch (filters.expectedROI) {
        case "8-12":
          if (roi < 8 || roi > 12) return false;
          break;
        case "12-16":
          if (roi < 12 || roi > 16) return false;
          break;
        case "16+":
          if (roi < 16) return false;
          break;
      }
    }
    if (filters.investmentRange && filters.investmentRange !== "all") {
      const minInvestment = parseFloat(property.minInvestment);
      switch (filters.investmentRange) {
        case "100-1000":
          if (minInvestment < 100 || minInvestment > 1000) return false;
          break;
        case "1000-10000":
          if (minInvestment < 1000 || minInvestment > 10000) return false;
          break;
        case "10000+":
          if (minInvestment < 10000) return false;
          break;
      }
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Property Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse tokenized real estate properties and start building your portfolio
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search properties..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Location</Label>
                <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="California">California</SelectItem>
                    <SelectItem value="Florida">Florida</SelectItem>
                    <SelectItem value="Texas">Texas</SelectItem>
                    <SelectItem value="Illinois">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Property Type</Label>
                <Select value={filters.propertyType} onValueChange={(value) => setFilters({...filters, propertyType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Expected ROI</Label>
                <Select value={filters.expectedROI} onValueChange={(value) => setFilters({...filters, expectedROI: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any ROI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any ROI</SelectItem>
                    <SelectItem value="8-12">8-12%</SelectItem>
                    <SelectItem value="12-16">12-16%</SelectItem>
                    <SelectItem value="16+">16%+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Min Investment</Label>
                <Select value={filters.investmentRange} onValueChange={(value) => setFilters({...filters, investmentRange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Amount</SelectItem>
                    <SelectItem value="100-1000">$100 - $1,000</SelectItem>
                    <SelectItem value="1000-10000">$1,000 - $10,000</SelectItem>
                    <SelectItem value="10000+">$10,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Property Grid */}
        {filteredProperties.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No properties match your current filters. Try adjusting your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
