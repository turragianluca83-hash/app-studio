
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle2, Clock, BookOpen, LayoutDashboard, Settings, 
  Plus, Bell, Zap, GraduationCap, Mail, Lock, Loader2, 
  AlertCircle, X, Save, Trash2, ChevronRight
} from 'lucide-react';
import { Task, TaskType, Difficulty, StudySession, Reminder, UserProfile } from './types';
import { generateStudyPlan } from './services/geminiService';

const taskTypeLabels: Record<TaskType, string> = {
  [TaskType.HOMEWORK]: 'Compito',
  [TaskType.EXAM]: 'Esame',
  [TaskType.ORAL_TEST]: 'Interrogazione',
  [TaskType.PROJECT]: 'Progetto',
  [TaskType.STUDY_HOUR]: 'Ora Studio',
};

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('edu_user');
    return saved ? JSON.parse(saved) : { name: 'Studente', email: 'studente@scuola.it', isGoogleConnected: false, isClasseVivaConnected: false };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('edu_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('edu_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('edu_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'calendar' | 'settings'>('dashboard');
  const [isPlanning, setIsPlanning] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'google' | 'classeviva' | null>(null);

  const [newTask, setNewTask] = useState({
    title: '', subject: '', dueDate: '', type: TaskType.HOMEWORK, difficulty: Difficulty.MEDIUM, description: ''
  });

  useEffect(() => {
    localStorage.setItem('edu_user', JSON.stringify(user));
    localStorage.setItem('edu_tasks', JSON.stringify(tasks));
    localStorage.setItem('edu_sessions', JSON.stringify(sessions));
    localStorage.setItem('edu_reminders', JSON.stringify(reminders));
  }, [user, tasks, sessions, reminders]);

  const handlePlan = async () => {
    const pendingTasks = tasks.filter(t => !t.isCompleted);
    if (pendingTasks.length === 0) {
      alert("Aggiungi dei compiti prima di organizzare lo studio!");
      return;
    }
    
    setIsPlanning(true);
    try {
      const plan = await generateStudyPlan(pendingTasks);
      setSessions(plan.sessions);
      setReminders(plan.reminders);
      setActiveTab('planner');
    } catch (err) {
      console.error(err);
      alert("Errore nella generazione del piano. Riprova.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = { 
      ...newTask, 
      id: Date.now().toString(), 
      isCompleted: false, 
      source: 'manual' 
    };
    setTasks([task, ...tasks]);
    setIsAddTaskOpen(false);
    setNewTask({ title: '', subject: '', dueDate: '', type: TaskType.HOMEWORK, difficulty: Difficulty.MEDIUM, description: '' });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const sortedTasks = useMemo(() => 
    [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  , [tasks]);

  const connectService = () => {
    if (authType === 'google') setUser({ ...user, isGoogleConnected: true });
    if (authType === 'classeviva') setUser({ ...user, isClasseVivaConnected: true });
    setIsAuthOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden text-slate-900">
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">EduMind</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'planner', icon: Zap, label: 'AI Planner' },
            { id: 'calendar', icon: Calendar, label: 'Calendario' },
            { id: 'settings', icon: Settings, label: 'Impostazioni' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 uppercase">
            {user.name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Locale</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 md:hidden">
             <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <GraduationCap size={18} />
             </div>
             <h2 className="text-md font-bold uppercase tracking-tight">EduMind</h2>
          </div>
          <h2 className="hidden md:block text-lg font-bold capitalize">{activeTab}</h2>
          <div className="flex gap-2">
            <button onClick={() => setIsAddTaskOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors">
              <Plus size={20} />
            </button>
            <button 
              disabled={isPlanning}
              onClick={handlePlan}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isPlanning ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              <span className="hidden sm:inline">Organizza</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-6 rounded-3xl border transition-all ${user.isGoogleConnected ? 'bg-white border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Mail size={24} /></div>
                    <button onClick={() => {setAuthType('google'); setIsAuthOpen(true)}} className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${user.isGoogleConnected ? 'bg-green-100 text-green-700' : 'text-blue-600'}`}>
                      {user.isGoogleConnected ? 'ATTIVO' : 'COLLEGA'}
                    </button>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">Google Account</h3>
                  <p className="text-xs text-slate-500 mt-1">Sincronizza le scadenze del tuo calendario.</p>
                </div>
                <div className={`p-6 rounded-3xl border transition-all ${user.isClasseVivaConnected ? 'bg-white border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Lock size={24} /></div>
                    <button onClick={() => {setAuthType('classeviva'); setIsAuthOpen(true)}} className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${user.isClasseVivaConnected ? 'bg-green-100 text-green-700' : 'text-indigo-600'}`}>
                      {user.isClasseVivaConnected ? 'ATTIVO' : 'COLLEGA'}
                    </button>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">ClasseViva</h3>
                  <p className="text-xs text-slate-500 mt-1">Importa compiti e verifiche dal tuo registro.</p>
                </div>
              </div>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xl font-black">I Miei Compiti</h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded-full">{tasks.filter(t => !t.isCompleted).length} DA FARE</span>
                </div>
                <div className="space-y-3">
                  {sortedTasks.length === 0 ? (
                    <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><BookOpen size={32} /></div>
                      <p className="text-slate-400 font-medium">Ancora nulla. Inizia aggiungendo un compito!</p>
                    </div>
                  ) : sortedTasks.map(task => (
                    <div key={task.id} className={`group p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md ${task.isCompleted ? 'opacity-50' : ''}`}>
                      <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-blue-500'}`}>
                        {task.isCompleted && <CheckCircle2 size={16} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-sm sm:text-base truncate ${task.isCompleted ? 'line-through' : ''}`}>{task.title}</h4>
                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">{task.subject}</span>
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">{taskTypeLabels[task.type]}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Calendar size={12} /> Scade il {new Date(task.dueDate).toLocaleDateString('it-IT')}</p>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="space-y-8">
              {sessions.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 animate-pulse"><Zap size={40} /></div>
                  <h3 className="text-xl font-bold">Pianifica il tuo successo</h3>
                  <button onClick={handlePlan} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">Genera Piano Ora</button>
                </div>
              ) : (
                <>
                  <section>
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Clock className="text-blue-600" size={24} /> Tabella di Marcia</h3>
                    <div className="grid gap-3">
                      {sessions.map((session, idx) => (
                        <div key={session.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center text-blue-600 shrink-0">
                            <span className="text-sm font-black leading-none">{new Date(session.date).getDate()}</span>
                            <span className="text-[10px] uppercase font-black leading-none mt-1">{new Date(session.date).toLocaleString('it-IT', { month: 'short' })}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Sessione {idx + 1}</p>
                            <h4 className="font-bold text-slate-800 leading-tight">{session.topic}</h4>
                            <p className="text-xs text-slate-400 mt-1 font-medium">{session.startTime} • {session.duration} min</p>
                          </div>
                          <ChevronRight className="text-slate-300" size={20} />
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-black mb-6">Profilo</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nome</label>
                    <input className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none" value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
          <LayoutDashboard size={22} /><span className="text-[9px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab('planner')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'planner' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Zap size={22} /><span className="text-[9px] font-black uppercase">AI Planner</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Settings size={22} /><span className="text-[9px] font-black uppercase">Profilo</span>
        </button>
      </nav>

      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-[40px] sm:rounded-[40px] w-full max-w-lg p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black">Nuovo Compito</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Titolo</label>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Tipo Attività</label>
                <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value as TaskType})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold">
                  {Object.entries(taskTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Materia" value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input required type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200">Salva</button>
            </form>
          </div>
        </div>
      )}

      {isAuthOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 ${authType === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {authType === 'google' ? <Mail size={48} /> : <Lock size={48} />}
              </div>
              <h3 className="text-2xl font-black">Connetti {authType === 'google' ? 'Google' : 'ClasseViva'}</h3>
            </div>
            <div className="space-y-4">
              <button onClick={connectService} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Conferma</button>
              <button onClick={() => setIsAuthOpen(false)} className="w-full text-slate-400 py-3 font-bold uppercase tracking-widest text-[10px]">Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
