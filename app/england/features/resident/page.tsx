'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Search } from "lucide-react";
import { residentApi } from "@/features/residents/api/resident-service";
import type { Resident } from "@/features/residents/types";
import { Badge } from "@/components/ui/badge";

export default function ResidentPage() {
  const router = useRouter();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setIsLoading(true);
      const data = await residentApi.getResidents({ search: searchQuery });
      setResidents(data);
    } catch (error) {
      console.error("Failed to fetch residents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchResidents();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleAddResident = () => {
    router.push("/england/features/resident/new");
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "temporary leave":
        return <Badge className="bg-yellow-100 text-yellow-800">Temporary Leave</Badge>;
      case "discharged":
        return <Badge className="bg-red-100 text-red-800">Discharged</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Residents</h1>
        <Button onClick={handleAddResident}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Resident
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search residents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Care Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admission Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : residents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No residents found
                </TableCell>
              </TableRow>
            ) : (
              residents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell>{resident.id}</TableCell>
                  <TableCell>{resident.name}</TableCell>
                  <TableCell>{new Date(resident.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>{resident.room}</TableCell>
                  <TableCell>{resident.careLevel}</TableCell>
                  <TableCell>{getStatusBadge(resident.status)}</TableCell>
                  <TableCell>{new Date(resident.admissionDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
