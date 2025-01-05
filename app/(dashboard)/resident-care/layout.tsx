export default function ResidentCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resident Care</h1>
      </div>
      {children}
    </div>
  );
} 
