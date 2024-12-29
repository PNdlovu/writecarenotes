'use client';

import { useState } from 'react';

export function ResidentList() {
  const [residents, setResidents] = useState([]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Residents</h2>
      {residents.length === 0 ? (
        <p className="text-muted-foreground">No residents found.</p>
      ) : (
        <ul className="divide-y">
          {residents.map((resident: any) => (
            <li key={resident.id} className="py-4">
              {/* Resident details will go here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 