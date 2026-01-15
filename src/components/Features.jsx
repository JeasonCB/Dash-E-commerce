import {
	ArrowTrendingUpIcon,
	BoltIcon,
	CpuChipIcon,
	LockClosedIcon,
	ShieldCheckIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";

const features = [
	{
		title: "IA autónoma",
		description:
			"El motor inteligente analiza horarios, cupos y condiciones para decidir cuándo comprar sin intervención manual.",
		icon: CpuChipIcon,
		gradient: "from-cyan-400 via-sky-500 to-fuchsia-500",
	},
	{
		title: "Operación relámpago",
		description:
			"Los bots acceden al banco, validan saldo y ejecutan la compra en segundos cuando detectan disponibilidad a tasa BCV.",
		icon: BoltIcon,
		gradient: "from-fuchsia-500 via-pink-500 to-sky-500",
	},
	{
		title: "Credenciales protegidas",
		description:
			"Tus datos quedan en tu equipo. El acceso se maneja de forma local y cifrada, sin subir información sensible a la nube.",
		icon: LockClosedIcon,
		gradient: "from-sky-400 via-blue-500 to-purple-500",
	},
	{
		title: "Configuración guiada",
		description:
			"Incluye manual desde cero, video tutoriales y tips para definir montos, horarios y cuentas según tu estrategia.",
		icon: SparklesIcon,
		gradient: "from-purple-500 via-fuchsia-500 to-cyan-400",
	},
	{
		title: "Soporte y upgrades",
		description:
			"Accede a soporte técnico personalizado, actualizaciones de versiones y mejoras continuas incluidas en tu compra.",
		icon: ShieldCheckIcon,
		gradient: "from-sky-400 via-cyan-500 to-emerald-400",
	},
	{
		title: "Escala sin límites",
		description:
			"Agrega más cuentas, replica bots y ajusta reglas para cubrir todo tu flujo cambiario a la velocidad que necesites.",
		icon: ArrowTrendingUpIcon,
		gradient: "from-pink-500 via-fuchsia-500 to-sky-500",
	},
];

export default function Features() {
	return (
		<section className="relative py-24" id="features">
			<div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black/95 to-slate-950" />

			<div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 px-6 text-center lg:px-8">
				<header className="space-y-4 max-w-3xl">
					<p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300/80">
						Beneficios clave
					</p>
					<h2 className="text-3xl font-black text-white md:text-5xl">Automatiza tus dólares BCV sin fricción</h2>
					<p className="text-base text-slate-300/80 md:text-lg">
						Desde la instalación hasta las actualizaciones, cada bot está diseñado para que compres divisas en BNC y Banesco sin filas, sin estrés y pagando cómodamente en cripto.
					</p>
				</header>

				<div className="grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3">
					{features.map((feature) => {
						const Icon = feature.icon;
						return (
							<article
								key={feature.title}
								className="group relative overflow-hidden rounded-3xl border border-transparent bg-slate-900/40 p-[1px] shadow-[0_25px_60px_-25px_rgba(56,189,248,0.55)]"
							>
								<div
									className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
								/>

								<div className="relative h-full rounded-3xl bg-slate-950/90 px-8 py-10 text-left transition-transform duration-300 group-hover:-translate-y-1">
									<div
										className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-[0_15px_40px_-20px_rgba(59,130,246,0.8)]`}
									>
										<Icon className="h-8 w-8 text-white drop-shadow-[0_6px_20px_rgba(15,118,250,0.45)]" aria-hidden="true" />
									</div>

									<h3 className="text-xl font-semibold text-white md:text-2xl">{feature.title}</h3>
									<p className="mt-3 text-sm leading-relaxed text-slate-300/80 md:text-base">{feature.description}</p>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
