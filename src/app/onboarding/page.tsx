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

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [shareSlug, setShareSlug] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidBirthday, setKidBirthday] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Generate slug from family name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleFamilyNameChange = (value: string) => {
    setFamilyName(value);
    setShareSlug(generateSlug(value));
  };

  const handleCreateFamily = async () => {
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if slug is available
      const { data: existing } = await supabase
        .from('family_settings')
        .select('id')
        .eq('share_slug', shareSlug)
        .single();

      if (existing) {
        setError('This family URL is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      // Create family settings
      const { error: familyError } = await supabase
        .from('family_settings')
        .insert({
          user_id: user.id,
          family_name: familyName,
          share_slug: shareSlug,
          is_public: true,
        });

      if (familyError) throw familyError;

      setStep(2);
    } catch (error: any) {
      setError(error.message || 'Failed to create family');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKid = async () => {
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
        name: kidName,
        birthday: kidBirthday || null,
      });

      if (kidError) throw kidError;

      // Auto-create birthday holidays
      if (kidBirthday) {
        const currentYear = new Date().getFullYear();
        await supabase.from('holidays').insert([
          {
            parent_user_id: user.id,
            name: `${kidName}'s Birthday`,
            date: kidBirthday.replace(/^\d{4}/, currentYear.toString()),
            recurring: true,
            icon: '🎂',
          },
        ]);
      }

      // Auto-create Christmas holidays
      await supabase.from('holidays').insert([
        {
          parent_user_id: user.id,
          name: 'Christmas 2025',
          date: '2025-12-25',
          recurring: false,
          icon: '🎄',
        },
      ]);

      setStep(3);
    } catch (error: any) {
      setError(error.message || 'Failed to add kid');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              step >= 1 ? 'bg-coral-500' : 'bg-gray-300'
            }`}
          />
          <div className="w-12 h-0.5 bg-gray-300" />
          <div
            className={`w-3 h-3 rounded-full ${
              step >= 2 ? 'bg-coral-500' : 'bg-gray-300'
            }`}
          />
          <div className="w-12 h-0.5 bg-gray-300" />
          <div
            className={`w-3 h-3 rounded-full ${
              step >= 3 ? 'bg-coral-500' : 'bg-gray-300'
            }`}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Family</span>
          <span>First Kid</span>
          <span>Done!</span>
        </div>
      </div>

      {/* Step 1: Create Family */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Let's Create Your Family</CardTitle>
            <CardDescription>
              Choose a name for your family. This will be used in your shareable
              link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                placeholder="The Smith Family"
                value={familyName}
                onChange={(e) => handleFamilyNameChange(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareSlug">Your Family URL</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">elowish.com/</span>
                <Input
                  id="shareSlug"
                  value={shareSlug}
                  onChange={(e) => setShareSlug(e.target.value)}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">
                This is the link you'll share with family and friends
              </p>
            </div>

            <Button
              onClick={handleCreateFamily}
              disabled={!familyName || !shareSlug || loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add First Kid */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Your First Kid</CardTitle>
            <CardDescription>
              Let's start building a gift list! Who are we creating this for?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="kidName">Child's Name</Label>
              <Input
                id="kidName"
                placeholder="Emma"
                value={kidName}
                onChange={(e) => setKidName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kidBirthday">Birthday (Optional)</Label>
              <Input
                id="kidBirthday"
                type="date"
                value={kidBirthday}
                onChange={(e) => setKidBirthday(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                We'll automatically create birthday gift lists!
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleAddKid}
                disabled={!kidName || loading}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🎉 You're All Set!</CardTitle>
            <CardDescription className="text-center">
              Your family dashboard is ready. Let's start adding gift ideas!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
              <p className="text-sm text-teal-800">
                <strong>Your family link:</strong>
                <br />
                elowish.com/{shareSlug}
              </p>
              <p className="text-xs text-teal-600 mt-2">
                Share this link with family and friends so they can see {kidName}
                's gift list!
              </p>
            </div>

            <Button onClick={handleFinish} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}