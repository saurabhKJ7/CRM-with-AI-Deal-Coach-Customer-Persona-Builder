import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CustomerPersonaForm } from '@/components/contacts/CustomerPersonaForm';
import { CustomerPersonaDisplay } from '@/components/contacts/CustomerPersonaDisplay';
import { Card } from '@/components/ui/card';
import { Loader2, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GeneratedPersona, CustomerPersonaInput } from '@/lib/services/persona.service';

// Interface for database personas returned from the API
interface DatabasePersona {
  id: string;
  contact_id: string;
  inputs: any;
  generated_persona: GeneratedPersona;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  companies?: {
    id: string;
    name: string;
  } | null;
  [key: string]: any;
}

export function CustomerPersonaBuilder({ contact }: { contact: Contact }) {
  const { id: contactId } = useParams();
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<DatabasePersona[]>([]);
  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      
      // Select the newly added persona and open the dialog
      setSelectedPersonaIndex(0);
      setIsDialogOpen(true);
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Persona Form */}
        <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm col-span-2 h-full min-h-[800px] flex flex-col">
          <Card className="p-6 border-0 shadow-md bg-white h-full flex flex-col">
            <h3 className="text-lg font-medium mb-6 text-blue-800">Generate New Persona</h3>
            {!loading ? (
              <CustomerPersonaForm 
                onSubmit={handleGeneratePersona} 
                contactData={{
                  name: `${contact.first_name} ${contact.last_name}`,
                  jobTitle: contact.job_title || '',
                  company: contact.companies?.name || ''
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                <p className="text-gray-500 text-sm">Generating persona...</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Persona List */}
        <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm">
          <Card className="p-6 border-0 shadow-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-purple-800">Saved Personas</h3>
              <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{personas.length} personas</span>
            </div>
            
            {personas.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {personas.map((persona, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-md cursor-pointer border ${selectedPersonaIndex === index ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                      onClick={() => {
                        setSelectedPersonaIndex(index);
                        setIsDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-lg">{persona.generated_persona.profile.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-purple-100 p-3 rounded-full mb-3">
                  <User className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-gray-500 mb-1">No personas created yet</p>
                <p className="text-sm text-gray-400">Fill out the form to generate a persona</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Persona Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Customer Persona Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)]">
            <div className="p-4">
              {selectedPersonaIndex !== null && (
                <CustomerPersonaDisplay persona={personas[selectedPersonaIndex]} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
