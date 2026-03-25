import Calendar from "@/components/Calendar";

export default function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="font-outfit text-4xl font-extrabold tracking-tight">
          Mon Calendrier
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualisez vos tâches et gérez votre emploi du temps.
        </p>
      </div>
      
      <Calendar />
    </div>
  );
}
