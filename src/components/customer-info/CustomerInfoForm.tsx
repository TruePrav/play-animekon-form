'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { consoleOptions, retroConsoleOptions } from '@/config/customer-form-config';
import ReactCountryFlag from 'react-country-flag';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';



// Success Page Component
function SuccessPage({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          {/* PLAY Logo */}
          <div className="mb-4">
            <img 
              src="/play-black.png" 
              alt="PLAY Logo" 
              className="h-64 w-auto mx-auto drop-shadow-2xl"
            />
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm hover:border-emerald-400/50 transition-all duration-300 shadow-2xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-emerald-400 text-8xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-emerald-400 mb-4">Mission Complete!</h2>
              <p className="text-xl text-slate-200 mb-6 leading-relaxed">
                Your player profile has been successfully saved to our database. 
                Welcome to PLAY Barbados!
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 mb-6">
                <p className="text-slate-300 text-sm">
                  We'll use your WhatsApp number to send you updates about gaming loot and special offers!
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-emerald-400 text-lg">
                  Thank you for joining PLAY Barbados!
                </p>
                <Button 
                  onClick={onReset}
                  className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white border-0 shadow-lg hover:shadow-emerald-400/25 transition-all duration-300 transform hover:scale-105"
                >
                  Create Another Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Please enter a valid email address'),
  whatsappCountryCode: z.string().min(1, 'Country code is required'),
  customCountryCode: z.string().optional(),
  whatsappNumber: z.string().min(7, 'WhatsApp number must be at least 7 digits').max(15, 'WhatsApp number must be less than 15 digits').regex(/^[\d\-]+$/, 'WhatsApp number can only contain digits and dashes'),
  shopCategories: z.array(z.enum(['video_games'])).min(1, 'Please select at least one shopping category'),
  selectedConsoles: z.array(z.string()).optional(),
  selectedRetroConsoles: z.array(z.string()).optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
});

type FormData = z.infer<typeof formSchema>;

