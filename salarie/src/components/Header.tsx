export default function Header() {
  return (
    <header className="bg-navy text-white py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold flex items-center justify-center">
          <span className="text-navy font-bold text-lg tracking-tight">KE</span>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">
            Simulateur de Charges Salariales
          </h1>
          <p className="text-gold text-sm font-medium">
            Cabinet Krief Expertise · ירושלים · שכיר
          </p>
        </div>
      </div>
    </header>
  );
}
