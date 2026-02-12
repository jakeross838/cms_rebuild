# RossOS User Onboarding System

> Comprehensive guide for user onboarding, product tours, help system, and tutorials.

## Table of Contents

1. [Onboarding Architecture](#onboarding-architecture)
2. [Setup Wizard](#setup-wizard)
3. [Product Tours](#product-tours)
4. [Contextual Help](#contextual-help)
5. [In-App Tutorials](#in-app-tutorials)
6. [Progress Tracking](#progress-tracking)
7. [Feature Discovery](#feature-discovery)
8. [Help Center Integration](#help-center-integration)

---

## Onboarding Architecture

### Database Schema

```sql
-- User onboarding progress
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Setup wizard
  setup_completed BOOLEAN DEFAULT false,
  setup_started_at TIMESTAMPTZ,
  setup_completed_at TIMESTAMPTZ,
  setup_step INTEGER DEFAULT 1,
  setup_data JSONB DEFAULT '{}',

  -- Tours completed
  tours_completed TEXT[] DEFAULT '{}',
  tours_skipped TEXT[] DEFAULT '{}',

  -- Feature discovery
  features_discovered TEXT[] DEFAULT '{}',
  features_dismissed TEXT[] DEFAULT '{}',

  -- Help interactions
  help_articles_viewed TEXT[] DEFAULT '{}',
  tutorials_completed TEXT[] DEFAULT '{}',

  -- Preferences
  show_tooltips BOOLEAN DEFAULT true,
  show_hints BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Company onboarding checklist
CREATE TABLE company_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Checklist items
  profile_completed BOOLEAN DEFAULT false,
  logo_uploaded BOOLEAN DEFAULT false,
  team_invited BOOLEAN DEFAULT false,
  first_client_added BOOLEAN DEFAULT false,
  first_job_created BOOLEAN DEFAULT false,
  integrations_setup BOOLEAN DEFAULT false,
  billing_configured BOOLEAN DEFAULT false,

  -- Progress
  completion_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,

  -- Metadata
  skipped_items TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id)
);

-- Onboarding events for analytics
CREATE TABLE onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  event_type VARCHAR(50) NOT NULL, -- 'step_completed', 'tour_started', 'help_viewed', etc.
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_onboarding" ON user_onboarding
  USING (user_id = auth.uid());

CREATE POLICY "company_onboarding" ON company_onboarding
  USING (company_id = get_current_company_id());

CREATE POLICY "company_events" ON onboarding_events
  USING (company_id = get_current_company_id());
```

### Onboarding Context Provider

```typescript
// src/contexts/OnboardingContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OnboardingState {
  setupCompleted: boolean;
  setupStep: number;
  toursCompleted: string[];
  featuresDiscovered: string[];
  showTooltips: boolean;
  showHints: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  loading: boolean;

  // Setup wizard
  completeSetupStep: (step: number, data?: any) => Promise<void>;
  skipSetup: () => Promise<void>;

  // Tours
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => Promise<void>;
  skipTour: (tourId: string) => Promise<void>;
  isTourCompleted: (tourId: string) => boolean;

  // Features
  discoverFeature: (featureId: string) => Promise<void>;
  dismissFeature: (featureId: string) => Promise<void>;
  isFeatureDiscovered: (featureId: string) => boolean;

  // Preferences
  toggleTooltips: (show: boolean) => Promise<void>;
  toggleHints: (show: boolean) => Promise<void>;

  // Analytics
  trackEvent: (type: string, name: string, data?: any) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    setupCompleted: true,
    setupStep: 1,
    toursCompleted: [],
    featuresDiscovered: [],
    showTooltips: true,
    showHints: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  async function loadOnboardingState() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setState({
        setupCompleted: data.setup_completed,
        setupStep: data.setup_step,
        toursCompleted: data.tours_completed || [],
        featuresDiscovered: data.features_discovered || [],
        showTooltips: data.show_tooltips,
        showHints: data.show_hints,
      });
    }

    setLoading(false);
  }

  async function updateOnboarding(updates: Partial<OnboardingState>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from('user_onboarding')
      .upsert({
        user_id: user.id,
        setup_completed: updates.setupCompleted ?? state.setupCompleted,
        setup_step: updates.setupStep ?? state.setupStep,
        tours_completed: updates.toursCompleted ?? state.toursCompleted,
        features_discovered: updates.featuresDiscovered ?? state.featuresDiscovered,
        show_tooltips: updates.showTooltips ?? state.showTooltips,
        show_hints: updates.showHints ?? state.showHints,
        updated_at: new Date().toISOString(),
      });

    setState({ ...state, ...updates });
  }

  async function completeSetupStep(step: number, data?: any) {
    await updateOnboarding({
      setupStep: step + 1,
      setupCompleted: step >= 5, // 5 steps total
    });

    await trackEvent('step_completed', `setup_step_${step}`, data);
  }

  async function skipSetup() {
    await updateOnboarding({ setupCompleted: true });
    await trackEvent('setup_skipped', 'setup_wizard');
  }

  function startTour(tourId: string) {
    trackEvent('tour_started', tourId);
  }

  async function completeTour(tourId: string) {
    const toursCompleted = [...state.toursCompleted, tourId];
    await updateOnboarding({ toursCompleted });
    await trackEvent('tour_completed', tourId);
  }

  async function skipTour(tourId: string) {
    await trackEvent('tour_skipped', tourId);
  }

  function isTourCompleted(tourId: string) {
    return state.toursCompleted.includes(tourId);
  }

  async function discoverFeature(featureId: string) {
    if (state.featuresDiscovered.includes(featureId)) return;

    const featuresDiscovered = [...state.featuresDiscovered, featureId];
    await updateOnboarding({ featuresDiscovered });
    await trackEvent('feature_discovered', featureId);
  }

  async function dismissFeature(featureId: string) {
    await trackEvent('feature_dismissed', featureId);
  }

  function isFeatureDiscovered(featureId: string) {
    return state.featuresDiscovered.includes(featureId);
  }

  async function toggleTooltips(show: boolean) {
    await updateOnboarding({ showTooltips: show });
  }

  async function toggleHints(show: boolean) {
    await updateOnboarding({ showHints: show });
  }

  async function trackEvent(type: string, name: string, data?: any) {
    const supabase = createClient();

    await supabase.from('onboarding_events').insert({
      event_type: type,
      event_name: name,
      event_data: data || {},
    });
  }

  return (
    <OnboardingContext.Provider
      value={{
        state,
        loading,
        completeSetupStep,
        skipSetup,
        startTour,
        completeTour,
        skipTour,
        isTourCompleted,
        discoverFeature,
        dismissFeature,
        isFeatureDiscovered,
        toggleTooltips,
        toggleHints,
        trackEvent,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
```

---

## Setup Wizard

### Setup Wizard Component

```typescript
// src/components/onboarding/SetupWizard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { CompanyProfileStep } from './steps/CompanyProfileStep';
import { TeamInviteStep } from './steps/TeamInviteStep';
import { FirstClientStep } from './steps/FirstClientStep';
import { IntegrationsStep } from './steps/IntegrationsStep';
import { PreferencesStep } from './steps/PreferencesStep';

const steps = [
  { id: 1, title: 'Company Profile', component: CompanyProfileStep },
  { id: 2, title: 'Invite Team', component: TeamInviteStep },
  { id: 3, title: 'Add Client', component: FirstClientStep },
  { id: 4, title: 'Integrations', component: IntegrationsStep },
  { id: 5, title: 'Preferences', component: PreferencesStep },
];

export function SetupWizard() {
  const router = useRouter();
  const { state, completeSetupStep, skipSetup } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(state.setupStep);
  const [stepData, setStepData] = useState<Record<number, any>>({});

  const CurrentStepComponent = steps[currentStep - 1]?.component;
  const progress = ((currentStep - 1) / steps.length) * 100;

  const handleNext = async (data?: any) => {
    if (data) {
      setStepData({ ...stepData, [currentStep]: data });
    }

    await completeSetupStep(currentStep, data);

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard complete
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await skipSetup();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to RossOS</h1>
          <p className="text-muted-foreground">
            Let's get your account set up in just a few minutes
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-xs font-medium ${
                  step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {CurrentStepComponent && (
                <CurrentStepComponent
                  onNext={handleNext}
                  onBack={handleBack}
                  initialData={stepData[currentStep]}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <Button variant="ghost" onClick={handleSkip}>
            Skip setup and explore on your own
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Company Profile Step

```typescript
// src/components/onboarding/steps/CompanyProfileStep.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  companySize: z.string().optional(),
  specialties: z.array(z.string()).optional(),
});

interface CompanyProfileStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export function CompanyProfileStep({ onNext, onBack, initialData }: CompanyProfileStepProps) {
  const [logo, setLogo] = useState<string | null>(initialData?.logo || null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  });

  const onSubmit = (data: any) => {
    onNext({ ...data, logo });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Tell us about your company</h2>
        <p className="text-muted-foreground">
          This helps us customize your experience
        </p>
      </div>

      {/* Logo Upload */}
      <div className="flex justify-center">
        <ImageUpload
          value={logo}
          onChange={setLogo}
          label="Company Logo"
          className="w-24 h-24 rounded-lg"
        />
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          {...form.register('companyName')}
          placeholder="Acme Construction"
        />
        {form.formState.errors.companyName && (
          <p className="text-sm text-destructive">
            {form.formState.errors.companyName.message as string}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...form.register('phone')}
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Company Size */}
      <div className="space-y-2">
        <Label>Company Size</Label>
        <Select
          value={form.watch('companySize')}
          onValueChange={(value) => form.setValue('companySize', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-5">1-5 employees</SelectItem>
            <SelectItem value="6-20">6-20 employees</SelectItem>
            <SelectItem value="21-50">21-50 employees</SelectItem>
            <SelectItem value="51-100">51-100 employees</SelectItem>
            <SelectItem value="100+">100+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Types */}
      <div className="space-y-2">
        <Label>What types of projects do you work on?</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            'New Construction',
            'Renovations',
            'Additions',
            'Remodels',
            'Commercial',
            'Custom Homes',
          ].map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-accent"
            >
              <input
                type="checkbox"
                value={type}
                {...form.register('specialties')}
                className="rounded"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
```

### Team Invite Step

```typescript
// src/components/onboarding/steps/TeamInviteStep.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  email: string;
  role: string;
}

interface TeamInviteStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export function TeamInviteStep({ onNext, onBack, initialData }: TeamInviteStepProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('project_manager');
  const [invites, setInvites] = useState<TeamMember[]>(initialData?.invites || []);

  const addInvite = () => {
    if (!email) return;

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (invites.some((i) => i.email === email)) {
      toast({
        title: 'Already added',
        description: 'This email is already in the list',
        variant: 'destructive',
      });
      return;
    }

    setInvites([...invites, { email, role }]);
    setEmail('');
  };

  const removeInvite = (emailToRemove: string) => {
    setInvites(invites.filter((i) => i.email !== emailToRemove));
  };

  const handleNext = async () => {
    // Send invites if any
    if (invites.length > 0) {
      await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invites }),
      });

      toast({
        title: 'Invitations sent!',
        description: `${invites.length} team member(s) invited`,
      });
    }

    onNext({ invites });
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    project_manager: 'Project Manager',
    superintendent: 'Superintendent',
    estimator: 'Estimator',
    accountant: 'Accountant',
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Invite your team</h2>
        <p className="text-muted-foreground">
          Add team members now or skip and do it later
        </p>
      </div>

      {/* Add Member Form */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="colleague@company.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInvite())}
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={addInvite} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Invite List */}
      {invites.length > 0 && (
        <div className="space-y-2">
          <Label>Team members to invite</Label>
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.email}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{invite.email}</span>
                  <Badge variant="secondary">{roleLabels[invite.role]}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInvite(invite.email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Tips for getting your team started
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>Admins can manage all company settings and users</li>
          <li>Project Managers can create and manage jobs</li>
          <li>Superintendents focus on field operations</li>
          <li>You can always change roles later</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => onNext({ invites: [] })}>
            Skip for now
          </Button>
          <Button onClick={handleNext}>
            {invites.length > 0 ? `Send ${invites.length} Invite(s)` : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Product Tours

### Tour Engine

```typescript
// src/components/onboarding/TourEngine.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action button text
  onAction?: () => void;
}

interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
  triggerOnce?: boolean;
}

interface TourEngineProps {
  tour: Tour;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function TourEngine({ tour, onComplete, onSkip }: TourEngineProps) {
  const { startTour, completeTour, skipTour, isTourCompleted } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Check if tour should run
  useEffect(() => {
    if (tour.triggerOnce && isTourCompleted(tour.id)) {
      return;
    }

    startTour(tour.id);
    setIsVisible(true);
  }, [tour.id]);

  // Find and highlight target element
  useEffect(() => {
    if (!isVisible) return;

    const step = tour.steps[currentStep];
    const target = document.querySelector(step.target);

    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll into view if needed
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isVisible, tour.steps]);

  const handleNext = useCallback(() => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour complete
      completeTour(tour.id);
      setIsVisible(false);
      onComplete?.();
    }
  }, [currentStep, tour, completeTour, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    skipTour(tour.id);
    setIsVisible(false);
    onSkip?.();
  }, [tour.id, skipTour, onSkip]);

  if (!isVisible || !targetRect) return null;

  const step = tour.steps[currentStep];

  // Calculate tooltip position
  const placement = step.placement || 'bottom';
  const tooltipStyle = calculateTooltipPosition(targetRect, placement);

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50">
        {/* Semi-transparent backdrop with cutout for target */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 4}
                y={targetRect.top - 4}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx="4"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Highlight border around target */}
        <div
          className="absolute border-2 border-primary rounded pointer-events-none"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />

        {/* Tooltip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-60 bg-card border rounded-lg shadow-lg p-4 w-80"
            style={tooltipStyle}
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <h3 className="font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

            {/* Action button if provided */}
            {step.action && (
              <Button
                variant="secondary"
                size="sm"
                className="mb-3 w-full"
                onClick={step.onAction}
              >
                {step.action}
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {tour.steps.length}
              </span>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {currentStep === tour.steps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep < tour.steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>,
    document.body
  );
}

function calculateTooltipPosition(
  targetRect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right'
): React.CSSProperties {
  const gap = 12;
  const tooltipWidth = 320;
  const tooltipHeight = 200; // Approximate

  switch (placement) {
    case 'top':
      return {
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        top: targetRect.top - tooltipHeight - gap,
      };
    case 'bottom':
      return {
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        top: targetRect.bottom + gap,
      };
    case 'left':
      return {
        left: targetRect.left - tooltipWidth - gap,
        top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      };
    case 'right':
      return {
        left: targetRect.right + gap,
        top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      };
  }
}
```

### Pre-defined Tours

```typescript
// src/lib/tours/index.ts
import { Tour } from '@/components/onboarding/TourEngine';

export const tours: Record<string, Tour> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard Overview',
    triggerOnce: true,
    steps: [
      {
        target: '[data-tour="nav-jobs"]',
        title: 'Jobs',
        content: 'View and manage all your construction projects from here. Click to see your active jobs.',
        placement: 'right',
      },
      {
        target: '[data-tour="nav-clients"]',
        title: 'Clients',
        content: 'Manage your client relationships, contact information, and project history.',
        placement: 'right',
      },
      {
        target: '[data-tour="nav-financials"]',
        title: 'Financials',
        content: 'Track budgets, invoices, change orders, and payment draws all in one place.',
        placement: 'right',
      },
      {
        target: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        content: 'Use these shortcuts to quickly create new jobs, clients, or invoices.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="recent-activity"]',
        title: 'Recent Activity',
        content: 'See the latest updates across all your projects at a glance.',
        placement: 'left',
      },
    ],
  },

  jobDetail: {
    id: 'job-detail',
    name: 'Job Details',
    triggerOnce: true,
    steps: [
      {
        target: '[data-tour="job-header"]',
        title: 'Job Overview',
        content: 'See key project information at a glance including status, budget, and progress.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="job-tabs"]',
        title: 'Project Sections',
        content: 'Navigate between different aspects of your project using these tabs.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="job-budget"]',
        title: 'Budget Tracking',
        content: 'Monitor your project budget in real-time. See actual vs estimated costs.',
        placement: 'left',
      },
      {
        target: '[data-tour="job-schedule"]',
        title: 'Schedule',
        content: 'View and manage your construction schedule with our interactive timeline.',
        placement: 'bottom',
      },
    ],
  },

  invoiceCreation: {
    id: 'invoice-creation',
    name: 'Creating Invoices',
    triggerOnce: false, // Can be triggered multiple times
    steps: [
      {
        target: '[data-tour="invoice-client"]',
        title: 'Select Client',
        content: 'Choose the client to invoice. Their billing information will be automatically filled.',
        placement: 'right',
      },
      {
        target: '[data-tour="invoice-job"]',
        title: 'Link to Job',
        content: 'Optionally link this invoice to a specific job for tracking purposes.',
        placement: 'right',
      },
      {
        target: '[data-tour="invoice-items"]',
        title: 'Add Line Items',
        content: 'Add items from your cost catalog or enter custom line items.',
        placement: 'top',
        action: 'Add from catalog',
      },
      {
        target: '[data-tour="invoice-preview"]',
        title: 'Preview',
        content: 'Review your invoice before sending. You can also download as PDF.',
        placement: 'left',
      },
    ],
  },
};
```

### Tour Trigger Component

```typescript
// src/components/onboarding/TourTrigger.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TourEngine } from './TourEngine';
import { tours } from '@/lib/tours';
import { useOnboarding } from '@/contexts/OnboardingContext';

// Map routes to tours
const routeTours: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/jobs/[id]': 'jobDetail',
};

export function TourTrigger() {
  const pathname = usePathname();
  const { state, isTourCompleted } = useOnboarding();
  const [activeTour, setActiveTour] = useState<string | null>(null);

  useEffect(() => {
    // Don't show tours during setup
    if (!state.setupCompleted) return;

    // Find matching tour for current route
    for (const [pattern, tourId] of Object.entries(routeTours)) {
      const regex = new RegExp(`^${pattern.replace(/\[.*?\]/g, '[^/]+')}$`);
      if (regex.test(pathname)) {
        const tour = tours[tourId];
        if (tour && (!tour.triggerOnce || !isTourCompleted(tourId))) {
          // Delay tour start slightly for page to render
          setTimeout(() => setActiveTour(tourId), 1000);
        }
        break;
      }
    }
  }, [pathname, state.setupCompleted, isTourCompleted]);

  if (!activeTour) return null;

  const tour = tours[activeTour];
  if (!tour) return null;

  return (
    <TourEngine
      tour={tour}
      onComplete={() => setActiveTour(null)}
      onSkip={() => setActiveTour(null)}
    />
  );
}
```

---

## Contextual Help

### Tooltip System

```typescript
// src/components/ui/help-tooltip.tsx
'use client';

import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface HelpTooltipProps {
  content: string;
  learnMoreUrl?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function HelpTooltip({ content, learnMoreUrl, side = 'top' }: HelpTooltipProps) {
  const { state } = useOnboarding();

  if (!state.showTooltips) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center ml-1 text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1 block"
            >
              Learn more
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### Inline Help Component

```typescript
// src/components/ui/inline-help.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Lightbulb, ExternalLink } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface InlineHelpProps {
  title: string;
  content: string;
  tips?: string[];
  articleUrl?: string;
  videoUrl?: string;
  featureId?: string;
}

export function InlineHelp({
  title,
  content,
  tips,
  articleUrl,
  videoUrl,
  featureId,
}: InlineHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state, discoverFeature, dismissFeature } = useOnboarding();

  if (!state.showHints) return null;

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (featureId && !isExpanded) {
      discoverFeature(featureId);
    }
  };

  const handleDismiss = () => {
    setIsExpanded(false);
    if (featureId) {
      dismissFeature(featureId);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-blue-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-blue-600" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">{content}</p>

              {tips && tips.length > 0 && (
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-2">
                {articleUrl && (
                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Read article
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {videoUrl && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Watch video
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={handleDismiss}
                >
                  Got it
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Field-Level Help

```typescript
// src/components/ui/field-with-help.tsx
'use client';

import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { HelpTooltip } from '@/components/ui/help-tooltip';

interface FieldWithHelpProps {
  label: string;
  helpText: string;
  helpUrl?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWithHelp({
  label,
  helpText,
  helpUrl,
  required,
  children,
}: FieldWithHelpProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <HelpTooltip content={helpText} learnMoreUrl={helpUrl} />
      </div>
      {children}
    </div>
  );
}
```

---

## In-App Tutorials

### Video Tutorial Modal

```typescript
// src/components/onboarding/VideoTutorial.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface VideoTutorialProps {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  open: boolean;
  onClose: () => void;
}

export function VideoTutorial({
  id,
  title,
  videoUrl,
  duration,
  open,
  onClose,
}: VideoTutorialProps) {
  const { trackEvent } = useOnboarding();

  const handleComplete = () => {
    trackEvent('tutorial_completed', id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Duration: {duration}</span>
          <Button onClick={handleComplete}>Mark as Watched</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Interactive Tutorial Checklist

```typescript
// src/components/onboarding/TutorialChecklist.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, PlayCircle, ChevronRight, X } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { VideoTutorial } from './VideoTutorial';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration?: string;
  actionUrl?: string;
  actionLabel?: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'create-first-job',
    title: 'Create your first job',
    description: 'Learn how to set up a new construction project',
    videoUrl: 'https://www.youtube.com/embed/...',
    duration: '3:45',
    actionUrl: '/jobs/new',
    actionLabel: 'Create Job',
  },
  {
    id: 'add-budget',
    title: 'Set up a project budget',
    description: 'Add cost codes and budget items to track spending',
    videoUrl: 'https://www.youtube.com/embed/...',
    duration: '4:20',
  },
  {
    id: 'create-invoice',
    title: 'Create and send an invoice',
    description: 'Bill your clients directly from RossOS',
    videoUrl: 'https://www.youtube.com/embed/...',
    duration: '2:30',
    actionUrl: '/invoices/new',
    actionLabel: 'Create Invoice',
  },
  {
    id: 'daily-log',
    title: 'Record a daily log',
    description: 'Document progress, weather, and site conditions',
    videoUrl: 'https://www.youtube.com/embed/...',
    duration: '2:15',
  },
  {
    id: 'connect-quickbooks',
    title: 'Connect QuickBooks',
    description: 'Sync your financial data automatically',
    actionUrl: '/settings/integrations',
    actionLabel: 'Connect',
  },
];

export function TutorialChecklist() {
  const { state, trackEvent } = useOnboarding();
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Tutorial | null>(null);

  const completedCount = tutorials.filter(
    (t) => state.toursCompleted.includes(t.id)
  ).length;
  const progress = (completedCount / tutorials.length) * 100;

  if (!state.setupCompleted) return null;
  if (completedCount === tutorials.length) return null; // All done

  return (
    <>
      <Card className={`fixed bottom-4 right-4 w-80 shadow-lg transition-all ${
        isMinimized ? 'h-auto' : ''
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Getting Started</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <ChevronRight className="h-4 w-4 rotate-90" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">
              {completedCount}/{tutorials.length}
            </span>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              {tutorials.map((tutorial) => {
                const isCompleted = state.toursCompleted.includes(tutorial.id);

                return (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      isCompleted ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${
                        isCompleted ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {tutorial.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {tutorial.description}
                      </p>
                    </div>

                    {!isCompleted && (
                      <div className="flex items-center gap-1">
                        {tutorial.videoUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setActiveVideo(tutorial)}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {tutorial.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            asChild
                          >
                            <a href={tutorial.actionUrl}>{tutorial.actionLabel || 'Start'}</a>
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Video Modal */}
      {activeVideo && (
        <VideoTutorial
          id={activeVideo.id}
          title={activeVideo.title}
          videoUrl={activeVideo.videoUrl!}
          duration={activeVideo.duration!}
          open={true}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
```

---

## Progress Tracking

### Onboarding Progress Dashboard

```typescript
// src/components/onboarding/OnboardingProgress.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trophy, ArrowRight } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  actionUrl?: string;
}

interface OnboardingProgressProps {
  companyOnboarding: {
    profile_completed: boolean;
    logo_uploaded: boolean;
    team_invited: boolean;
    first_client_added: boolean;
    first_job_created: boolean;
    integrations_setup: boolean;
    billing_configured: boolean;
  };
}

export function OnboardingProgress({ companyOnboarding }: OnboardingProgressProps) {
  const checklist: ChecklistItem[] = [
    {
      id: 'profile',
      label: 'Complete company profile',
      completed: companyOnboarding.profile_completed,
      actionUrl: '/settings/company',
    },
    {
      id: 'logo',
      label: 'Upload company logo',
      completed: companyOnboarding.logo_uploaded,
      actionUrl: '/settings/company',
    },
    {
      id: 'team',
      label: 'Invite team members',
      completed: companyOnboarding.team_invited,
      actionUrl: '/settings/team',
    },
    {
      id: 'client',
      label: 'Add your first client',
      completed: companyOnboarding.first_client_added,
      actionUrl: '/clients/new',
    },
    {
      id: 'job',
      label: 'Create your first job',
      completed: companyOnboarding.first_job_created,
      actionUrl: '/jobs/new',
    },
    {
      id: 'integrations',
      label: 'Connect an integration',
      completed: companyOnboarding.integrations_setup,
      actionUrl: '/settings/integrations',
    },
    {
      id: 'billing',
      label: 'Set up billing',
      completed: companyOnboarding.billing_configured,
      actionUrl: '/settings/billing',
    },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;
  const isComplete = completedCount === checklist.length;

  if (isComplete) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Setup Complete!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                You're all set to start managing your projects
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find next incomplete item
  const nextItem = checklist.find((item) => !item.completed);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Getting Started</CardTitle>
          <Badge variant="secondary">{completedCount}/{checklist.length} complete</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded-lg ${
                item.completed ? 'bg-green-50 dark:bg-green-950/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                  {item.label}
                </span>
              </div>

              {!item.completed && item.actionUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={item.actionUrl}>
                    Start
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>

        {nextItem && (
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full" asChild>
              <a href={nextItem.actionUrl}>
                Continue: {nextItem.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Feature Discovery

### New Feature Announcement

```typescript
// src/components/onboarding/NewFeatureAnnouncement.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
}

interface NewFeatureAnnouncementProps {
  feature: Feature;
}

export function NewFeatureAnnouncement({ feature }: NewFeatureAnnouncementProps) {
  const { isFeatureDiscovered, discoverFeature, dismissFeature } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isFeatureDiscovered(feature.id)) {
      // Delay showing for smoother UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [feature.id, isFeatureDiscovered]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissFeature(feature.id);
  };

  const handleAction = () => {
    setIsVisible(false);
    discoverFeature(feature.id);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-20 right-4 w-80 bg-card border rounded-lg shadow-xl overflow-hidden z-50"
        >
          {/* Image */}
          {feature.imageUrl && (
            <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5">
              <img
                src={feature.imageUrl}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs font-medium text-primary">New Feature</span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {feature.description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Maybe later
              </Button>
              {feature.actionUrl && (
                <Button size="sm" onClick={handleAction} asChild>
                  <a href={feature.actionUrl}>
                    {feature.actionLabel || 'Try it'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Feature Spotlight

```typescript
// src/components/onboarding/FeatureSpotlight.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Sparkles } from 'lucide-react';

interface FeatureSpotlightProps {
  featureId: string;
  target: string; // CSS selector
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function FeatureSpotlight({
  featureId,
  target,
  title,
  description,
  placement = 'bottom',
}: FeatureSpotlightProps) {
  const { isFeatureDiscovered, discoverFeature } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isFeatureDiscovered(featureId)) return;

    const targetElement = document.querySelector(target);
    if (targetElement) {
      setTargetRect(targetElement.getBoundingClientRect());
      setIsVisible(true);
    }
  }, [featureId, target, isFeatureDiscovered]);

  const handleDismiss = () => {
    setIsVisible(false);
    discoverFeature(featureId);
  };

  if (!isVisible || !targetRect) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Pulsing ring around target */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        >
          <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
          <div className="absolute inset-0 rounded-lg bg-primary/10" />
        </div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute pointer-events-auto bg-card border rounded-lg shadow-lg p-4 w-64"
          style={getTooltipPosition(targetRect, placement)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">New</span>
          </div>

          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          <Button size="sm" onClick={handleDismiss} className="w-full">
            Got it
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function getTooltipPosition(
  rect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right'
): React.CSSProperties {
  const gap = 12;

  switch (placement) {
    case 'bottom':
      return {
        left: rect.left + rect.width / 2 - 128,
        top: rect.bottom + gap,
      };
    case 'top':
      return {
        left: rect.left + rect.width / 2 - 128,
        bottom: window.innerHeight - rect.top + gap,
      };
    case 'left':
      return {
        right: window.innerWidth - rect.left + gap,
        top: rect.top + rect.height / 2 - 50,
      };
    case 'right':
      return {
        left: rect.right + gap,
        top: rect.top + rect.height / 2 - 50,
      };
  }
}
```

---

## Help Center Integration

### Help Search

```typescript
// src/components/help/HelpSearch.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FileText, Video, MessageCircle, ExternalLink } from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'video' | 'faq';
}

interface HelpSearchProps {
  open: boolean;
  onClose: () => void;
}

export function HelpSearch({ open, onClose }: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    searchHelp(debouncedQuery);
  }, [debouncedQuery]);

  async function searchHelp(q: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/help/search?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Help search error:', error);
    } finally {
      setLoading(false);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'faq':
        return MessageCircle;
      default:
        return FileText;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onClose}>
      <CommandInput
        placeholder="Search help articles..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="p-4 text-center text-muted-foreground">
            Searching...
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <CommandEmpty>
            No results found. Try different keywords.
          </CommandEmpty>
        )}

        {results.length > 0 && (
          <CommandGroup heading="Help Articles">
            {results.map((article) => {
              const Icon = getIcon(article.type);
              return (
                <CommandItem
                  key={article.id}
                  onSelect={() => {
                    window.open(article.url, '_blank');
                    onClose();
                  }}
                >
                  <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{article.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {article.description}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {!query && (
          <CommandGroup heading="Popular Topics">
            <CommandItem onSelect={() => window.open('/help/getting-started', '_blank')}>
              <FileText className="h-4 w-4 mr-2" />
              Getting Started Guide
            </CommandItem>
            <CommandItem onSelect={() => window.open('/help/invoicing', '_blank')}>
              <FileText className="h-4 w-4 mr-2" />
              Creating Invoices
            </CommandItem>
            <CommandItem onSelect={() => window.open('/help/budgets', '_blank')}>
              <FileText className="h-4 w-4 mr-2" />
              Budget Management
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
```

### Help Button

```typescript
// src/components/help/HelpButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, Book, Video, MessageCircle, Search, Keyboard } from 'lucide-react';
import { HelpSearch } from './HelpSearch';

export function HelpButton() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4 mr-2" />
            Search Help
            <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
              ?
            </kbd>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <a href="/help" target="_blank">
              <Book className="h-4 w-4 mr-2" />
              Documentation
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a href="/help/videos" target="_blank">
              <Video className="h-4 w-4 mr-2" />
              Video Tutorials
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a href="/help/keyboard-shortcuts" target="_blank">
              <Keyboard className="h-4 w-4 mr-2" />
              Keyboard Shortcuts
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <a href="/support" target="_blank">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <HelpSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
```

---

## Summary

| Component | Purpose | Trigger |
|-----------|---------|---------|
| Setup Wizard | Initial company/user setup | First login |
| Product Tours | Feature walkthroughs | Route-based |
| Contextual Help | Inline tooltips/hints | Always available |
| Video Tutorials | Step-by-step guides | On demand |
| Progress Tracking | Checklist completion | Dashboard widget |
| Feature Discovery | New feature announcements | Feature release |
| Help Search | Documentation search | Keyboard shortcut (?) |

All components integrate with the `OnboardingContext` for state persistence and analytics tracking.
