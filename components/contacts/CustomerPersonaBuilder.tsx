import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CustomerPersonaForm } from '@/components/contacts/CustomerPersonaForm';
import { CustomerPersonaDisplay } from '@/components/contacts/CustomerPersonaDisplay';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import type { GeneratedPersona, CustomerPersonaInput } from '@/lib/services/persona.service';

export function CustomerPersonaBuilder() {
  const { id: contactId } = useParams();
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<GeneratedPersona[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonas();
  }, [contactId]);

  const fetchPersonas = async () => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/personas`);
      if (!response.ok) throw new Error('Failed to fetch personas');
      const data = await response.json();
      setPersonas(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customer personas',
        variant: 'destructive'
      });
    }
  };

  const handleGeneratePersona = async (inputs: CustomerPersonaInput) => {
    setLoading(true);
    try {
      console.log('Sending request with inputs:', inputs);
      
      const response = await fetch(`/api/contacts/${contactId}/personas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(inputs),  // Send inputs directly, not wrapped in an object
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate persona');
      }
      
      const data = await response.json();
      console.log('Received persona data:', data);
      
      // Add new persona to the list
      setPersonas(prev => [data, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Customer persona generated successfully'
      });
    } catch (error) {
      console.error('Error generating persona:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate customer persona',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Customer Persona Builder</h2>
      
      <Card className="p-6">
        {!loading && (
          <CustomerPersonaForm onSubmit={handleGeneratePersona} />
        )}
      </Card>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {personas.length > 0 && (
        <div className="space-y-4">
          {personas.map((persona, index) => (
            <CustomerPersonaDisplay key={index} persona={persona} />
          ))}
        </div>
      )}

      {personas.length === 0 && !loading && (
        <div className="text-center py-4 text-muted-foreground">
          No personas generated yet
        </div>
      )}
    </div>
  );
}
