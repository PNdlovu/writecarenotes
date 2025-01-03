export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compliance & Quality</h1>
      </div>
      {children}
    </div>
  );
} 
