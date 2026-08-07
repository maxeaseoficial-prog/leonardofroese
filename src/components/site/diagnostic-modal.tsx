import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Building2, Landmark, Briefcase, AlertCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DiagnosticData = {
  empresa: {
    nome: string;
    segmento: string;
    cidade: string;
    colaboradores: string;
    tempoEmpresa: string;
  };
  financeiro: {
    faturamentoMensal: string;
    lucroConsistente: string;
  };
  gestao: {
    dependenciaDono: number;
    indicadores: number;
    financeiro: number;
    comercial: number;
    lideranca: number;
  };
  dores: string[];
  principalProblema: string;
  contato: {
    nome: string;
    cargo: string;
    telefone: string;
    email: string;
    autorizo: boolean;
  };
};

const initialData: DiagnosticData = {
  empresa: { nome: "", segmento: "", cidade: "", colaboradores: "", tempoEmpresa: "" },
  financeiro: { faturamentoMensal: "", lucroConsistente: "" },
  gestao: { dependenciaDono: 3, indicadores: 3, financeiro: 3, comercial: 3, lideranca: 3 },
  dores: [],
  principalProblema: "",
  contato: { nome: "", cargo: "", telefone: "", email: "", autorizo: false }
};

const steps = [
  { id: "empresa", label: "01 Empresa", icon: Building2 },
  { id: "faturamento", label: "02 Faturamento", icon: Landmark },
  { id: "gestao", label: "03 Gestão", icon: Briefcase },
  { id: "dores", label: "04 Dores", icon: AlertCircle },
  { id: "contato", label: "05 Contato", icon: Phone },
];

