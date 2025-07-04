import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown, FileText, Building2, DollarSign, Calendar, TrendingUp, CheckCircle, RefreshCw, Eye } from "lucide-react";
import { type Proposal, type Property } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useICPWallet } from "@/components/ICPWalletProvider";

export default function Governance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { wallet, voteOnProposal } = useICPWallet();
  const [votingProposal, setVotingProposal] = useState<number | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
    refetchInterval: 20000, // Refresh every 20 seconds for real-time data
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    refetchInterval: 30000,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, voteType, votingPower }: { proposalId: number; voteType: 'for' | 'against'; votingPower: number }) => {
      if (!wallet.isConnected) {
        throw new Error("Wallet not connected");
      }

      // Create vote in database
      const response = await fetch('/api/votes', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          proposalId,
          voteType,
          votingPower
        })
      });

      if (!response.ok) {
        throw new Error("Failed to record vote");
      }

      // Use ICP wallet to vote on blockchain
      await voteOnProposal(proposalId, voteType);

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
      toast({
        title: "Vote Submitted Successfully!",
        description: "Your vote has been recorded on the ICP blockchain.",
      });
      setVotingProposal(null);
    },
    onError: (error: any) => {
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
      setVotingProposal(null);
    }
  });

  const handleVote = (proposalId: number, voteType: "for" | "against") => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your ICP wallet to vote on proposals.",
        variant: "destructive",
      });
      return;
    }

    // Calculate voting power based on user's real token balance
    const votingPower = wallet.balance || 1000;
    
    setVotingProposal(proposalId);
    voteMutation.mutate({ proposalId, voteType, votingPower });
  };

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
    queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    
    toast({
      title: "Data Refreshed",
      description: "Governance data has been updated with latest information.",
    });
  };

  const getPropertyTitle = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.title || "Unknown Property";
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent text-accent-foreground">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return `Ends in ${diffDays} days`;
    if (diffDays === 1) return "Ends in 1 day";
    if (diffDays === 0) return "Ends today";
    return "Ended";
  };

  const activeProposals = proposals.filter(p => p.status === "active");
  const completedProposals = proposals.filter(p => p.status === "completed");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Governance & Voting
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Participate in property decisions and platform governance
          </p>
        </div>

        {/* Active Proposals */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Proposals</h2>
          <div className="space-y-6">
            {activeProposals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No active proposals at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeProposals.map((proposal) => {
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const votingProgress = proposal.totalVotingPower > 0 ? (totalVotes / proposal.totalVotingPower) * 100 : 0;
                const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
                const userVotingPower = proposal.id === 1 ? 1247 : 800; // Mock user voting power

                return (
                  <Card key={proposal.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getStatusBadge(proposal.status)}
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                              {getTimeRemaining(proposal.endDate)}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {proposal.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {proposal.description}
                          </p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {getPropertyTitle(proposal.propertyId)}
                            </span>
                            {proposal.investmentAmount && (
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Investment: {formatCurrency(proposal.investmentAmount)}
                              </span>
                            )}
                            {proposal.expectedROI && (
                              <span className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Expected ROI: {proposal.expectedROI}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-6 text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {userVotingPower.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Your Voting Power</div>
                        </div>
                      </div>
                      
                      {/* Voting Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-300">Voting Progress</span>
                          <span className="text-gray-900 dark:text-white">
                            {totalVotes.toLocaleString()} / {proposal.totalVotingPower.toLocaleString()} tokens voted
                          </span>
                        </div>
                        <Progress value={votingProgress} className="h-3 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                            <span className="text-secondary font-medium">For</span>
                            <span className="text-secondary font-bold">
                              {proposal.votesFor.toLocaleString()} ({forPercentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                            <span className="text-destructive font-medium">Against</span>
                            <span className="text-destructive font-bold">
                              {proposal.votesAgainst.toLocaleString()} ({againstPercentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Voting Buttons */}
                      <div className="flex space-x-4">
                        <Button 
                          className="flex-1 bg-secondary hover:bg-secondary/90"
                          onClick={() => handleVote(proposal.id, "for")}
                          disabled={votingProposal === proposal.id}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {votingProposal === proposal.id ? "Voting..." : "Vote For"}
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleVote(proposal.id, "against")}
                          disabled={votingProposal === proposal.id}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          {votingProposal === proposal.id ? "Voting..." : "Vote Against"}
                        </Button>
                        <Button variant="outline" className="px-6">
                          <FileText className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Past Proposals */}
        {completedProposals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Past Proposals</h2>
            <div className="space-y-6">
              {completedProposals.map((proposal) => {
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                const wasApproved = forPercentage > 50;

                return (
                  <Card key={proposal.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getStatusBadge(proposal.status)}
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                              {getTimeRemaining(proposal.endDate)}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {proposal.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {proposal.description}
                          </p>
                        </div>
                        <div className="ml-6">
                          <Badge className={wasApproved ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {wasApproved ? "Approved" : "Rejected"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
