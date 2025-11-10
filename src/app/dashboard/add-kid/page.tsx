'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AddKidPage() {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAddKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create kid
      const { error: kidError } = await supabase.from('kids').insert({
        parent_user_id: user.id,
        name,
        birthday: birthday || null,
      });

      if (kidError) throw kidError;

      // Auto-create birthday holiday if birthday provided
      if (birthday) {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        
        await supabase.from('holidays').insert([
          {
            parent_user_id: user.id,
            name: `${name}'s Birthday`,
            date: birthday.replace(/^\d{4}/, currentYear.toString()),
            recurring: true,
            icon: '🎂',
          },
          {
            parent_user_id: user.id,
            name: `${name}'s Birthday`,
            date: birthday.replace(/^\d{4}/, nextYear.toString()),
            recurring: true,
            icon: '🎂',
          },
        ]);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to add kid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add a Kid</CardTitle>
          <CardDescription>
            Add another child to start building their gift list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddKid} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Child's Name</Label>
              <Input
                id="name"
                placeholder="Emma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday (Optional)</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-600">
                We'll automatically create birthday gift lists!
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name || loading}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Kid'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}