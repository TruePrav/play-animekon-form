'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, differenceInYears } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TermsDialog } from './TermsDialog';
import { giftCardOptions, consoleOptions, retroConsoleOptions } from '@/config/customer-form-config';
import ReactCountryFlag from 'react-country-flag';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// helpers
const year = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.getUTCFullYear() : 'invalid';
};

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

// Barbados timezone for age calculations
const BARBADOS_TIMEZONE = 'America/Barbados';

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Please enter a valid email address'),
  dob: z.string().refine((date) => {
    if (!date) return false;
    const parsedDate = parseISO(date);
    const today = utcToZonedTime(new Date(), BARBADOS_TIMEZONE);
    const minDate = new Date('1900-01-01');
    return parsedDate <= today && parsedDate >= minDate;
  }, 'Please enter a valid date of birth (cannot be in the future or before 1900)'),
  whatsappCountryCode: z.string().min(1, 'Country code is required'),
  customCountryCode: z.string().optional(),
  whatsappNumber: z.string().min(7, 'WhatsApp number must be at least 7 digits').max(15, 'WhatsApp number must be less than 15 digits').regex(/^[\d\-]+$/, 'WhatsApp number can only contain digits and dashes'),
  shopCategories: z.array(z.enum(['gift_cards', 'video_games'])).min(1, 'Please select at least one shopping category'),
  selectedGiftCards: z.array(z.string()).optional(),
  giftCardUsernames: z.record(
    z.string().max(40, 'Username must be less than 40 characters').optional()
  ).optional(),
  selectedConsoles: z.array(z.string()).optional(),
  selectedRetroConsoles: z.array(z.string()).optional(),
  guardianFullName: z.string().optional(),
  guardianDob: z.string().optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => {
  // If shopping for gift cards, require at least one selection
  if (data.shopCategories.includes('gift_cards')) {
    return data.selectedGiftCards && data.selectedGiftCards.length > 0;
  }
  return true;
}, {
  message: 'Please select at least one gift card type',
  path: ['selectedGiftCards'],
}).refine((data) => {
  // If shopping for gift cards, validate usernames when provided (now optional)
  if (data.shopCategories.includes('gift_cards') && data.selectedGiftCards && data.selectedGiftCards.length > 0) {
    if (!data.giftCardUsernames) return true; // Allow if no usernames provided
    
    return data.selectedGiftCards.every(cardId => {
      const username = data.giftCardUsernames![cardId];
      
      // If username is empty/blank, it's allowed (optional)
      if (!username || username.trim().length === 0) return true;
      
      // If username is provided, validate email format for Amazon and Apple gift cards
      if (cardId === 'amazon' || cardId === 'itunes') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(username.trim());
      }
      
      return true;
    });
  }
  return true;
}, {
  message: 'If you provide usernames for gift cards, Amazon and Apple require valid email addresses. You can leave usernames blank.',
  path: ['giftCardUsernames'],
}).refine((data) => {
  // If shopping for video games, require at least one console
  if (data.shopCategories.includes('video_games')) {
    const hasMainConsoles = data.selectedConsoles && data.selectedConsoles.length > 0;
    const hasRetroConsoles = data.selectedRetroConsoles && data.selectedRetroConsoles.length > 0;
    return hasMainConsoles || hasRetroConsoles;
  }
  return true;
}, {
  message: 'Please select at least one gaming system',
  path: ['selectedConsoles'],
}).refine((data) => {
  // If customer is a minor (under 18), require guardian information
  if (data.dob) {
    try {
      const customerDate = parseISO(data.dob);
      const today = utcToZonedTime(new Date(), BARBADOS_TIMEZONE);
      const age = differenceInYears(today, customerDate);
      if (age < 18) {
        return data.guardianFullName && data.guardianFullName.length >= 2 && 
               data.guardianDob && data.guardianDob.length > 0;
      }
    } catch (error) {
      // Invalid date, ignore
    }
  }
  return true;
}, {
  message: 'Guardian information is required for customers under 18 years old',
  path: ['guardianFullName'],
}).refine((data) => {
  // Validate guardian name length if provided
  if (data.guardianFullName && data.guardianFullName.length > 0) {
    return data.guardianFullName.length >= 2 && data.guardianFullName.length <= 80;
  }
  return true;
}, {
  message: 'Guardian name must be between 2 and 80 characters',
  path: ['guardianFullName'],
}).refine((data) => {
  // Validate guardian date of birth if provided
  if (data.guardianDob && data.guardianDob.length > 0) {
    try {
      const guardianDate = parseISO(data.guardianDob);
      const today = utcToZonedTime(new Date(), BARBADOS_TIMEZONE);
      const minDate = new Date('1900-01-01');
      return guardianDate <= today && guardianDate >= minDate;
    } catch (error) {
      return false;
    }
  }
  return true;
}, {
  message: 'Please enter a valid guardian date of birth (cannot be in the future or before 1900)',
  path: ['guardianDob'],
}).refine((data) => {
  // If customer is a minor (under 18), guardian must be at least 18 years old
  if (data.dob && data.guardianDob) {
    try {
      const customerDate = parseISO(data.dob);
      const guardianDate = parseISO(data.guardianDob);
      const today = utcToZonedTime(new Date(), BARBADOS_TIMEZONE);
      
      const customerAge = differenceInYears(today, customerDate);
      const guardianAge = differenceInYears(today, guardianDate);
      
      if (customerAge < 18) {
        return guardianAge >= 18;
      }
    } catch (error) {
      // Invalid dates, ignore
    }
  }
  return true;
}, {
  message: 'Guardian must be at least 18 years old',
  path: ['guardianDob'],
});

