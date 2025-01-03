export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Management</h1>
      </div>
      {children}
    </div>
  );
} 
