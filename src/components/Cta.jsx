import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function Cta() {
	return (
		<section className="relative py-24" id="cta">
			<div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950  via-black/95 to-black" />

			<div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-[2.5rem] border border-transparent bg-slate-900/40 p-[1px] shadow-[0_30px_80px_-40px_rgba(56,189,248,0.6)]">
					<div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500 opacity-80" />

					<div className="relative flex flex-col items-center gap-8 rounded-[2.45rem] bg-slate-950/95 px-10 py-16 text-center md:px-16">
						<div className="flex items-center justify-center">
							<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-fuchsia-500 text-cyan-50 shadow-[0_18px_45px_-25px_rgba(56,189,248,0.9)]">
								<SparklesIcon className="h-7 w-7" aria-hidden="true" />
							</span>
						</div>

						<h2 className="max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
							Activa tus bots y deja que la IA
							<br className="hidden sm:block" /> compre por ti
						</h2>

						<p className="max-w-2xl text-base text-slate-300/85 md:text-lg">
							Obtén los bots para BNC y Banesco, con pagos en cripto, instalación guiada, soporte técnico, código fuente y actualizaciones. Todo llega a tu correo en minutos tras confirmar la compra.
						</p>

						<div className="flex flex-col items-center gap-4 sm:flex-row">
							<Link
								href="/pricing"
								className="btn btn-lg min-w-[180px] border-0 bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500 px-10 text-base font-semibold text-white shadow-[0_20px_45px_-25px_rgba(56,189,248,0.85)]"
							>
								Comprar bots en cripto →
							</Link>

						</div>

						<p className="text-xs uppercase tracking-[0.3em] text-slate-400/70">
							Entrega automática • Manual + soporte • Actualizaciones incluidas
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
