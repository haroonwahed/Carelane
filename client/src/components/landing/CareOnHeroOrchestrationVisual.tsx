import { motion } from "framer-motion";
import { Activity, Clock3, GitBranch, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const phases = ["Aanmelding", "Matching", "Beoordeling", "Plaatsing", "Opvolging"];

const signals = [
  {
    label: "3 aanbieders beoordelen plaatsing",
    detail: "Relevante reacties blijven zichtbaar en uitlegbaar.",
    icon: GitBranch,
  },
  {
    label: "2 casussen wachten op capaciteit",
    detail: "Schaarste blijft expliciet zonder extra ruis.",
    icon: Clock3,
  },
  {
    label: "4 intakegesprekken ingepland",
    detail: "Overdracht kan gecontroleerd doorstromen.",
    icon: ShieldCheck,
  },
];

export function CareOnHeroOrchestrationVisual() {
  return (
    <div aria-hidden="true" className="pointer-events-none hidden w-full max-w-[780px] lg:block lg:justify-self-end lg:self-center lg:pl-2">
      <div className="relative min-h-[560px] w-full">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_52%_42%,rgba(124,58,237,0.22),transparent_54%),radial-gradient(circle_at_28%_72%,rgba(59,130,246,0.12),transparent_28%)] blur-3xl"
          animate={{ opacity: [0.2, 0.34, 0.2], scale: [0.985, 1.025, 0.985] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 rounded-[3rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.006))] opacity-60" />
        <div className="absolute inset-0 rounded-[3rem] opacity-[0.042] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />

        <Card className="relative overflow-hidden rounded-[2.5rem] border-white/6 bg-[linear-gradient(180deg,rgba(11,16,32,0.66),rgba(4,8,18,0.92))] shadow-[0_26px_90px_rgba(76,29,149,0.22)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.14),transparent_36%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.05),transparent_18%)]" />

          <CardContent className="relative p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[1.35rem] font-semibold tracking-tight text-white">Doorstroom onder controle</h2>
              </div>
              <div className="rounded-2xl border border-violet-300/10 bg-violet-300/8 px-3 py-2 text-sm text-violet-100/90">
                Capaciteit in beoordeling
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.012))] p-4 sm:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1),transparent_62%)]" />

              <div className="relative mb-4">
                <div className="relative">
                  <div className="absolute left-[5%] right-[5%] top-5 h-px bg-gradient-to-r from-transparent via-violet-200/26 to-transparent" />
                  <div className="absolute left-[18%] right-[18%] top-5 h-px bg-gradient-to-r from-transparent via-violet-100/12 to-transparent blur-[0.2px]" />
                  <motion.div
                    className="absolute left-[5%] top-[18px] h-3 w-3 rounded-full bg-violet-300 shadow-[0_0_30px_rgba(196,181,253,0.92)]"
                    animate={{ opacity: [0, 1, 1, 1, 0], x: ["0%", "24%", "50%", "78%"] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="relative grid grid-cols-5 gap-1 sm:gap-1.5">
                    {phases.map((phase, index) => (
                      <motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 + index * 0.06 }}
                        className="relative flex flex-col items-center gap-2.5"
                      >
                        <motion.div
                          className="relative flex h-11 w-11 items-center justify-center rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.68))] text-sm font-semibold text-slate-100 shadow-[0_8px_24px_rgba(2,6,23,0.28)]"
                          animate={{
                            boxShadow: [
                              "0 0 0 rgba(124,58,237,0)",
                              index === 1 || index === 2 ? "0 0 26px rgba(124,58,237,0.24)" : "0 0 16px rgba(255,255,255,0.03)",
                              "0 0 0 rgba(124,58,237,0)",
                            ],
                          }}
                          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.6 }}
                        >
                          <div className="absolute inset-0 rounded-[1.25rem] bg-violet-400/4" />
                          {index + 1}
                        </motion.div>

                        <div className="space-y-1 text-center">
                          <span className="hidden text-[11px] font-medium tracking-wide text-slate-300 sm:block">{phase}</span>
                          <div className="mx-auto hidden h-1 w-8 rounded-full bg-white/8 sm:block" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative space-y-1.5 rounded-[1.6rem] border border-white/6 bg-white/[0.018] p-3 sm:p-3.5">
                {signals.map((signal, index) => {
                  const Icon = signal.icon;
                  return (
                    <motion.div
                      key={signal.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.34 + index * 0.08 }}
                      className="group relative flex items-start gap-4 rounded-[1.35rem] px-1 py-2.25 transition duration-500"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-violet-400/9 text-violet-200 shadow-[0_0_24px_rgba(124,58,237,0.12)]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium leading-5 text-slate-100">{signal.label}</p>
                        <p className="mt-1 text-[13px] leading-5 text-slate-400">{signal.detail}</p>
                      </div>

                      <div className="mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-white/4 sm:w-16">
                        <motion.div
                          className="h-full rounded-full bg-violet-300/70"
                          animate={{ opacity: [0.55, 1, 0.55], scaleX: [0.9, 1, 0.9] }}
                          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 + index * 0.6 }}
                          style={{ transformOrigin: "left center" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[1.45rem] border border-amber-300/10 bg-[linear-gradient(180deg,rgba(251,191,36,0.055),rgba(251,191,36,0.02))] px-4 py-3.5 sm:px-5">
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-5 w-5 text-amber-200" />
                  <div>
                    <p className="font-medium text-amber-100">Volgende beste actie</p>
                    <p className="mt-1 text-sm leading-6 text-amber-100/70">
                      Valideer 3 casussen waar arrangement en financiering nog bevestigd moeten worden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
