import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiagnosticModal({ isOpen, onClose }: DiagnosticModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-[#0A0A0A] border border-border/50 rounded-3xl p-8 lg:p-12 shadow-2xl overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-primary transition-colors">
          <X className="size-6" />
        </button>

        {/* Header */}
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Diagnóstico Inicial</h2>
          <p className="mt-4 text-base font-light text-muted-foreground max-w-lg">
            Responda algumas perguntas para entendermos o momento atual da sua empresa e os principais gargalos de crescimento.
          </p>
          
          {/* Progress Bar */}
          <div className="mt-8 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: s <= step ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
            {step === 1 && <div className="text-white">Etapa 1: Sobre a empresa</div>}
            {step === 2 && <div className="text-white">Etapa 2: Faturamento</div>}
            {step === 3 && <div className="text-white">Etapa 3: Gestão</div>}
            {step === 4 && <div className="text-white">Etapa 4: Dores</div>}
            {step === 5 && <div className="text-white">Etapa 5: Contato</div>}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border/50">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="size-4" /> Voltar
          </button>
          
          <button 
            onClick={() => setStep(s => s < totalSteps ? s + 1 : s)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            {step === totalSteps ? "Concluir" : "Próximo"} <ChevronRight className="size-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