export function CustomerInfoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    shouldUnregister: true,        // Unregister fields when unmounted
    defaultValues: {
      fullName: '',
      email: '',
      whatsappCountryCode: '+1 (246)', // Fixed: Added brackets to match SelectItem value
      customCountryCode: '',
      whatsappNumber: '',
      shopCategories: ['video_games'], // Auto-check video games
      selectedConsoles: [],
      selectedRetroConsoles: [],
      acceptedTerms: false,
    },
  });

  const watchShopCategories = form.watch('shopCategories') || [];
  const watchCountryCode = form.watch('whatsappCountryCode');

  // Auto-populate "+" when "Other" is selected for country code
  useEffect(() => {
    if (watchCountryCode === 'other') {
      form.setValue('customCountryCode', '+');
    }
  }, [watchCountryCode, form]);

  // Reset component state when component mounts
  useEffect(() => {
    resetComponentState();
  }, []);

  const resetFormState = () => {
    form.reset();
    // Explicitly reset the terms acceptance and auto-check video games
    form.setValue('acceptedTerms', false);
    form.setValue('shopCategories', ['video_games']);
    setError(null);
    setIsSubmitting(false);
  };

  const resetComponentState = () => {
    setError(null);
    setIsSubmitting(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    logger.debug('Form submit (redacted)', {
      categories: data.shopCategories,
      consolesCount: data.selectedConsoles?.length ?? 0,
      retroConsolesCount: data.selectedRetroConsoles?.length ?? 0,
    });
    
    try {
      // Single database function call to create player profile
      const { data: newId, error } = await supabase.rpc('create_player_profile', {
        p_full_name: data.fullName,
        p_whatsapp_country_code: data.whatsappCountryCode,
        p_whatsapp_number: data.whatsappNumber,
        p_email: (data.email ?? '').trim().toLowerCase() || null,
        p_custom_country_code: data.customCountryCode || null,
        p_terms_accepted: data.acceptedTerms,
        p_terms_accepted_at: new Date().toISOString(),
        p_shop_categories: data.shopCategories,
        p_consoles: data.selectedConsoles || [],
        p_retro_consoles: data.selectedRetroConsoles || []
      });

      if (error) {
        logger.error('Player profile creation error:', error);
        throw error;
      }

      logger.info('Player profile created successfully with ID:', newId);
      logger.info('Form submitted successfully - ALL data saved to database!');
      setIsSuccess(true);
      setIsSubmitting(false);
      
    } catch (error) {
      logger.error('Error submitting form:', error);
      
      // More specific error messages
      let errorMessage = 'There was an error submitting your form. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        if ('message' in error) {
          const message = String(error.message);
          
          // Handle specific database constraint errors
          if (message.includes('customers_email_unique')) {
            errorMessage = 'An account with this email address already exists. Please use a different email or contact support if you need help.';
          } else if (message.includes('duplicate key value violates unique constraint')) {
            errorMessage = 'This information appears to already exist in our system. Please check your details or contact support for assistance.';
          } else if (message.includes('not-null constraint')) {
            errorMessage = 'Some required information is missing. Please check all required fields and try again.';
          } else if (message.includes('foreign key constraint')) {
            errorMessage = 'There was an issue with your selection. Please refresh the page and try again.';
          } else if (message.includes('check constraint')) {
            errorMessage = 'Some of your information doesn\'t meet our requirements. Please check your details and try again.';
          } else {
            errorMessage = message;
          }
        } else if ('error_description' in error) {
          errorMessage = String(error.error_description);
        }
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleShopCategoryChange = (category: 'video_games', checked: boolean) => {
    const currentCategories = form.getValues('shopCategories') || [];
    
    if (checked) {
      form.setValue('shopCategories', [...currentCategories, category]);
    } else {
      const newCategories = currentCategories.filter(cat => cat !== category);
      form.setValue('shopCategories', newCategories);
      
      // Clear related selections when category is unchecked
      if (category === 'video_games') {
        form.setValue('selectedConsoles', []);
        form.setValue('selectedRetroConsoles', []);
      }
    }
  };



  // Function to scroll to the first error field
  const scrollToFirstError = (errors: any) => {
    // Wait for next tick to ensure DOM is updated
    setTimeout(() => {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Focus the element if it's an input
          if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLSelectElement) {
            errorElement.focus();
          }
        }
      }
    }, 100);
  };

  if (isSuccess) {
    return (
      <SuccessPage onReset={() => {
        setIsSuccess(false);
        resetFormState();
      }} />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center mb-8">
            {/* PLAY Logo */}
            <div className="mb-4">
              <img 
                src="/play-black.png" 
                alt="PLAY Logo" 
                className="h-32 w-auto mx-auto drop-shadow-2xl"
              />
            </div>
          </div>
          
          <Card className="bg-slate-800/50 border-amber-400/50 backdrop-blur-sm hover:border-amber-400/30 transition-all duration-300">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-amber-400 text-6xl mb-6">⚠️</div>
              <h2 className="text-3xl font-bold text-amber-300 mb-4">Oops! Something went wrong</h2>
              <p className="text-slate-200 text-lg mb-6 leading-relaxed">{error}</p>
              <Button 
                onClick={() => {
                  resetFormState();
                }}
                className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0 shadow-lg hover:shadow-amber-400/25 transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-8">
          <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500" style={{ width: '33%' }}></div>
        </div>
        
        <div className="text-center">
          {/* PLAY Logo */}
          <div className="mb-4">
            <img 
              src="/play-black.png" 
              alt="PLAY Logo" 
              className="h-64 w-auto mx-auto drop-shadow-2xl"
            />
          </div>
          
          <h2 className="text-3xl font-semibold text-slate-300 mb-4">Player Profile Setup</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Tell us a bit about yourself so we can level up your shopping experience.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            logger.error('Form validation errors:', errors);
            scrollToFirstError(errors);
          })} className="space-y-6">
            {/* Player Profile Section */}
            <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm hover:border-emerald-400/50 transition-all duration-300">
              <CardHeader className="border-b border-slate-600">
                <CardTitle className="text-2xl font-bold text-emerald-400 flex items-center gap-3">
                  <span className="text-3xl">👤</span>
                  Player Profile
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Basic information to unlock your gaming perks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        Player Name (Full Name)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your real name — no gamertag… yet" 
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <span className="text-2xl">✉️</span>
                        Player Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappCountryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <span className="text-2xl">📱</span>
                        Loot Drop Contact (WhatsApp Number)
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Select
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                              if (val !== 'other') {
                                form.setValue('customCountryCode', '');
                              } else {
                                form.setValue('customCountryCode', '+');
                              }
                            }}
                          >
                            <SelectTrigger className="w-[160px] bg-slate-700 border border-slate-600 text-white focus:border-emerald-400 focus:ring-emerald-400/20">
                              <SelectValue placeholder="Select code" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-slate-600">
                              <SelectItem value="+1 (246)">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="BB" style={{ width: '1.2em', height: '1.2em' }} />
                                  +1 (246) (Barbados)
                                </span>
                              </SelectItem>
                              <SelectItem value="+1">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="US" style={{ width: '1.2em', height: '1.2em' }} />
                                  +1 (US/Canada)
                                </span>
                              </SelectItem>
                              <SelectItem value="+44">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="GB" style={{ width: '1.2em', height: '1.2em' }} />
                                  +44 (UK)
                                </span>
                              </SelectItem>
                              <SelectItem value="+91">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="IN" style={{ width: '1.2em', height: '1.2em' }} />
                                  +91 (India)
                                </span>
                              </SelectItem>
                              <SelectItem value="+86">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="CN" style={{ width: '1.2em', height: '1.2em' }} />
                                  +86 (China)
                                </span>
                              </SelectItem>
                              <SelectItem value="+81">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="JP" style={{ width: '1.2em', height: '1.2em' }} />
                                  +81 (Japan)
                                </span>
                              </SelectItem>
                              <SelectItem value="+49">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="DE" style={{ width: '1.2em', height: '1.2em' }} />
                                  +49 (Germany)
                                </span>
                              </SelectItem>
                              <SelectItem value="+33">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="FR" style={{ width: '1.2em', height: '1.2em' }} />
                                  +33 (France)
                                </span>
                              </SelectItem>
                              <SelectItem value="+61">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="AU" style={{ width: '1.2em', height: '1.2em' }} />
                                  +61 (Australia)
                                </span>
                              </SelectItem>
                              <SelectItem value="+55">
                                <span className="inline-flex items-center gap-2">
                                  <ReactCountryFlag svg countryCode="BR" style={{ width: '1.2em', height: '1.2em' }} />
                                  +55 (Brazil)
                                </span>
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {field.value === 'other' && (
                            <Input 
                              placeholder="XX" 
                              {...form.register('customCountryCode')}
                              className="bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 min-w-[80px]"
                              defaultValue="+"
                            />
                          )}
                          
                          <FormField
                            control={form.control}
                            name="whatsappNumber"
                            render={({ field: phoneField }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder={form.watch('whatsappCountryCode') === '+1 (246)' ? 'xxx-xxxx' : 'Enter WhatsApp number'}
                                    {...phoneField}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                      if (form.watch('whatsappCountryCode') === '+1 (246)' && value.length > 3) {
                                        // Format Barbados number: XXX-XXXX
                                        const formatted = value.slice(0, 3) + '-' + value.slice(3, 7);
                                        e.target.value = formatted;
                                        phoneField.onChange(formatted);
                                      } else {
                                        phoneField.onChange(value);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        We'll use this to send you updates about your gaming loot
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Removed DOB field */}

                {/* Removed Guardian Information Required section */}
              </CardContent>
            </Card>

            {/* Loot Preferences Section */}
            <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader className="border-b border-slate-600">
                <CardTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  Game Store Favorites
                </CardTitle>
                <CardDescription className="text-slate-300">
                Select your usual gaming essentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="shopCategories"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-slate-200">What consoles do you own and shop for? (Console selection is optional)</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 p-4 border border-slate-600 rounded-lg hover:border-cyan-400/50 transition-all duration-200 bg-slate-700/50">
                            <Checkbox
                              id="video_games"
                              checked={watchShopCategories.includes('video_games')}
                              onCheckedChange={(checked) => 
                                handleShopCategoryChange('video_games', checked as boolean)
                              }
                              className="border-slate-500 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                            />
                            <label htmlFor="video_games" className="text-lg font-medium text-slate-200 cursor-pointer flex items-center gap-2">
                              <span className="text-2xl">🎮</span>
                              Video Games
                            </label>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchShopCategories.includes('video_games') && (
                  <div className="space-y-4 p-4 border border-cyan-400/30 bg-cyan-900/20 rounded-lg">
                    <h4 className="font-semibold text-cyan-300 text-lg flex items-center gap-2">
                      <span className="text-2xl">🎮</span>
                      Select Gaming Systems You Own (Optional)
                    </h4>
                    <p className="text-slate-300 text-sm mb-4">
                      Don't worry if you don't own any consoles yet - you can still submit your information and update this later!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {consoleOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg bg-slate-700/50 hover:border-cyan-400/50 transition-all duration-200">
                          <Checkbox
                            id={option.id}
                            checked={form.watch('selectedConsoles')?.includes(option.id) || false}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('selectedConsoles') || [];
                              if (checked) {
                                form.setValue('selectedConsoles', [...current, option.id]);
                              } else {
                                form.setValue('selectedConsoles', current.filter(id => id !== option.id));
                              }
                            }}
                            className="border-slate-500 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                          />
                          <label htmlFor={option.id} className="text-slate-200 font-medium cursor-pointer">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {/* Retro Console Options - Only show when Retro is selected */}
                    {form.watch('selectedConsoles')?.includes('retro') && (
                      <div className="mt-6 p-4 border border-amber-400/30 bg-amber-900/20 rounded-lg">
                        <h5 className="font-semibold text-amber-300 text-lg flex items-center gap-2 mb-4">
                          <span className="text-2xl">🕹️</span>
                          Select Retro Gaming Systems
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {retroConsoleOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg bg-slate-700/50 hover:border-amber-400/50 transition-all duration-200">
                              <Checkbox
                                id={`retro-${option.id}`}
                                checked={form.watch('selectedRetroConsoles')?.includes(option.id) || false}
                                onCheckedChange={(checked) => {
                                  const current = form.getValues('selectedRetroConsoles') || [];
                                  if (checked) {
                                    form.setValue('selectedRetroConsoles', [...current, option.id]);
                                  } else {
                                    form.setValue('selectedRetroConsoles', current.filter(id => id !== option.id));
                                  }
                                }}
                                className="border-slate-500 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                              />
                              <label htmlFor={`retro-${option.id}`} className="text-slate-200 font-medium cursor-pointer">
                                {option.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    

                    
                    <FormMessage />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* The Rulebook Section */}
            <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
              <CardHeader className="border-b border-slate-600">
                <CardTitle className="text-2xl font-bold text-purple-400 flex items-center gap-3">
                  <span className="text-3xl">📜</span>
                  The Rulebook
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Every good game has rules — read them before you press start
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="acceptedTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-slate-500 data-[state=checked]:bg-purple-400 data-[state=checked]:border-purple-400"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-slate-200 text-base">
                          I consent to receive WhatsApp/Email communications. My information will remain secure and used solely by PLAY Barbados.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white border-0 shadow-lg hover:shadow-emerald-400/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Saving...' : 'Start My PLAY Journey'}
              </Button>
            </div>
          </form>
        </Form>


      </div>
    </div>
  );
}
