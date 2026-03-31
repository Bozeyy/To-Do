import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import InstallPWA from "@/components/InstallPWA";
import HomeNav from "@/components/HomeNav";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 w-full glass border-b border-border/40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/icon.png" alt="Logo" className="w-9 h-9 rounded-xl premium-shadow" />
            <span className="font-outfit text-xl font-bold tracking-tight">To-Doux</span>
          </Link>
          
          {session ? (
            <HomeNav />
          ) : (
            <nav>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Se connecter
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="animate-in flex flex-col items-center text-center gap-8">
          {!session && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wide uppercase">
              Productivité Maximale
            </div>
          )}
          
          <h1 className="font-outfit text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl">
            {session ? (
              <>
                <span className="text-gradient">Ravi de vous revoir !</span>
                <br />
                <span className="text-muted-foreground text-4xl md:text-5xl">Gérez vos tâches en toute simplicité.</span>
              </>
            ) : (
              <>
                <span className="text-gradient">Simplifiez votre quotidien,</span>
                <br />
                <span className="text-muted-foreground">une tâche à la fois.</span>
              </>
            )}
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            {session 
              ? "Accédez à vos groupes de tâches ou consultez votre calendrier pour organiser votre journée."
              : "Une interface intuitive et claire pour gérer vos projets, vos courses ou vos idées. Installez-la comme une application native sur tous vos appareils."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            {session ? (
              <>
                <Link href="/dashboard" className="h-14 px-8 rounded-full bg-brand text-brand-foreground font-bold text-lg premium-shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                  Aller à mes Groupes
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/dashboard/calendar" className="h-14 px-8 rounded-full bg-secondary border border-border font-bold text-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
                  Mon Calendrier
                </Link>
              </>
            ) : (
              <Link href="/signup" className="h-14 px-8 rounded-full bg-brand text-brand-foreground font-bold text-lg premium-shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                Commencer Maintenant
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}

            <InstallPWA />
            
            {!session && (
              <button className="h-14 px-8 rounded-full bg-secondary border border-border font-bold text-lg hover:bg-accent transition-colors">
                En savoir plus
              </button>
            )}
          </div>

          {!session && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
              {[
                { title: "Simple", desc: "Une interface épurée sans distractions inutile." },
                { title: "Partout", desc: "Disponible hors-ligne grâce à la technologie PWA." },
                { title: "Gratuit", desc: "Toutes les fonctionnalités sont accessibles gratuitement." },
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card/50 glass hover:border-brand/30 transition-all group">
                  <h3 className="font-outfit text-xl font-bold mb-2 group-hover:text-brand transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-border/40 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            © 2026 To-Doux PWA. Fait avec passion.
          </p>
          {!session && (
            <div className="flex gap-8">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Confidentialité</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Conditions</Link>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