export function DiagnosticModal({ isOpen, onClose }: DiagnosticModalProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<DiagnosticData>(() => {
    const saved = localStorage.getItem("caliber_diagnostic_draft");
    return saved ? JSON.parse(saved) : initialData;
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isSubmitted) {
      localStorage.setItem("caliber_diagnostic_draft", JSON.stringify(data));
    }
  }, [data, isSubmitted]);

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = () => {
    console.log("Diagnostic Final Data:", data);
    // TODO: Futura integração com API/E-mail aqui
    // Exemplo: await fetch('/api/public/diagnostic', { method: 'POST', body: JSON.stringify(data) });
    setIsSubmitted(true);
    localStorage.removeItem("caliber_diagnostic_draft");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md overflow-y-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/5 rounded-[2rem] p-6 lg:p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all z-10"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">Diagnóstico Inicial</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Raio-X Empresarial</h2>
                <p className="mt-3 text-sm font-light text-muted-foreground max-w-xl">
                  Entenda os principais gargalos que travam o crescimento da sua empresa hoje.
                </p>
                
                {/* Progress Tracker */}
                <div className="mt-12">
                  <div className="flex justify-between mb-4">
                    {steps.map((s, i) => (
                      <div key={s.id} className={cn(
                        "flex flex-col items-center gap-2 transition-colors duration-500",
                        step > i ? "text-primary" : "text-muted-foreground/40"
                      )}>
                        <s.icon className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{s.label.split(' ')[1]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_oklch(0.83_0.121_82.5/0.4)]"
                      initial={false}
                      animate={{ width: `${(step / steps.length) * 100}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="min-h-[450px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 1 && (
                      <div className="space-y-8">
                        <h3 className="text-xl font-semibold text-white">Vamos começar pela sua empresa.</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Input label="Nome da empresa" value={data.empresa.nome} onChange={v => setData({...data, empresa: {...data.empresa, nome: v}})} placeholder="Ex: Cáliber Gestão" />
                          <Input label="Segmento" value={data.empresa.segmento} onChange={v => setData({...data, empresa: {...data.empresa, segmento: v}})} placeholder="Ex: Serviços, Varejo..." />
                          <Input label="Cidade / Estado" value={data.empresa.cidade} onChange={v => setData({...data, empresa: {...data.empresa, cidade: v}})} placeholder="Ex: São Paulo, SP" />
                          <Input label="Tempo de empresa" value={data.empresa.tempoEmpresa} onChange={v => setData({...data, empresa: {...data.empresa, tempoEmpresa: v}})} placeholder="Ex: 5 anos" />
                        </div>
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-muted-foreground">Número aproximado de colaboradores</label>
                          <div className="flex flex-wrap gap-3">
                            {['1–5', '6–15', '16–30', '31–50', '51–100', '100+'].map(opt => (
                              <Chip key={opt} active={data.empresa.colaboradores === opt} onClick={() => setData({...data, empresa: {...data.empresa, colaboradores: opt}})}>{opt}</Chip>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-10">
                        <h3 className="text-xl font-semibold text-white">Qual é o tamanho atual da sua operação?</h3>
                        <div className="space-y-6">
                          <label className="text-sm font-medium text-muted-foreground">Faturamento médio mensal</label>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {['Até R$ 50 mil', 'R$ 50 mil – R$ 100 mil', 'R$ 100 mil – R$ 300 mil', 'R$ 300 mil – R$ 500 mil', 'R$ 500 mil – R$ 1 milhão', 'R$ 1 milhão – R$ 3 milhões', 'Acima R$ 3 milhões'].map(opt => (
                              <OptionCard key={opt} active={data.financeiro.faturamentoMensal === opt} onClick={() => setData({...data, financeiro: {...data.financeiro, faturamentoMensal: opt}})}>{opt}</OptionCard>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-muted-foreground">A empresa hoje gera lucro consistente?</label>
                          <div className="flex flex-wrap gap-3">
                            {['Sim', 'Às vezes', 'Não', 'Não tenho clareza'].map(opt => (
                              <Chip key={opt} active={data.financeiro.lucroConsistente === opt} onClick={() => setData({...data, financeiro: {...data.financeiro, lucroConsistente: opt}})}>{opt}</Chip>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-12">
                        <div>
                          <h3 className="text-2xl font-semibold text-white">Gestão da Empresa</h3>
                          <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed max-w-2xl">
                            Avalie cada afirmação movendo o controle para representar a realidade atual da sua empresa. 
                            Não existem respostas certas ou erradas. Quanto mais preciso você responder, mais útil será o diagnóstico.
                          </p>
                        </div>
                        
                        <div className="space-y-16">
                          <ScaleQuestion 
                            label="As principais decisões ainda dependem do dono?" 
                            description="Avalie o quanto sua empresa continua dependendo da sua presença para funcionar."
                            value={data.gestao.dependenciaDono} 
                            onChange={v => setData({...data, gestao: {...data.gestao, dependenciaDono: v}})} 
                          />
                          <ScaleQuestion 
                            label="A empresa possui indicadores de gestão acompanhados?" 
                            description="Analise se as decisões são tomadas com base em dados ou no 'feeling'."
                            value={data.gestao.indicadores} 
                            onChange={v => setData({...data, gestao: {...data.gestao, indicadores: v}})} 
                          />
                          <ScaleQuestion 
                            label="O financeiro possui projeções confiáveis?" 
                            description="Verifique se você tem clareza sobre o fluxo de caixa futuro e margens."
                            value={data.gestao.financeiro} 
                            onChange={v => setData({...data, gestao: {...data.gestao, financeiro: v}})} 
                          />
                          <ScaleQuestion 
                            label="Os líderes sabem claramente o que entregar?" 
                            description="Avalie se o time tem autonomia e clareza sobre suas responsabilidades."
                            value={data.gestao.lideranca} 
                            onChange={v => setData({...data, gestao: {...data.gestao, lideranca: v}})} 
                          />
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-8">
                        <h3 className="text-xl font-semibold text-white">O que mais trava sua empresa hoje?</h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {['Falta de lucro', 'Dependência do dono', 'Falta de processos', 'Time sem autonomia', 'Financeiro bagunçado', 'Vendas estagnadas', 'Falta de indicadores', 'Escala sem controle'].map(opt => (
                            <OptionCard 
                              key={opt} 
                              active={data.dores.includes(opt)} 
                              onClick={() => {
                                const newDores = data.dores.includes(opt) ? data.dores.filter(d => d !== opt) : [...data.dores, opt];
                                setData({...data, dores: newDores});
                              }}
                            >
                              {opt}
                            </OptionCard>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-muted-foreground">Se pudesse resolver um problema em 90 dias, qual seria?</label>
                          <textarea 
                            value={data.principalProblema}
                            onChange={e => setData({...data, principalProblema: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors min-h-[100px]"
                            placeholder="Descreva aqui..."
                          />
                        </div>
                      </div>
                    )}

                    {step === 5 && (
                      <div className="space-y-8">
                        <h3 className="text-xl font-semibold text-white">Último passo.</h3>
                        <p className="text-sm font-light text-muted-foreground">Com essas informações já conseguimos ter uma visão inicial da operação.</p>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Input label="Seu nome" value={data.contato.nome} onChange={v => setData({...data, contato: {...data.contato, nome: v}})} placeholder="Nome completo" />
                          <Input label="Seu cargo" value={data.contato.cargo} onChange={v => setData({...data, contato: {...data.contato, cargo: v}})} placeholder="Ex: CEO, Sócio..." />
                          <Input label="WhatsApp" value={data.contato.telefone} onChange={v => setData({...data, contato: {...data.contato, telefone: v}})} placeholder="(00) 00000-0000" type="tel" />
                          <Input label="E-mail" value={data.contato.email} onChange={v => setData({...data, contato: {...data.contato, email: v}})} placeholder="seu@email.com" type="email" />
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className={cn(
                            "mt-1 size-5 rounded border transition-all flex items-center justify-center",
                            data.contato.autorizo ? "bg-primary border-primary" : "border-white/20 group-hover:border-primary/50"
                          )} onClick={() => setData({...data, contato: {...data.contato, autorizo: !data.contato.autorizo}})}>
                            {data.contato.autorizo && <CheckCircle2 className="size-3.5 text-black" />}
                          </div>
                          <span className="text-xs font-light text-muted-foreground leading-relaxed">
                            Autorizo o contato da equipe Cáliber para falar sobre este diagnóstico estratégico.
                          </span>
                        </label>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-14 pt-10 border-t border-white/5">
                <button 
                  disabled={step === 1}
                  onClick={prevStep}
                  className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Voltar
                </button>
                
                <button 
                  onClick={step === steps.length ? handleComplete : nextStep}
                  className="group flex items-center gap-3 bg-primary text-black px-8 py-4 rounded-full text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_oklch(0.83_0.121_82.5/0.3)]"
                >
                  {step === steps.length ? "Finalizar Diagnóstico" : "Continuar"}
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mx-auto size-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                <CheckCircle2 className="size-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Diagnóstico concluído.</h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto font-light leading-relaxed">
                Suas respostas foram registradas com sucesso. Nossa equipe analisará os dados e entrará em contato em breve.
              </p>
              
              <div className="mt-12 p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-left max-w-xl mx-auto space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-6">Resumo enviado</p>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-subtle">Empresa</span>
                  <span className="text-sm text-white font-medium">{data.empresa.nome}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-subtle">Faturamento</span>
                  <span className="text-sm text-white font-medium">{data.financeiro.faturamentoMensal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-subtle">Principal foco</span>
                  <span className="text-sm text-white font-medium">{data.dores[0] || "Geral"}</span>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onClose} className="px-8 py-4 rounded-full border border-white/10 text-white font-semibold hover:bg-white/5 transition-all">
                  Voltar para o site
                </button>
                <button onClick={() => {setIsSubmitted(false); setStep(1);}} className="px-8 py-4 rounded-full text-primary font-semibold hover:bg-primary/5 transition-all">
                  Revisar respostas
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground/80">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}

function Chip({ children, active, onClick }: { children: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-300",
        active 
          ? "bg-primary border-primary text-black shadow-[0_0_15px_oklch(0.83_0.121_82.5/0.2)]" 
          : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function OptionCard({ children, active, onClick }: { children: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border text-left text-sm font-medium transition-all duration-300",
        active 
          ? "bg-primary/5 border-primary text-primary shadow-[0_0_20px_oklch(0.83_0.121_82.5/0.1)]" 
          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function ScaleQuestion({ label, description, value, onChange }: { label: string, description: string, value: number, onChange: (v: number) => void }) {
  const levels = ["Muito Baixo", "Baixo", "Moderado", "Alto", "Muito Alto"];
  const subLabels = ["Nunca", "Pouco", "Médio", "Muito", "Totalmente"];
  
  // Cores baseadas no nível
  const getLevelColor = (v: number) => {
    switch(v) {
      case 1: return "text-zinc-500";
      case 2: return "text-primary/60";
      case 3: return "text-primary/80";
      case 4: return "text-primary";
      case 5: return "text-primary brightness-125";
      default: return "text-zinc-500";
    }
  };

  const getBarColor = (v: number) => {
    switch(v) {
      case 1: return "bg-zinc-600";
      case 2: return "bg-primary/40";
      case 3: return "bg-primary/70";
      case 4: return "bg-primary";
      case 5: return "bg-primary brightness-125";
      default: return "bg-zinc-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-lg font-medium text-white tracking-tight">{label}</label>
        <p className="text-sm font-light text-muted-foreground/60">{description}</p>
      </div>
      
      <div className="relative pt-4 pb-12">
        {/* Track de fundo */}
        <div className="absolute top-[22px] left-0 right-0 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full origin-left transition-colors duration-500", getBarColor(value))}
            initial={false}
            animate={{ width: `${((value - 1) / 4) * 100}%` }}
          />
        </div>

        {/* Slider input nativo escondido para acessibilidade e controle */}
        <input 
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute top-0 left-0 w-full h-12 opacity-0 cursor-pointer z-10"
        />

        {/* Custom Thumb & Indicator */}
        <motion.div 
          className="absolute top-3 flex flex-col items-center pointer-events-none"
          initial={false}
          animate={{ left: `${((value - 1) / 4) * 100}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ x: "-50%" }}
        >
          {/* Thumb Dourado Metálico */}
          <motion.div 
            className="size-6 rounded-full bg-primary border-4 border-[#0F0F0F] shadow-[0_0_20px_rgba(244,190,98,0.4)] flex items-center justify-center relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1.2 }}
          >
            <div className="size-1 bg-black/40 rounded-full" />
            <div className="absolute inset-0 rounded-full ring-4 ring-primary/20 scale-0 group-hover:scale-150 transition-transform duration-300" />
          </motion.div>

          {/* Indicador Textual Flutuante */}
          <motion.span 
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("absolute -top-10 whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-colors duration-500", getLevelColor(value))}
          >
            {levels[value - 1]}
          </motion.span>
        </motion.div>

        {/* Escala Numérica / Textual Inferior */}
        <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-1">
          {subLabels.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span className={cn(
                "text-[9px] font-bold tracking-tighter transition-colors duration-300", 
                value === i + 1 ? "text-primary" : "text-muted-foreground/30"
              )}>
                {label}
              </span>
              <div className={cn(
                "size-1 rounded-full transition-colors duration-300",
                value === i + 1 ? "bg-primary" : "bg-white/10"
              )} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
