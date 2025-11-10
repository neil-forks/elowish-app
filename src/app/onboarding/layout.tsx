export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy-800">Elowish</h1>
          <p className="text-gray-600 mt-2">Your Family's Gift HQ</p>
        </div>
        {children}
      </div>
    </div>
  );
}