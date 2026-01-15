'use client';

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import LoginModal from '@/components/modals/LoginModal';
import PaymentModal from '@/components/modals/PaymentModal';
import PendingPurchasesModal from '@/components/modals/PendingPurchasesModal';
import toast from 'react-hot-toast';

const plans = [
  {
    name: "Bot BNC",
    price: "$150",
    description: "Automatiza tus compras de dólares en Banco Nacional de Crédito con lógica IA lista para usar.",
    highlight: "IDEAL SI SOLO OPERAS EN BNC",
    features: [
      "Compra automática entre $100 y $500 mensuales a tasa BCV",
      "Manual de instalación + video paso a paso",
      "Acceso a código fuente y parámetros editables",
      "Soporte técnico para instalación y actualizaciones"
    ],
    ctaLabel: "Comprar Bot BNC",
    gradient: "from-sky-400 via-blue-500 to-fuchsia-500"
  },
  {
    name: "Bot Banesco",
    price: "$150",
    description: "IA que gestiona el ciclo completo de compra en Banesco de forma veloz y segura.",
    highlight: "OPTIMIZADO PARA CLIENTES BANESCO",
    features: [
      "Compra automática entre $100 y $500 mensuales a tasa BCV",
      "Manual de instalación + video paso a paso",
      "Configuración guiada y tips de rendimiento",
      "Soporte técnico para instalación y actualizaciones"
    ],
    ctaLabel: "Comprar Bot Banesco",
    gradient: "from-fuchsia-500 via-pink-500 to-sky-500"
  },
  {
    name: "Paquete Ultimate Bot",
    price: {
      current: "$249",
      previous: "Antes $300",
      discount: "20% de descuento"
    },
    description: "Los dos bots trabajando juntos para automatizar cada compra y multiplicar tus resultados cambiarios.",
    highlight: "PAQUETE MÁS COMPLETO",
    features: [
      "Compra automática entre $200 y $1000 mensuales a tasa BCV",
      "Configuracion guiada de ambos bots",
      "Entrega inmediata por correo con manuales y código",
      "Actualizaciones y soporte para instalación + regalo especial"
    ],
    ctaLabel: "Comprar Paquete Ultimate",
    gradient: "from-sky-400 via-cyan-500 to-emerald-400",
    popular: true
  }
];

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPendingPurchasesModalOpen, setIsPendingPurchasesModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  
  const supabase = createClient();

  // Verificar sesión al cargar
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Procesar plan pendiente después del login
  useEffect(() => {
    if (user) {
      const pendingPlan = localStorage.getItem('pendingPlan');
      if (pendingPlan) {
        localStorage.removeItem('pendingPlan'); // Limpiar
        // Pequeño delay para asegurar que la UI está lista
        setTimeout(() => {
          createPurchase(pendingPlan);
        }, 500);
      }
    }
  }, [user]); // Se ejecuta cuando user cambia

  const handlePlanClick = async (planName) => {
    setSelectedPlan(planName);

    // Si no hay usuario, abrir modal de login
    if (!user) {
      // Guardar el plan en localStorage para recuperarlo después del login
      localStorage.setItem('pendingPlan', planName);
      setIsLoginModalOpen(true);
      return;
    }

    // Si hay usuario, crear compra directamente
    await createPurchase(planName);
  };

  const handleLoginSuccess = async () => {
    setIsLoginModalOpen(false);
    
    // Esperar un momento para que el estado se actualice
    setTimeout(async () => {
      if (selectedPlan) {
        await createPurchase(selectedPlan);
      }
    }, 500);
  };

  const createPurchase = async (planName) => {
    setIsCreatingPurchase(true);
    const loadingToast = toast.loading('Creando orden de pago...');

    try {
      const response = await fetch('/api/purchase/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planName }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay demasiadas compras pendientes, abrir modal de gestión
        if (response.status === 429) {
          toast.error('Ya tienes una compra pendiente', { id: loadingToast });
          setIsPendingPurchasesModalOpen(true);
          return;
        }
        
        throw new Error(data.error || 'Error al crear la compra');
      }

      if (data.success) {
        toast.success('Orden creada exitosamente', { id: loadingToast });
        setCurrentPurchase({
          ...data.purchase,
          plan: planName,
        });
        setIsPaymentModalOpen(true);
      }
    } catch (error) {
      // Error guardado en BD por el backend
      toast.error(error.message || 'Error al procesar la compra. Por favor intenta de nuevo.', { id: loadingToast });
    } finally {
      setIsCreatingPurchase(false);
    }
  };

  const handleViewPaymentFromModal = (purchase) => {
    setCurrentPurchase(purchase);
    setIsPaymentModalOpen(true);
  };

  return (
    <section className="relative min-h-screen py-24 text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black/95 to-slate-950" />

      <Link
        href="/"
        aria-label="Volver al inicio"
        className="group fixed left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-slate-100 shadow-[0_20px_45px_-30px_rgba(56,189,248,0.75)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-white"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500 text-white transition-transform duration-300 group-hover:-translate-x-0.5">
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Volver</span>
      </Link>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 px-6 text-center lg:px-8">
        <header className="space-y-4 max-w-3xl">
          <span className="badge badge-outline badge-primary border-primary/60 bg-primary/10 px-4 py-3 text-xs font-semibold tracking-[0.35em] uppercase">
            Planes y licencias
          </span>
          <h1 className="text-3xl font-black md:text-5xl">
            Elige tus bots cambiarios y paga en cripto
          </h1>
          <p className="text-base text-slate-300/80 md:text-lg">
            Cada licencia incluye instalación guiada, soporte técnico, código fuente y actualizaciones continuas. Recibes todo
            automáticamente en tu correo al completar el pago.
          </p>
        </header>

        <div className="grid w-full gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-transparent bg-slate-900/40 p-[1px] shadow-[0_25px_60px_-25px_rgba(56,189,248,0.55)] ${
                plan.popular ? "scale-[1.01]" : ""
              }`}
            >
              <div
                className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r ${plan.gradient} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative flex h-full flex-col rounded-3xl bg-slate-950/90 px-8 py-10 text-left transition-transform duration-300 group-hover:-translate-y-1">
                <div className="mb-6 flex items-baseline justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold md:text-3xl">{plan.name}</h2>
                    <p className="mt-1 text-xs tracking-[0.35em] text-cyan-200/70">
                      {plan.highlight}
                    </p>
                  </div>
                  {typeof plan.price === "string" ? (
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-fuchsia-400">
                      {plan.price}
                    </span>
                  ) : (
                    <div className="flex flex-col items-end text-right">
                      <span className="text-lg text-slate-500/70 line-through">{plan.price.previous}</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-emerald-400">
                        {plan.price.current}
                                      </span>
                                     
                      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">
                         Ahora <br /> {plan.price.discount}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-300/80 md:text-base">{plan.description}</p>

                <ul className="mt-8 space-y-4 text-sm text-slate-200/85 md:text-base">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gradient-to-r from-sky-400/80 via-blue-500/80 to-fuchsia-500/80 text-xs font-semibold text-white">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-1 items-end">
                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={isCreatingPurchase}
                    className="btn btn-primary w-full border-0 bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500 text-base font-semibold text-white disabled:opacity-50"
                  >
                    {isCreatingPurchase && selectedPlan === plan.name ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Procesando...
                      </>
                    ) : (
                      plan.ctaLabel
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-slate-400/70">
          Licencias perpetuas • Entrega automática por correo • Soporte incluido
        </p>
      </div>

      {/* Modales */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          // Limpiar plan pendiente si el usuario cierra el modal sin hacer login
          localStorage.removeItem('pendingPlan');
        }}
        onSuccess={handleLoginSuccess}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setCurrentPurchase(null);
          setSelectedPlan(null);
        }}
        purchase={currentPurchase}
      />

      {/* Modal de compras pendientes (solo se abre al intentar crear nueva compra con límite alcanzado) */}
      <PendingPurchasesModal 
        isOpen={isPendingPurchasesModalOpen}
        onClose={() => {
          setIsPendingPurchasesModalOpen(false);
          setSelectedPlan(null);
        }}
        onViewPayment={handleViewPaymentFromModal}
      />
    </section>
  );
} 
