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
        <style>{`
          @keyframes electric-pulse-run {
            0% {
              left: 0%;
              opacity: 0.2;
              box-shadow: 0 0 0 0 rgba(196,181,253,0.08), 0 0 8px rgba(196,181,253,0.18);
            }
            12% {
              opacity: 1;
              left: 12%;
              box-shadow: 0 0 0 5px rgba(196,181,253,0.08), 0 0 18px rgba(196,181,253,0.9);
            }
            28% {
              opacity: 0.92;
              left: 28%;
              box-shadow: 0 0 0 4px rgba(196,181,253,0.08), 0 0 16px rgba(196,181,253,0.78);
            }
            44% {
              opacity: 1;
              left: 46%;
              box-shadow: 0 0 0 5px rgba(196,181,253,0.08), 0 0 18px rgba(196,181,253,0.9);
            }
            60% {
              opacity: 0.92;
              left: 64%;
              box-shadow: 0 0 0 4px rgba(196,181,253,0.08), 0 0 16px rgba(196,181,253,0.78);
            }
            78% {
              opacity: 1;
              left: 82%;
              box-shadow: 0 0 0 5px rgba(196,181,253,0.08), 0 0 18px rgba(196,181,253,0.9);
            }
            100% {
              left: 100%;
              opacity: 0.2;
              box-shadow: 0 0 0 0 rgba(196,181,253,0.08), 0 0 8px rgba(196,181,253,0.18);
            }
          }

          .electric-pulse-orb {
            animation: electric-pulse-run 5.8s linear infinite;
            animation-delay: -1.7s;
            transform-origin: left center;
          }
        `}</style>

        <motion.div
          aria-hidden="true"
          className="absolute inset-[1.5rem] rounded-[3rem] bg-[radial-gradient(circle_at_48%_40%,rgba(124,58,237,0.36),transparent_48%),radial-gradient(circle_at_78%_24%,rgba(56,189,248,0.16),transparent_22%),radial-gradient(circle_at_18%_82%,rgba(99,102,241,0.18),transparent_26%)] blur-2xl"
          animate={{ opacity: [0.42, 0.68, 0.42], scale: [0.99, 1.02, 0.99] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 rounded-[3rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.012),rgba(255,255,255,0.004))]" />
        <div className="absolute inset-0 rounded-[3rem] opacity-[0.028] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:54px_54px]" />

        <Card className="relative overflow-hidden rounded-[2.5rem] border border-violet-300/18 bg-[linear-gradient(180deg,rgba(6,10,20,0.98),rgba(3,5,11,0.98))] shadow-[0_36px_110px_rgba(17,9,40,0.58)] backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.2),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.08),transparent_16%),radial-gradient(circle_at_18%_84%,rgba(59,130,246,0.08),transparent_20%)]" />
          <div className="absolute inset-y-0 right-0 w-24 bg-[linear-gradient(180deg,rgba(124,58,237,0.12),rgba(59,130,246,0.02))] opacity-70 blur-2xl" />

          <CardContent className="relative p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[1.35rem] font-semibold tracking-tight text-white">Doorstroom onder controle</h2>
              </div>
              <div className="rounded-2xl border border-violet-300/24 bg-violet-300/18 px-3 py-2 text-sm font-medium text-white">
                Capaciteit in beoordeling
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] p-4 sm:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),transparent_56%)]" />

              <div className="relative mb-4">
                <div className="relative">
                <div className="absolute left-[5%] right-[5%] top-5 h-px bg-gradient-to-r from-transparent via-violet-200/36 to-transparent" />
                <div className="absolute left-[18%] right-[18%] top-5 h-px bg-gradient-to-r from-transparent via-violet-100/18 to-transparent blur-[0.2px]" />
                  <div className="pointer-events-none absolute left-[5%] right-[5%] top-[16px] h-4 overflow-visible">
                    <div className="electric-pulse-orb absolute top-1/2 h-[2px] w-[8%] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(196,181,253,0),rgba(221,214,254,0.96)_28%,rgba(196,181,253,1)_48%,rgba(167,139,250,0.55)_72%,rgba(196,181,253,0))] blur-[0.35px]" />
                    <div className="electric-pulse-orb absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(221,214,254,0.92)_24%,rgba(167,139,250,0.92)_42%,rgba(124,58,237,0.18)_68%,transparent_72%)] [clip-path:polygon(50%_0%,61%_32%,100%_50%,61%_68%,50%_100%,39%_68%,0_50%,39%_32%)] blur-[0.1px]" />
                  </div>

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
                          className="relative flex h-11 w-11 items-center justify-center rounded-[1.25rem] border border-violet-200/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(30,41,59,0.82))] text-sm font-semibold text-slate-50 shadow-[0_10px_26px_rgba(2,6,23,0.36)]"
                          animate={{
                            boxShadow: [
                              "0 0 0 rgba(124,58,237,0)",
                              index === 1 || index === 2 ? "0 0 26px rgba(124,58,237,0.24)" : "0 0 16px rgba(255,255,255,0.03)",
                              "0 0 0 rgba(124,58,237,0)",
                            ],
                          }}
                          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.6 }}
                        >
                          <div className="absolute inset-0 rounded-[1.25rem] bg-violet-300/7" />
                          {index + 1}
                        </motion.div>

                        <div className="space-y-1 text-center">
                          <span className="hidden text-[11px] font-medium tracking-wide text-slate-200 sm:block">{phase}</span>
                          <div className="mx-auto hidden h-1 w-8 rounded-full bg-violet-200/12 sm:block" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative space-y-1.5 rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-3 sm:p-3.5">
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
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-violet-400/12 text-violet-100 shadow-[0_0_24px_rgba(124,58,237,0.18)]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium leading-5 text-slate-50">{signal.label}</p>
                        <p className="mt-1 text-[13px] leading-5 text-slate-300">{signal.detail}</p>
                      </div>

                      <div className="mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-white/6 sm:w-16">
                        <motion.div
                          className="h-full rounded-full bg-violet-200/80"
                          animate={{ opacity: [0.55, 1, 0.55], scaleX: [0.9, 1, 0.9] }}
                          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 + index * 0.6 }}
                          style={{ transformOrigin: "left center" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[1.45rem] border border-amber-300/24 bg-[linear-gradient(180deg,rgba(251,191,36,0.1),rgba(251,191,36,0.04))] px-4 py-3.5 sm:px-5">
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-5 w-5 text-amber-100" />
                  <div>
                    <p className="font-semibold text-amber-50">Volgende beste actie</p>
                    <p className="mt-1 text-sm leading-6 text-amber-50/95">
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