type FormData = z.infer<typeof formSchema>;

export function CustomerInfoForm() {
  const [isMinor, setIsMinor] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    shouldUnregister: true,        // Unregister fields when unmounted
    defaultValues: {
      fullName: '',
      email: '',
      dob: '',
      whatsappCountryCode: '+1 (246)', // Fixed: Added brackets to match SelectItem value
      customCountryCode: '',
      whatsappNumber: '',
      shopCategories: [],
      selectedGiftCards: [],
      giftCardUsernames: {},
      selectedConsoles: [],
      selectedRetroConsoles: [],
      guardianFullName: '',
      guardianDob: '',
      acceptedTerms: false,
    },
  });

  const watchShopCategories = form.watch('shopCategories') || [];
  const watchSelectedGiftCards = form.watch('selectedGiftCards') || [];
  const watchDob = form.watch('dob');
  const watchCountryCode = form.watch('whatsappCountryCode');

  // Check if customer is a minor when DOB changes
  useEffect(() => {
    if (watchDob) {
      try {
        const customerDate = parseISO(watchDob);
        const today = utcToZonedTime(new Date(), BARBADOS_TIMEZONE);
        const age = differenceInYears(today, customerDate);
        const newIsMinor = age < 18;
        
        if (newIsMinor !== isMinor) {
          setIsMinor(newIsMinor);
          
          if (!newIsMinor) {
            // Clear guardian fields if no longer a minor
            form.setValue('guardianFullName', '');
            form.setValue('guardianDob', '');
          }
        }
      } catch (error) {
        // Invalid date, ignore
      }
    }
  }, [watchDob, isMinor, form]);

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
    // Explicitly reset the terms acceptance
    form.setValue('acceptedTerms', false);
    setIsMinor(false);
    setError(null);
    setHasReadTerms(false);
    setShowTerms(false);
    setIsSubmitting(false);
  };

  const resetComponentState = () => {
    setIsMinor(false);
    setError(null);
    setHasReadTerms(false);
    setShowTerms(false);
    setIsSubmitting(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    logger.debug('Form submit (redacted)', {
      categories: data.shopCategories,
      giftCardsCount: data.selectedGiftCards?.length ?? 0,
      consolesCount: data.selectedConsoles?.length ?? 0,
      retroConsolesCount: data.selectedRetroConsoles?.length ?? 0,
      hasGuardian: Boolean(data.guardianFullName),
    });
    
    try {
      // Log the specific date values being sent (redacted)
      logger.debug('Date fields (redacted)', {
        dobYear: year(data.dob),
        guardianDobYear: year(data.guardianDob),
        isMinor,
      });
      
      // Single database function call to create player profile
      const { data: newId, error } = await supabase.rpc('create_player_profile', {
        p_full_name: data.fullName,
        p_date_of_birth: data.dob || null,
        p_whatsapp_country_code: data.whatsappCountryCode,
        p_whatsapp_number: data.whatsappNumber,
        p_email: (data.email ?? '').trim().toLowerCase() || null,
        p_custom_country_code: data.customCountryCode || null,
        p_guardian_full_name: data.guardianFullName || null,
        p_guardian_date_of_birth: data.guardianDob || null,
        p_is_minor: isMinor,
        p_terms_accepted: data.acceptedTerms,
        p_terms_accepted_at: new Date().toISOString(),
        p_shop_categories: data.shopCategories,
        p_gift_cards: (data.selectedGiftCards || []).map(id => ({
          id, 
          username: (data.giftCardUsernames?.[id] || '').trim().toLowerCase() || null
        })), // Include all selected gift cards, with null usernames for optional ones
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

  const handleGiftCardChange = (cardId: string, checked: boolean) => {
    const currentSelected = form.getValues('selectedGiftCards') || [];
    const currentUsernames = form.getValues('giftCardUsernames') || {};
    
    if (checked) {
      if (currentUsernames[cardId] == null) {
        form.setValue(`giftCardUsernames.${cardId}` as const, ''); // avoid undefined
      }
      form.setValue('selectedGiftCards', [...currentSelected, cardId]);
    } else {
      form.setValue('selectedGiftCards', currentSelected.filter(id => id !== cardId));
      delete currentUsernames[cardId];
      form.setValue('giftCardUsernames', currentUsernames);
    }
  };

  const handleGiftCardUsernameChange = (cardId: string, value: string) => {
    // Convert to lowercase for email-based gift cards
    if (cardId === 'amazon' || cardId === 'itunes') {
      const formattedValue = value.toLowerCase().trim();
      form.setValue(`giftCardUsernames.${cardId}` as const, formattedValue);
    } else {
      form.setValue(`giftCardUsernames.${cardId}` as const, value);
    }
  };

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getGiftCardInputClassName = (cardId: string, value: string) => {
    const baseClass = "bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-200";
    
    if (cardId === 'amazon' || cardId === 'itunes') {
      if (!value) return baseClass;
      if (isEmailValid(value)) {
        return "bg-slate-600 border-emerald-500 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200";
      } else {
        return "bg-slate-600 border-red-500 text-white placeholder:text-slate-400 focus:border-red-400 focus:ring-red-400/20 transition-all duration-200";
      }
    }
    
    return baseClass;
  };

  const handleShopCategoryChange = (category: 'gift_cards' | 'video_games', checked: boolean) => {
    const currentCategories = form.getValues('shopCategories') || [];
    
    if (checked) {
      form.setValue('shopCategories', [...currentCategories, category]);
    } else {
      const newCategories = currentCategories.filter(cat => cat !== category);
      form.setValue('shopCategories', newCategories);
      
      // Clear related selections when category is unchecked
      if (category === 'gift_cards') {
        form.setValue('selectedGiftCards', []);
        form.setValue('giftCardUsernames', {});
      } else if (category === 'video_games') {
        form.setValue('selectedConsoles', []);
        form.setValue('selectedRetroConsoles', []);
      }
    }
  };

  const handleTermsScrollToBottom = () => {
    setHasReadTerms(true);
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

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        Spawn Date (Date of Birth)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          max={format(utcToZonedTime(new Date(), BARBADOS_TIMEZONE), 'yyyy-MM-dd')}
                          className="bg-slate-700 border-slate-600 text-white focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        We need this to unlock the right perks for your age
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isMinor && (
                  <div className="space-y-4 p-6 border-2 border-amber-400/30 bg-amber-900/20 rounded-lg backdrop-blur-sm">
                    <h4 className="font-semibold text-amber-300 text-lg flex items-center gap-2">
                      <span className="text-2xl">🛡️</span>
                      Guardian Information Required
                    </h4>
                    
                    <FormField
                      control={form.control}
                      name="guardianFullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Guardian Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter guardian's full name" 
                              {...field}
                              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guardianDob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Guardian Date of Birth</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              max={format(utcToZonedTime(new Date(), BARBADOS_TIMEZONE), 'yyyy-MM-dd')}
                              className="bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-200"
                            />
                          </FormControl>
                          <FormDescription className="text-slate-400">
                            Format: YYYY-MM-DD
                          </FormDescription>
                          {/* Guardian age validation display */}
                          {field.value && isMinor && (
                            <div className="flex items-center gap-2 text-xs">
                              {(() => {
                                try {
                                  const guardianDate = parseISO(field.value);
                                  const today = utcToZonedTime(new Date(), BARBADOS_TIMEZONE);
                                  const guardianAge = differenceInYears(today, guardianDate);
                                  const isValidGuardian = guardianAge >= 18;
                                  
                                  return (
                                    <>
                                      <span className={`flex items-center gap-1 ${isValidGuardian ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isValidGuardian ? '✓' : '✗'} Guardian age: {guardianAge} years old
                                      </span>
                                      {!isValidGuardian && (
                                        <span className="text-red-400">
                                          (Must be 18+ to be a legal guardian)
                                        </span>
                                      )}
                                    </>
                                  );
                                } catch (error) {
                                  return <span className="text-amber-400">Invalid date format</span>;
                                }
                              })()}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
                      <FormLabel className="text-lg font-semibold text-slate-200">What do you usually shop for? (Select all that apply)</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 p-4 border border-slate-600 rounded-lg hover:border-cyan-400/50 transition-all duration-200 bg-slate-700/50">
                            <Checkbox
                              id="gift_cards"
                              checked={watchShopCategories.includes('gift_cards')}
                              onCheckedChange={(checked) => 
                                handleShopCategoryChange('gift_cards', checked as boolean)
                              }
                              className="border-slate-500 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                            />
                            <label htmlFor="gift_cards" className="text-lg font-medium text-slate-200 cursor-pointer flex items-center gap-2">
                              <span className="text-2xl">🎁</span>
                              Gift Cards
                            </label>
                          </div>
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

                {watchShopCategories.includes('gift_cards') && (
                  <div className="space-y-4 p-4 border border-cyan-400/30 bg-cyan-900/20 rounded-lg">
                    <h4 className="font-semibold text-cyan-300 text-lg flex items-center gap-2">
                      <span className="text-2xl">🎁</span>
                      Select Gift Card Types
                    </h4>
                    
                    {/* Optional usernames notice */}
                    <div className="bg-amber-900/30 border border-amber-400/30 rounded-lg p-3">
                      <p className="text-amber-200 text-sm flex items-center gap-2">
                        <span className="text-lg">ℹ️</span>
                        <strong>Note:</strong> If you don't have your username right now, you can update it later when you're ready to purchase.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {giftCardOptions.map((option) => (
                                                  <div key={option.id} className="space-y-3 p-3 border border-slate-600 rounded-lg bg-slate-700/50 hover:border-cyan-400/50 transition-all duration-200">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={option.id}
                                checked={watchSelectedGiftCards.includes(option.id)}
                                onCheckedChange={(checked) => 
                                  handleGiftCardChange(option.id, checked as boolean)
                                }
                                className="border-slate-500 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                              />
                              <label htmlFor={option.id} className="text-slate-200 font-medium cursor-pointer">
                                {option.name}
                              </label>
                            </div>
                          
                          {watchSelectedGiftCards.includes(option.id) && (
                            <FormField
                              control={form.control}
                              name={`giftCardUsernames.${option.id}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm text-slate-300">{option.usernameLabel}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={option.usernamePlaceholder}
                                      value={field.value ?? ''}   // Ensure a string, not undefined
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        handleGiftCardUsernameChange(option.id, value);
                                      }}
                                      className={getGiftCardInputClassName(option.id, field.value ?? '')}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-400">
                                    {option.helperText}
                                  </FormDescription>
                                  {/* Email validation indicator for Amazon and Apple */}
                                  {(option.id === 'amazon' || option.id === 'itunes') && field.value && (
                                    <div className="flex items-center gap-2 text-xs">
                                      {isEmailValid(field.value) ? (
                                        <span className="text-emerald-400 flex items-center gap-1">
                                          ✓ Valid email format
                                        </span>
                                      ) : (
                                        <span className="text-red-400 flex items-center gap-1">
                                          ✗ Please enter a valid email address
                                        </span>
                                        )}
                                    </div>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Helper text when no gift cards selected */}
                    {watchShopCategories.includes('gift_cards') && (!watchSelectedGiftCards || watchSelectedGiftCards.length === 0) && (
                      <div className="text-amber-400 text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        Please select at least one gift card type above
                      </div>
                    )}
                    <FormMessage />
                  </div>
                )}

                {watchShopCategories.includes('video_games') && (
                  <div className="space-y-4 p-4 border border-cyan-400/30 bg-cyan-900/20 rounded-lg">
                    <h4 className="font-semibold text-cyan-300 text-lg flex items-center gap-2">
                      <span className="text-2xl">🎮</span>
                      Select Gaming Systems You Own
                    </h4>
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
                    
                    {/* Helper text when no gaming systems selected */}
                    {watchShopCategories.includes('video_games') && (() => {
                      const selectedConsoles = form.watch('selectedConsoles') || [];
                      const selectedRetroConsoles = form.watch('selectedRetroConsoles') || [];
                      return selectedConsoles.length === 0 && selectedRetroConsoles.length === 0;
                    })() && (
                      <div className="text-amber-400 text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        Please select at least one gaming system above
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
                          disabled={!hasReadTerms}
                          className="border-slate-500 data-[state=checked]:bg-purple-400 data-[state=checked]:border-purple-400 disabled:opacity-50"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-slate-200 text-base">
                          I agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-purple-400 hover:text-purple-300 font-medium underline decoration-purple-400/50 hover:decoration-purple-300 transition-all duration-200"
                          >
                            Terms & Conditions
                          </button>
                          {!hasReadTerms && (
                            <span className="block text-xs text-amber-400 mt-1">
                              You must read the terms first
                            </span>
                          )}
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

        <TermsDialog open={showTerms} onOpenChange={setShowTerms} onScrollToBottom={handleTermsScrollToBottom} />
      </div>
    </div>
  );
}
