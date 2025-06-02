"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { DirectDealCoach } from '@/components/deals/DirectDealCoach';
import { Briefcase } from 'lucide-react';
import type { DealWithRelations } from "@/lib/types";

interface DealCoachAIProps {
  deals: DealWithRelations[]
  onConversationComplete?: () => void
}

export default function DealCoachAI({ deals, onConversationComplete }: DealCoachAIProps) {
  // Initialize with the first deal if available
  const [selectedDealId, setSelectedDealId] = useState<string>(deals && deals.length > 0 ? deals[0].id : "");
  const { toast } = useToast();
  
  // Find the selected deal object
  const selectedDeal = deals.find(deal => deal.id === selectedDealId);

  // Handle deal selection change
  const handleDealChange = (value: string) => {
    setSelectedDealId(value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <Briefcase className="h-5 w-5 mr-2" />
          Deal Coach AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deal Selection */}
        <div className="space-y-2">
          <label htmlFor="deal-select" className="text-sm font-medium">
            Select Deal
          </label>
          <Select
            value={selectedDealId}
            onValueChange={handleDealChange}
          >
            <SelectTrigger id="deal-select">
              <SelectValue placeholder="Select a deal" />
            </SelectTrigger>
            <SelectContent>
              {deals.map((deal) => (
                <SelectItem key={deal.id} value={deal.id}>
                  {/* Handle the field name mismatch between database and code */}
                  {deal.name || deal.title || "Unnamed Deal"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* AI Coach Interface */}
        {selectedDeal ? (
          <div className="h-[500px]">
            <DirectDealCoach deal={selectedDeal} />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Select a deal to start coaching
          </div>
        )}
      </CardContent>
    </Card>
  );
}
