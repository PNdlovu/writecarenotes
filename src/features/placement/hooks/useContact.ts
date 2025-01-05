import { useState } from 'react';
import { z } from 'zod';

export const contactSchema = z.object({
  date: z.string(),
  type: z.string(),
  participants: z.string(),
  duration: z.string(),
  location: z.string(),
  supervision: z.string(),
  outcome: z.string(),
  concerns: z.string().optional(),
  followUp: z.string().optional(),
  notes: z.string().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

export const useContact = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContact = async (data: Contact) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/placement/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create contact record');
      }

      const result = await response.json();
      setContacts([...contacts, result.data]);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (placementId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/placement/contact?placementId=${placementId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const result = await response.json();
      setContacts(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (id: string, data: Partial<Contact>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/placement/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact record');
      }

      const result = await response.json();
      setContacts(contacts.map(c => (c.id === id ? result.data : c)));
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/placement/contact/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact record');
      }

      setContacts(contacts.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    loading,
    error,
    createContact,
    fetchContacts,
    updateContact,
    deleteContact,
  };
};
