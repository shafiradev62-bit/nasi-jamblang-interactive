import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  LayoutDashboard, BookOpen, PenTool, Settings, 
  Save, Plus, Trash2, Edit3, ChevronRight,
  Monitor, Database, FileText, BarChart3,
  Image as ImageIcon, Video, Globe, CheckCircle
} from "lucide-react";
import { 
  ExamQuestion,
  getQuestionsForUnit 
} from "@/data/examQuestions";
import { 
  UnitMeta, 
  UnitStimulus,
  getUnitMeta, 
  getUnitStimulus,
  defaultUnitMeta,
  SiteConfig,
  getSiteConfig 
} from "@/data/appContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <Card className="border-border/40 shadow-sm">
    <CardContent className="p-6 flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-black/5`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-2xl font-bold tracking-tight text-foreground">{value}</h4>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const CardField = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 bg-white border-border/60 focus-visible:ring-primary shadow-sm" />
  </div>
);

const CardFieldArea = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
    <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-[140px] bg-white border-border/60 focus-visible:ring-primary shadow-sm" />
  </div>
);

const SelectUnit = ({ u, setU }: any) => (
  <div className="flex bg-muted/50 p-1 rounded-xl border border-border/40 h-10 items-center">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
      <button 
        key={val} 
        onClick={() => setU(val)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
          u === val ? "bg-white text-primary shadow-sm" : "hover:bg-white/50 text-muted-foreground"
        }`}
      >
        {val}
      </button>
    ))}
  </div>
);

type AdminPage = "units" | "stimulus" | "questions" | "config";

const AdminPortal = () => {
  const { lang, t } = useLanguage();
  const [activePage, setActivePage] = useState<AdminPage>("units");
  const [selectedUnit, setSelectedUnit] = useState(1);
  
  // States for dynamic editing
  const [unitMeta, setUnitMeta] = useState<UnitMeta>(getUnitMeta(1));
  const [unitStimulus, setUnitStimulus] = useState<UnitStimulus | null>(getUnitStimulus(1));
  const [questions, setQuestions] = useState<ExamQuestion[]>(getQuestionsForUnit(1));
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());

  // Sync state when unit changes
  useEffect(() => {
    setUnitMeta(getUnitMeta(selectedUnit));
    setUnitStimulus(getUnitStimulus(selectedUnit));
    setQuestions(getQuestionsForUnit(selectedUnit));
    setEditingQuestion(null);
  }, [selectedUnit]);

  const saveUnitMeta = () => {
    localStorage.setItem(`admin_unit_meta_${selectedUnit}`, JSON.stringify(unitMeta));
    toast.success(`Unit ${selectedUnit} metadata updated!`);
  };

  const saveUnitStimulus = () => {
    localStorage.setItem(`admin_unit_stimulus_${selectedUnit}`, JSON.stringify(unitStimulus));
    toast.success(`Unit ${selectedUnit} stimulus updated!`);
  };

  const saveSiteConfig = () => {
    localStorage.setItem('admin_site_config', JSON.stringify(siteConfig));
    toast.success("Site configuration saved!");
  };

  const saveQuestions = (newQuestions: ExamQuestion[]) => {
    localStorage.setItem(`admin_questions_unit_${selectedUnit}`, JSON.stringify(newQuestions));
    setQuestions(newQuestions);
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;
    const updated = questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
    saveQuestions(updated);
    setEditingQuestion(null);
    toast.success("Question updated successfully!");
  };

  const SidebarItem = ({ id, icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? "bg-primary text-white shadow-md shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-semibold">{label}</span>
      {active && <ChevronRight className="ml-auto w-4 h-4" />}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-white border-r border-border/40 p-6 flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight">Master Admin</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="px-4 py-2">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Target Unit</p>
             <div className="grid grid-cols-5 gap-1.5 p-2 bg-muted/40 rounded-xl border border-border/40">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setSelectedUnit(val)}
                    className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      selectedUnit === val ? "bg-primary text-white shadow-sm" : "hover:bg-white/50 text-muted-foreground"
                    }`}
                  >
                    {val}
                  </button>
                ))}
             </div>
          </div>

          <Separator className="my-4 opacity-50" />

          <SidebarItem id="units" icon={BookOpen} label="Unit Identity" active={activePage === "units"} onClick={() => setActivePage("units")} />
          <SidebarItem id="stimulus" icon={FileText} label="Reading Stimulus" active={activePage === "stimulus"} onClick={() => setActivePage("stimulus")} />
          <SidebarItem id="questions" icon={PenTool} label="Question Bank" active={activePage === "questions"} onClick={() => setActivePage("questions")} />
          
          <Separator className="my-4 opacity-50" />
          
          <SidebarItem id="config" icon={Settings} label="Site Settings" active={activePage === "config"} onClick={() => setActivePage("config")} />
        </nav>

        <div className="p-4 bg-muted/40 rounded-2xl border border-border/40">
           <p className="text-[10px] font-bold text-muted-foreground mb-2">DB STATUS</p>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-medium">Local Sync Active</span>
           </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-border/40 flex items-center justify-between px-10 shrink-0">
          <div className="flex flex-col">
             <h1 className="text-xl font-display font-medium capitalize">{activePage.replace("_", " ")}</h1>
             <div className="flex items-center gap-4 text-xs text-muted-foreground">
               <span className="flex items-center gap-1 font-bold text-primary">Unit {selectedUnit}</span>
               <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
               <span className="flex items-center gap-1">Literacy CMS</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('/quiz', '_blank')}>
                <Globe className="w-4 h-4" /> View Live Site
             </Button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <ScrollArea className="flex-1 p-10">
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* STIMULUS PAGE */}
            {activePage === "stimulus" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-display font-medium">Unit {selectedUnit} Reading Stimulus</h2>
                  <Button onClick={saveUnitStimulus} className="gap-2">
                    <Save className="w-4 h-4" /> Save Stimulus
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">English Version</p>
                        <div className="space-y-6">
                           <CardField label="Article Title (EN)" value={unitStimulus?.titleEn || ""} onChange={v => setUnitStimulus({...unitStimulus!, titleEn: v})} />
                           <CardFieldArea label="Introduction / Article Body (EN)" value={unitStimulus?.introductionEn || ""} onChange={v => setUnitStimulus({...unitStimulus!, introductionEn: v})} />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-4 bg-muted/40 rounded-xl border border-border/40">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Indonesian Version</p>
                        <div className="space-y-6">
                           <CardField label="Judul Artikel (ID)" value={unitStimulus?.titleId || ""} onChange={v => setUnitStimulus({...unitStimulus!, titleId: v})} />
                           <CardFieldArea label="Pendahuluan / Isi Artikel (ID)" value={unitStimulus?.introductionId || ""} onChange={v => setUnitStimulus({...unitStimulus!, introductionId: v})} />
                        </div>
                      </div>
                   </div>
                </div>

                <Card className="border-border/40 shadow-sm bg-amber-50/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      Table Data (Optional)
                    </CardTitle>
                    <CardDescription className="text-[11px]">You can add structured data tables that students will use for analysis. Tables are currently configured via source code for maximum performance.</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* UNTI SETTINGS PAGE */}
            {activePage === "units" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <h2 className="text-lg font-display font-medium">Unit {selectedUnit} Identity</h2>
                  <div className="grid grid-cols-2 gap-8">
                     <CardField label="Unit Title (Shared)" value={unitMeta.title} onChange={v => setUnitMeta({...unitMeta, title: v})} />
                     <CardField label="Unit Subtitle (EN)" value={unitMeta.subtitle} onChange={v => setUnitMeta({...unitMeta, subtitle: v})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-display font-medium">Theme Specifications</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <CardFieldArea label="Theme Description (English)" value={unitMeta.themeEn} onChange={v => setUnitMeta({...unitMeta, themeEn: v})} />
                    <CardFieldArea label="Deskripsi Tema (Indonesia)" value={unitMeta.themeId} onChange={v => setUnitMeta({...unitMeta, themeId: v})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-display font-medium">Media Assets</h2>
                  <div className="grid grid-cols-2 gap-8">
                    <CardField label="Image URL" value={unitMeta.imageUrl || ""} onChange={v => setUnitMeta({...unitMeta, imageUrl: v})} />
                    <CardField label="Video URL" value={unitMeta.videoUrl || ""} onChange={v => setUnitMeta({...unitMeta, videoUrl: v})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/40 flex justify-end">
                   <Button onClick={saveUnitMeta} className="px-10 gap-2 h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20">
                      <Save className="w-5 h-5" /> Save Unit Changes
                   </Button>
                </div>
              </div>
            )}

            {/* CONFIG PAGE */}
            {activePage === "config" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-4">
                  <h2 className="text-lg font-display font-medium">Site Branding</h2>
                  <div className="grid grid-cols-1 gap-6">
                     <CardField label="Application Main Title" value={siteConfig.appTitle} onChange={v => setSiteConfig({...siteConfig, appTitle: v})} />
                     <CardField label="Application Subtitle" value={siteConfig.appSubtitle} onChange={v => setSiteConfig({...siteConfig, appSubtitle: v})} />
                     <CardFieldArea label="Footer Legal / Credit Text" value={siteConfig.footerText} onChange={v => setSiteConfig({...siteConfig, footerText: v})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/40 flex justify-end">
                   <Button onClick={saveSiteConfig} className="px-10 gap-2 h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20">
                      <Save className="w-5 h-5" /> Save Site Config
                   </Button>
                </div>
              </div>
            )}
            {activePage === "questions" && (
               <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center justify-between">
                     <h2 className="text-lg font-display font-medium">Assessment Bank — Unit {selectedUnit}</h2>
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2" 
                        onClick={() => {
                           const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
                           const newQ: ExamQuestion = {
                             id: newId,
                             type: "mcq",
                             question: "New Question Text",
                             questionIdn: "Teks Pertanyaan Baru",
                             options: ["Option 1", "Option 2"],
                             optionsIdn: ["Opsi 1", "Opsi 2"],
                             correct: "Option 1"
                           };
                           saveQuestions([...questions, newQ]);
                           toast.success("New question added!");
                        }}
                     >
                        <Plus className="w-4 h-4" /> Add New Question
                     </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {questions.map((q, idx) => (
                      <Card key={q.id} className="border-border/40 shadow-sm overflow-hidden hover:border-primary/20 transition-colors">
                        <div className="p-6 flex items-start gap-6">
                           <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center font-mono font-bold text-primary">Q{idx+1}</div>
                           <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="uppercase text-[9px] tracking-widest">{q.type}</Badge>
                                <span className="text-[13px] font-medium text-foreground">{q.questionIdn || q.question}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{q.options?.join(" • ")}</p>
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(q)}>
                              <Edit3 className="w-4 h-4" />
                           </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
               </div>
            )}

          </div>
        </ScrollArea>
      </main>

      {/* ── QUESTION EDITOR DRAWER (Overlays Questions Page) ── */}
      {editingQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingQuestion(null)} />
           <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              <header className="px-8 py-6 border-b border-border/40 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-display font-medium">Edit Question {editingQuestion.id}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(null)} className="rounded-full">
                  <Plus className="w-6 h-6 rotate-45" />
                </Button>
              </header>

              <ScrollArea className="flex-1 p-8">
                <div className="space-y-8">
                  <CardField label="Question Text (EN)" value={editingQuestion.question} onChange={v => setEditingQuestion({...editingQuestion, question: v})} />
                  <CardField label="Teks Pertanyaan (ID)" value={editingQuestion.questionIdn || ""} onChange={v => setEditingQuestion({...editingQuestion, questionIdn: v})} />
                  
                  <Separator />

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Options</label>
                    <div className="grid grid-cols-1 gap-3">
                      {(editingQuestion.options || []).map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <Input value={opt} onChange={e => {
                            const next = [...(editingQuestion.options || [])];
                            next[i] = e.target.value;
                            setEditingQuestion({...editingQuestion, options: next});
                          }} className="flex-1 h-10 text-xs" />
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                            const next = (editingQuestion.options || []).filter((_, idx) => idx !== i);
                            setEditingQuestion({...editingQuestion, options: next});
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => setEditingQuestion({...editingQuestion, options: [...(editingQuestion.options || []), ""]})}>
                        Add Option
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <CardField label="Answer Key (Correct)" value={String(editingQuestion.correct)} onChange={v => setEditingQuestion({...editingQuestion, correct: v})} />
                  <CardFieldArea label="Explanation (Optional)" value={editingQuestion.explanation || ""} onChange={v => setEditingQuestion({...editingQuestion, explanation: v})} />

                  <div className="pt-10 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Danger Zone</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        if(confirm("Delete this question?")) {
                          const updated = questions.filter(q => q.id !== editingQuestion.id);
                          saveQuestions(updated);
                          setEditingQuestion(null);
                          toast.error("Question removed");
                        }
                      }} 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-0 h-auto font-medium text-xs"
                    >
                      Permanently delete this assessment item
                    </Button>
                  </div>
                </div>
              </ScrollArea>

              <footer className="p-8 border-t border-border/40 flex justify-end shrink-0">
                 <Button onClick={handleUpdateQuestion} className="w-full h-12 rounded-xl text-md font-bold">
                    Update Assessment Item
                 </Button>
              </footer>
           </div>
        </div>
      )}

    </div>
  );
};
export default AdminPortal;
