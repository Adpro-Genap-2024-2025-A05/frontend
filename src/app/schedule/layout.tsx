import NavbarWithSchedule from "@/components/NavbarWithSchedule";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarWithSchedule />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}