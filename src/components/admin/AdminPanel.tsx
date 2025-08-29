'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  whatsapp_country_code: string;
  whatsapp_number: string;
  custom_country_code?: string;
  created_at: string;
}

interface CustomerConsole {
  id: string;
  customer_id: string;
  console_type: string;
  is_retro: boolean;
}

interface CustomerShoppingCategory {
  id: string;
  customer_id: string;
  category: string;
}

interface CustomerWheelSpin {
  id: string;
  customer_id: string;
  has_spun_wheel: boolean;
  spun_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomerPrize {
  id: string;
  customer_id: string;
  prize_type: string;
  prize_value: string;
  is_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
}

export default function AdminPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [consoles, setConsoles] = useState<CustomerConsole[]>([]);
  const [shoppingCategories, setShoppingCategories] = useState<CustomerShoppingCategory[]>([]);
  const [wheelSpins, setWheelSpins] = useState<CustomerWheelSpin[]>([]);
  const [prizes, setPrizes] = useState<CustomerPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterConsole, setFilterConsole] = useState<string>('all');
  const [filterWheelSpin, setFilterWheelSpin] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Available prizes
  const availablePrizes = [
    { type: 'voucher', value: '$10 voucher', label: '$10 Voucher' },
    { type: 'voucher', value: '$5 voucher', label: '$5 Voucher' },
    { type: 'discount', value: '10% off', label: '10% Off' },
    { type: 'voucher', value: '$20 voucher', label: '$20 Voucher' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, full_name, email, whatsapp_country_code, whatsapp_number, created_at')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      const { data: consolesData, error: consolesError } = await supabase
        .from('customer_consoles')
        .select('id, customer_id, console_type, is_retro');

      if (consolesError) throw consolesError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('customer_shopping_categories')
        .select('id, customer_id, category');

      if (categoriesError) throw categoriesError;

      // Fetch wheel spin data
      const { data: wheelSpinsData, error: wheelSpinsError } = await supabase
        .from('customer_wheel_spins')
        .select('*');

      if (wheelSpinsError) {
        logger.warn('Wheel spins table may not exist yet:', wheelSpinsError);
        setWheelSpins([]);
      } else {
        setWheelSpins(wheelSpinsData || []);
      }

      // Fetch prizes data
      const { data: prizesData, error: prizesError } = await supabase
        .from('customer_prizes')
        .select('*');

      if (prizesError) {
        logger.warn('Prizes table may not exist yet:', prizesError);
        setPrizes([]);
      } else {
        setPrizes(prizesData || []);
      }

      setCustomers(customersData || []);
      setConsoles(consolesData || []);
      setShoppingCategories(categoriesData || []);

    } catch (error) {
      logger.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.whatsapp_number.includes(searchTerm);
    
    // If no filters are applied, just return search results
    if (filterCategory === 'all' && filterConsole === 'all' && filterWheelSpin === 'all') {
      return matchesSearch;
    }
    
    // Get customer's related data
    const customerCategories = shoppingCategories
      .filter(cat => cat.customer_id === customer.id)
      .map(cat => cat.category);
    
    const customerConsoles = consoles
      .filter(c => c.customer_id === customer.id)
      .map(c => c.console_type);
    
    const customerWheelSpin = wheelSpins.find(ws => ws.customer_id === customer.id);
    
    let matchesFilters = true;
    
    // Category filter
    if (filterCategory !== 'all') {
      const hasCategory = customerCategories.includes(filterCategory);
      matchesFilters = matchesFilters && hasCategory;
    }
    
    // Console filter
    if (filterConsole !== 'all') {
      const hasConsole = customerConsoles.includes(filterConsole);
      matchesFilters = matchesFilters && hasConsole;
    }

    // Wheel spin filter
    if (filterWheelSpin !== 'all') {
      const hasSpun = customerWheelSpin?.has_spun_wheel || false;
      if (filterWheelSpin === 'spun') {
        matchesFilters = matchesFilters && hasSpun;
      } else if (filterWheelSpin === 'not_spun') {
        matchesFilters = matchesFilters && !hasSpun;
      }
    }
    
    return matchesSearch && matchesFilters;
  });

  const getCustomerConsoles = (customerId: string) => {
    return consoles.filter(c => c.customer_id === customerId);
  };

  const getCustomerCategories = (customerId: string) => {
    return shoppingCategories.filter(cat => cat.customer_id === customerId);
  };

  const getCustomerWheelSpin = (customerId: string) => {
    return wheelSpins.find(ws => ws.customer_id === customerId);
  };

  const getCustomerPrizes = (customerId: string) => {
    return prizes.filter(p => p.customer_id === customerId);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleSaveCustomer = async (updatedCustomer: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          full_name: updatedCustomer.full_name,
          email: updatedCustomer.email,
          whatsapp_number: updatedCustomer.whatsapp_number
        })
        .eq('id', updatedCustomer.id);

      if (error) throw error;

      setCustomers(customers.map(c => 
        c.id === updatedCustomer.id ? updatedCustomer : c
      ));
      setEditingCustomer(null);
    } catch (error) {
      logger.error('Error updating customer:', error);
    }
  };

  const handleWheelSpinToggle = async (customerId: string, hasSpun: boolean) => {
    try {
      const { error } = await supabase.rpc('update_wheel_spin_status', {
        p_customer_id: customerId,
        p_has_spun_wheel: hasSpun
      });

      if (error) throw error;

      // Update local state
      setWheelSpins(prev => {
        const existing = prev.find(ws => ws.customer_id === customerId);
        if (existing) {
          return prev.map(ws => 
            ws.customer_id === customerId 
              ? { ...ws, has_spun_wheel: hasSpun, spun_at: hasSpun ? new Date().toISOString() : null }
              : ws
          );
        } else {
          return [...prev, {
            id: `temp-${customerId}`,
            customer_id: customerId,
            has_spun_wheel: hasSpun,
            spun_at: hasSpun ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
        }
      });

      // If unchecking wheel spin, remove all prizes for this customer
      if (!hasSpun) {
        setPrizes(prev => prev.filter(p => p.customer_id !== customerId));
      }

    } catch (error) {
      logger.error('Error updating wheel spin status:', error);
    }
  };

  const handlePrizeToggle = async (customerId: string, prizeType: string, prizeValue: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        // Add prize - allow multiple prizes per customer
        const { error } = await supabase.rpc('update_customer_prize', {
          p_customer_id: customerId,
          p_prize_type: prizeType,
          p_prize_value: prizeValue
        });

        if (error) throw error;

        // Update local state - always add new prize
        setPrizes(prev => [...prev, {
          id: `temp-${customerId}-${prizeValue}`,
          customer_id: customerId,
          prize_type: prizeType,
          prize_value: prizeValue,
          is_claimed: false,
          claimed_at: null,
          created_at: new Date().toISOString()
        }]);
      } else {
        // Remove specific prize by value
        const { error } = await supabase
          .from('customer_prizes')
          .delete()
          .eq('customer_id', customerId)
          .eq('prize_value', prizeValue);

        if (error) throw error;

        // Update local state
        setPrizes(prev => prev.filter(p => 
          !(p.customer_id === customerId && p.prize_value === prizeValue)
        ));
      }
    } catch (error) {
      logger.error('Error updating prize:', error);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredCustomers.map(customer => {
      const consoles = getCustomerConsoles(customer.id);
      const categories = getCustomerCategories(customer.id);
      const wheelSpin = getCustomerWheelSpin(customer.id);
      const customerPrizes = getCustomerPrizes(customer.id);
      
      return {
        'Full Name': customer.full_name,
        'Email': customer.email,
        'WhatsApp': `${customer.whatsapp_country_code}${customer.whatsapp_number}`,
        'Video Games': categories.filter(c => c.category === 'video_games').map(c => c.category).join(', '),
        'Consoles': consoles.map(c => c.console_type).join(', '),
        'Spun Wheel': wheelSpin?.has_spun_wheel ? 'Yes' : 'No',
        'Wheel Spin Date': wheelSpin?.spun_at ? new Date(wheelSpin.spun_at).toLocaleDateString() : '',
        'Prizes Won': customerPrizes.map(p => p.prize_value).join(', '),
        'Prize Count': customerPrizes.length,
        'Created': customer.created_at
      };
    });

    const csv = convertToCSV(csvData);
    
    let filename = 'play-barbados-customers';
    if (filterCategory !== 'all' || filterConsole !== 'all' || filterWheelSpin !== 'all' || searchTerm) {
      filename += '-filtered';
      if (filterCategory !== 'all') filename += `-${filterCategory}`;
      if (filterConsole !== 'all') filename += `-${filterConsole}`;
      if (filterWheelSpin !== 'all') filename += `-${filterWheelSpin}`;
      if (searchTerm) filename += `-search-${searchTerm}`;
    }
    filename += '.csv';
    
    downloadCSV(csv, filename);
  };

  const exportPrizeWinnersCSV = () => {
    // Get all customers who have won prizes
    const customersWithPrizes = customers.filter(customer => {
      const customerPrizes = getCustomerPrizes(customer.id);
      return customerPrizes.length > 0;
    });

    const csvData = customersWithPrizes.map(customer => {
      const customerPrizes = getCustomerPrizes(customer.id);
      
      return {
        'Full Name': customer.full_name,
        'Email': customer.email,
        'WhatsApp': `${customer.whatsapp_country_code}${customer.whatsapp_number}`,
        'All Prizes Won': customerPrizes.map(p => p.prize_value).join(', '),
        'Prize Count': customerPrizes.length,
        'Created': customer.created_at
      };
    });

    const csv = convertToCSV(csvData);
    const filename = 'play-barbados-all-prize-winners.csv';
    downloadCSV(csv, filename);
  };

  const convertToCSV = (data: Record<string, unknown>[]) => {
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return `"${value}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-emerald-400 mb-4">PLAY Barbados Admin Panel</h1>
          <p className="text-xl text-slate-300">Customer Database Management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">{customers.length}</div>
              <div className="text-slate-300">Total Customers</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{consoles.length}</div>
              <div className="text-slate-300">Console Entries</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400">{shoppingCategories.length}</div>
              <div className="text-slate-300">Category Entries</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {wheelSpins.filter(ws => ws.has_spun_wheel).length}
              </div>
              <div className="text-slate-300">Wheel Spins</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 bg-slate-700 border-slate-600 text-white"
            />
            
            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-600">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="video_games">Video Games</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Console Type Filter */}
            <Select value={filterConsole} onValueChange={setFilterConsole}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by console" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-600">
                <SelectItem value="all">All Consoles</SelectItem>
                <SelectItem value="xboxone">Xbox One</SelectItem>
                <SelectItem value="xbox360">Xbox 360</SelectItem>
                <SelectItem value="ps4">PlayStation 4</SelectItem>
                <SelectItem value="ps5">PlayStation 5</SelectItem>
                <SelectItem value="nintendoswitch">Nintendo Switch</SelectItem>
                <SelectItem value="nintendoswitch2">Nintendo Switch 2</SelectItem>
                <SelectItem value="pc">PC</SelectItem>
                <SelectItem value="retro">Retro</SelectItem>
                <SelectItem value="ps1">PS1</SelectItem>
                <SelectItem value="ps2">PS2</SelectItem>
                <SelectItem value="xbox">Xbox</SelectItem>
                <SelectItem value="psp">PSP</SelectItem>
                <SelectItem value="nintendo64-snes">Nintendo 64/SNES</SelectItem>
                <SelectItem value="nintendo3ds-ds-wii">Nintendo 3DS/DS/WII</SelectItem>
              </SelectContent>
            </Select>

            {/* Wheel Spin Filter */}
            <Select value={filterWheelSpin} onValueChange={setFilterWheelSpin}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by wheel spin" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-600">
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="spun">Spun Wheel</SelectItem>
                <SelectItem value="not_spun">Not Spun Wheel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            {/* Clear Filters Button */}
            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterConsole('all');
                setFilterWheelSpin('all');
              }}
              className="bg-slate-600 hover:bg-slate-500"
            >
              Clear Filters
            </Button>
            
            {/* Export Button */}
            <Button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-500">
              Export to CSV
            </Button>
            
            {/* Prize Export Button */}
            <Button 
              onClick={() => exportPrizeWinnersCSV()}
              className="bg-yellow-600 hover:bg-yellow-500"
            >
              Export Prize Winners
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-emerald-400 mb-2">Debug Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-slate-300">Total Customers:</span>
              <div className="text-white font-semibold">{customers.length}</div>
            </div>
            <div>
              <span className="text-slate-300">Filtered Results:</span>
              <div className="text-white font-semibold">{filteredCustomers.length}</div>
            </div>
            <div>
              <span className="text-slate-300">Active Filters:</span>
              <div className="text-white font-semibold">
                {filterCategory !== 'all' && `Category: ${filterCategory}`}
                {filterConsole !== 'all' && ` Console: ${filterConsole}`}
                {filterWheelSpin !== 'all' && ` Wheel: ${filterWheelSpin}`}
                {filterCategory === 'all' && filterConsole === 'all' && filterWheelSpin === 'all' && 'None'}
              </div>
            </div>
            <div>
              <span className="text-slate-300">Search Term:</span>
              <div className="text-white font-semibold">{searchTerm || 'None'}</div>
            </div>
            <div>
              <span className="text-slate-300">Wheel Spins:</span>
              <div className="text-white font-semibold">
                {wheelSpins.filter(ws => ws.has_spun_wheel).length} / {customers.length}
              </div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-400">Customer Database</CardTitle>
            <CardDescription className="text-slate-300">
              {filteredCustomers.length} customers found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCustomers.map((customer) => {
                const customerWheelSpin = getCustomerWheelSpin(customer.id);
                const customerPrizes = getCustomerPrizes(customer.id);
                const hasSpunWheel = customerWheelSpin?.has_spun_wheel || false;

                return (
                  <div key={customer.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600" data-customer-id={customer.id}>
                    {editingCustomer?.id === customer.id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-white">Editing: {customer.full_name}</h3>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveCustomer(editingCustomer)}
                              className="bg-emerald-600 hover:bg-emerald-500"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingCustomer(null)}
                              className="bg-slate-600 hover:bg-slate-500"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="full-name" className="text-sm font-medium text-slate-200">Full Name</label>
                            <Input
                              id="full-name"
                              value={editingCustomer.full_name}
                              onChange={(e) => setEditingCustomer({
                                ...editingCustomer,
                                full_name: e.target.value
                              })}
                              className="mt-1 bg-slate-600 border-slate-500 text-white"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="text-sm font-medium text-slate-200">Email</label>
                            <Input
                              id="email"
                              value={editingCustomer.email}
                              onChange={(e) => setEditingCustomer({
                                ...editingCustomer,
                                email: e.target.value
                              })}
                              className="mt-1 bg-slate-600 border-slate-500 text-white"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="whatsapp-number" className="text-sm font-medium text-slate-200">WhatsApp Number</label>
                            <Input
                              id="whatsapp-number"
                              value={editingCustomer.whatsapp_number}
                              onChange={(e) => setEditingCustomer({
                                ...editingCustomer,
                                whatsapp_number: e.target.value
                              })}
                              className="mt-1 bg-slate-600 border-slate-500 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold text-white">{customer.full_name}</h3>
                            </div>
                            <p className="text-slate-300">
                               {customer.whatsapp_country_code}{customer.whatsapp_number}
                            </p>
                            <p className="text-slate-400 text-sm">
                               {customer.email}
                            </p>
                            <p className="text-slate-400 text-sm">
                              Created: {new Date(customer.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleEditCustomer(customer)}
                            className="bg-blue-600 hover:bg-blue-500"
                          >
                            Edit
                          </Button>
                        </div>
                        
                        {/* Wheel Spin Section */}
                        <div className="mb-4 p-3 bg-slate-600/30 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Checkbox
                              id={`wheel-spin-${customer.id}`}
                              checked={hasSpunWheel}
                              onCheckedChange={(checked) => 
                                handleWheelSpinToggle(customer.id, checked as boolean)
                              }
                              className="data-[state=checked]:bg-emerald-600"
                            />
                            <label 
                              htmlFor={`wheel-spin-${customer.id}`}
                              className="text-emerald-400 font-semibold cursor-pointer"
                            >
                              Customer spun the wheel
                            </label>
                            {hasSpunWheel && customerWheelSpin?.spun_at && (
                              <span className="text-slate-400 text-sm">
                                ({new Date(customerWheelSpin.spun_at).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                          
                          {/* Prize Selection - Only show if wheel was spun */}
                          {hasSpunWheel && (
                            <div className="ml-6 space-y-2">
                              <p className="text-slate-300 text-sm font-medium">Prizes won:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                 {availablePrizes.map((prize) => {
                                   const isSelected = customerPrizes.some(p => 
                                     p.prize_value === prize.value
                                   );
                                   
                                   return (
                                     <div key={prize.value} className="flex items-center gap-2">
                                       <Checkbox
                                         id={`prize-${customer.id}-${prize.value}`}
                                         checked={isSelected}
                                         onCheckedChange={(checked) => 
                                           handlePrizeToggle(customer.id, prize.type, prize.value, checked as boolean)
                                         }
                                         className="data-[state=checked]:bg-yellow-600"
                                       />
                                       <label 
                                         htmlFor={`prize-${customer.id}-${prize.value}`}
                                         className="text-slate-200 text-sm cursor-pointer"
                                       >
                                         {prize.label}
                                       </label>
                                     </div>
                                   );
                                 })}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-emerald-400 font-semibold">Categories:</span>
                            <div className="text-slate-300">
                              {getCustomerCategories(customer.id).map(cat => (
                                <span key={cat.id} className="inline-block bg-slate-600 px-2 py-1 rounded mr-2 mb-1">
                                  {cat.category === 'video_games' ? '🎮 Video Games' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-emerald-400 font-semibold">Consoles:</span>
                            <div className="text-slate-300">
                              {getCustomerConsoles(customer.id).map(console => (
                                <span key={console.id} className="inline-block bg-slate-600 px-2 py-1 rounded mr-2 mb-1">
                                  {console.console_type}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-emerald-400 font-semibold">Prizes:</span>
                            <div className="text-slate-300">
                              {customerPrizes.length > 0 ? (
                                customerPrizes.map(prize => (
                                  <span key={prize.id} className="inline-block bg-yellow-600/30 border border-yellow-500 px-2 py-1 rounded mr-2 mb-1">
                                    {prize.prize_value}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500">None</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
