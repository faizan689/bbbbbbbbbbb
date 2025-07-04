import AIRecommendations from "@/components/AIRecommendations";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Property Recommendations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover personalized property investment opportunities powered by artificial intelligence
        </p>
      </div>
      
      <AIRecommendations />
    </div>
  );
}