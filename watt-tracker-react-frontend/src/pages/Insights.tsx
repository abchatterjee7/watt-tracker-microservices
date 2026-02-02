import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import { insightApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface InsightData {
  userId: number;
  tips: string;
  energyUsage: number;
}

const Insights = () => {
  const { user } = useAuth();
  const [savingTips, setSavingTips] = useState<InsightData | null>(null);
  const [overview, setOverview] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use non-streaming APIs for now to test
      const [tipsData, overviewData] = await Promise.all([
        insightApi.getSavingTips(user.id),
        insightApi.getOverview(user.id)
      ]);
      
      setSavingTips(tipsData);
      setOverview(overviewData);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to load insights:', error);
      
      // Provide fallback data when API fails
      const fallbackData = {
        userId: user?.id || 1,
        tips: "AI service is currently taking longer than expected. Here are some general energy-saving tips:\n\n1. Turn off lights when not in use\n2. Use LED bulbs instead of incandescent\n3. Adjust your thermostat by 1-2 degrees\n4. Unplug devices when not in use\n5. Use power strips for electronics",
        energyUsage: 0
      };
      
      setSavingTips(fallbackData);
      setOverview(fallbackData);
      setError('AI service is responding slowly. Showing general tips.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't load automatically - only on button click
    setLoading(false);
  }, [user]);

  const formatEnergyUsage = (usage: number) => {
    return `${usage.toFixed(2)} kWh`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Insights</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadInsights}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Energy Insights
              </h1>
              <p className="text-gray-600 mt-2">AI-powered energy saving tips and analysis</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600 font-medium">Click "Generate Insights" to get AI tips</span>
              </div>
            </div>
            <button
              onClick={loadInsights}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Insights
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatEnergyUsage(savingTips?.energyUsage || 0)}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Current Usage</h3>
            <p className="text-sm text-gray-600 mt-1">Your energy consumption for today</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                -12%
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Savings Potential</h3>
            <p className="text-sm text-gray-600 mt-1">Estimated monthly savings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                AI
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Tips</h3>
            <p className="text-sm text-gray-600 mt-1">Personalized recommendations</p>
          </div>
        </div>

        {/* Energy Overview Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Energy Overview</h2>
          </div>
          {overview && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatEnergyUsage(overview.energyUsage)}
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {overview?.tips}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Energy Saving Tips Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Energy Saving Tips</h2>
          </div>
          {savingTips && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-2xl font-bold text-gray-900 mb-4">
                  {formatEnergyUsage(savingTips.energyUsage)}
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {savingTips?.tips}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Info Card */}
        <div className="bg-gray-900 rounded-xl shadow-sm p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h3 className="text-2xl font-bold">Powered by AI</h3>
          </div>
          <div className="space-y-3">
            <p className="text-lg leading-relaxed text-gray-300">
              These insights are generated using <strong className="text-yellow-400">Llama 3.2</strong> running locally via Ollama.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI-powered recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
