import Calendar from "@/components/Calendar";

export default function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">
      <div className="mb-6 md:mb-12">
        <h1 className="font-outfit text-2xl md:text-4xl font-extrabold tracking-tight">
          Mon Calendrier
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
          Visualisez vos tâches et gérez votre emploi du temps.
        </p>
      </div>
      
      <Calendar />
    </div>
  );
}
