import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function SupabaseRealTime() {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to property changes
    const propertyChannel = supabase
      .channel('property-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        (payload) => {
          console.log('Property changed:', payload);
          // Invalidate property queries
          queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
          
          toast({
            title: "Property Updated",
            description: `Property data has been updated in real-time`,
          });
        }
      )
      .subscribe();

    // Subscribe to investment changes
    const investmentChannel = supabase
      .channel('investment-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investments' },
        (payload) => {
          console.log('Investment changed:', payload);
          // Invalidate investment and dashboard queries
          queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
          
          toast({
            title: "Investment Updated",
            description: `Your portfolio has been updated in real-time`,
          });
        }
      )
      .subscribe();

    // Subscribe to transaction changes
    const transactionChannel = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Transaction changed:', payload);
          // Invalidate transaction queries
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
          
          toast({
            title: "New Transaction",
            description: `A new transaction has been recorded`,
          });
        }
      )
      .subscribe();

    // Subscribe to proposal changes
    const proposalChannel = supabase
      .channel('proposal-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        (payload) => {
          console.log('Proposal changed:', payload);
          // Invalidate proposal queries
          queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
          
          toast({
            title: "Proposal Updated",
            description: `A governance proposal has been updated`,
          });
        }
      )
      .subscribe();

    // Check connection status
    const checkConnection = () => {
      const status = supabase.channel('connection-check').subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          toast({
            title: "Real-time Connected",
            description: "Live updates are now active",
          });
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          toast({
            title: "Connection Error",
            description: "Real-time updates are temporarily unavailable",
            variant: "destructive",
          });
        }
      });
    };

    checkConnection();

    // Cleanup function
    return () => {
      propertyChannel.unsubscribe();
      investmentChannel.unsubscribe();
      transactionChannel.unsubscribe();
      proposalChannel.unsubscribe();
    };
  }, [toast]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        px-3 py-2 rounded-lg text-sm font-medium
        ${isConnected 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-500 text-white'
        }
      `}>
        {isConnected ? '🟢 Live' : '🔴 Offline'}
      </div>
    </div>
  );
}