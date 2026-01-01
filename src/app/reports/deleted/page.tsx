import BackToDashboard from "@/components/back-to-dashboard";

export default function DeletedReportPage() {
  return (
    <main className="min-h-screen bg-white text-black px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <BackToDashboard />
        <h1 className="mt-6 text-2xl font-semibold">Deleted Emails</h1>
      </div>
    </main>
  );
}
