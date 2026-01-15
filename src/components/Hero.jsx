
import Link from "next/link";

const stats = [
  { value: "Soporte para", label: "BNC y Banesco" },
  { value: "10 MIN", label: "Configuración inicial" },
  { value: "Entrega 100%", label: "Automática por correo" },
];

export default function Hero() {
  return (
    <section
      className="hero min-h-screen text-white"
      style={{
        backgroundImage: "url(/hero-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hero-overlay bg-gradient-to-b from-black/90 via-70% via-black/90 to-black"></div>

      <div className="hero-content w-full max-w-5xl flex-col text-center gap-8">
        <span className="badge badge-outline badge-primary border-primary/60 bg-primary/10 px-4 py-3 text-xs font-semibold tracking-[0.35em] uppercase">
          Automatización cambiaria con IA
        </span>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500">
            Bots de IA
          </span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500">
            para comprar dólares BCV
          </span>
        </h1>

        <p className="text-base md:text-xl text-slate-200/80 max-w-2xl mx-auto">
          Nuestros bots autónomos para BNC y Banesco inician sesión, compran dólares al tipo BCV y se ajustan a tus
          parámetros. Configúralos en minutos, paga en cripto y recibe manuales, soporte, código fuente y tips directamente en tu correo.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/pricing"
            className="btn btn-primary btn-lg px-8 text-base bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500 border-0"
          >
            Comprar bots ahora →
          </Link>
          <Link
            href="/pricing"
            className="btn btn-outline btn-lg px-8 text-base text-slate-200 border-slate-200/40 hover:bg-slate-200/10"
          >
            Ver funcionalidades
          </Link>
        </div>

        <div className="flex w-full flex-wrap justify-center gap-4 sm:gap-6">
          {stats.map((item) => (
            <div
              key={item.label}
              className="card w-32 lg:w-64 bg-slate-900/60 border border-slate-700/40 backdrop-blur-md shadow-lg"
            >
              <div className="card-body items-center text-center gap-2">
                <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500">
                  {item.value}
                </p>
                <p className="text-xs md:text-sm uppercase tracking-wide text-slate-300/70">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

