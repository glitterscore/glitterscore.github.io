import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Key, 
  Plus, 
  Trash2,
  Copy,
  Users,
  Award,
  Loader2,
  CreditCard,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface InviteCode {
  id: string;
  code: string;
  uses_left: number;
  max_uses: number;
  created_at: string;
  used_at: string | null;
}

interface PaymentLog {
  id: string;
  user_id: string;
  discord_username: string | null;
  amount: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export const AdminPanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newCodeUses, setNewCodeUses] = useState('1');
  const [generatingCode, setGeneratingCode] = useState(false);

  // Fetch invite codes
  const { data: inviteCodes, isLoading: codesLoading } = useQuery({
    queryKey: ['admin_invite_codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as InviteCode[];
    },
  });

  // Fetch payment logs
  const { data: paymentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin_payment_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as PaymentLog[];
    },
  });

  // Generate new invite code
  const generateCode = async () => {
    setGeneratingCode(true);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      const { error } = await supabase.from('invite_codes').insert({
        code,
        uses_left: parseInt(newCodeUses),
        max_uses: parseInt(newCodeUses),
        created_by: user?.id,
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin_invite_codes'] });
      toast.success('Invite code generated!');
      navigator.clipboard.writeText(code);
      toast.info('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to generate code');
    }
    setGeneratingCode(false);
  };

  // Delete invite code
  const deleteCode = async (id: string) => {
    try {
      const { error } = await supabase.from('invite_codes').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin_invite_codes'] });
      toast.success('Code deleted');
    } catch (error) {
      toast.error('Failed to delete code');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <div className="space-y-6">
      {/* Invite Codes */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Invite Codes</h2>
        </div>

        {/* Generate New Code */}
        <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <Label>Number of Uses</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={newCodeUses}
              onChange={(e) => setNewCodeUses(e.target.value)}
              className="input-cyber w-32"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={generateCode} disabled={generatingCode} variant="neon-pink">
              {generatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate Code
            </Button>
          </div>
        </div>

        {/* Codes List */}
        {codesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {inviteCodes?.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <code className="font-mono text-primary bg-primary/10 px-3 py-1 rounded">
                    {code.code}
                  </code>
                  <span className={`text-sm ${code.uses_left > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {code.uses_left}/{code.max_uses} uses left
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyCode(code.code)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCode(code.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {inviteCodes?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No invite codes yet</p>
            )}
          </div>
        )}
      </div>

      {/* Payment Logs */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Payment Logs</h2>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : paymentLogs?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No payment logs yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {paymentLogs?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{log.discord_username || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.amount ? `$${log.amount}` : 'Amount not set'} • {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    log.status === 'confirmed' 
                      ? 'bg-green-500/20 text-green-500' 
                      : log.status === 'rejected'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass p-6 rounded-xl text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{inviteCodes?.filter(c => c.uses_left < c.max_uses).length || 0}</p>
          <p className="text-sm text-muted-foreground">Codes Used</p>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <Key className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{inviteCodes?.filter(c => c.uses_left > 0).length || 0}</p>
          <p className="text-sm text-muted-foreground">Active Codes</p>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <Award className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{paymentLogs?.filter(l => l.status === 'confirmed').length || 0}</p>
          <p className="text-sm text-muted-foreground">Confirmed Payments</p>
        </div>
      </div>
    </div>
  );
};
