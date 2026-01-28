
import React, { useMemo, useState, useEffect } from 'react';
import { 
  TEACHER_EVAL_ITEMS, 
  LEARNING_ENV_ITEMS, 
  CLINICAL_ITEMS, 
  HOSTEL_ITEMS,
  RATING_LABELS
} from '../constants';
import { Teacher } from '../types';
import { storageService } from '../services/storage';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'environment' | 'problems' | 'manage'>('teachers');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const evaluations = useMemo(() => storageService.getEvaluations(), []);

  // Form State for adding teacher
  const [newTeacher, setNewTeacher] = useState({ name: '', designation: '', subject: '' });
  const [formMessage, setFormMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setTeachers(storageService.getTeachers());
  }, []);

  // Teacher Stats Summary
  const teacherStats = useMemo(() => {
    return teachers.map(teacher => {
      const teacherEvals = evaluations.filter(e => e.teacherId === teacher.id);
      const totalResponses = teacherEvals.length;
      
      let totalScore = 0;
      let scoreCount = 0;
      let roleModelCount = 0;

      teacherEvals.forEach(ev => {
        Object.values(ev.ratings).forEach(val => {
          totalScore += (val as number);
          scoreCount++;
        });
        if (ev.isRoleModel) roleModelCount++;
      });

      const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(2) : "0.00";
      const roleModelPercent = totalResponses > 0 ? ((roleModelCount / totalResponses) * 100).toFixed(1) : "0";

      return {
        ...teacher,
        avgScore: parseFloat(avgScore),
        roleModelPercent: parseFloat(roleModelPercent),
        count: totalResponses
      };
    });
  }, [evaluations, teachers]);

  // Selected Teacher Itemized Stats
  const selectedTeacherDetails = useMemo(() => {
    if (!selectedTeacherId) return null;
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    if (!teacher) return null;

    const teacherEvals = evaluations.filter(e => e.teacherId === selectedTeacherId);
    
    const itemAverages = TEACHER_EVAL_ITEMS.map(item => {
      let sum = 0;
      let count = 0;
      teacherEvals.forEach(ev => {
        if (ev.ratings[item]) {
          sum += ev.ratings[item];
          count++;
        }
      });
      return {
        parameter: item,
        average: count > 0 ? sum / count : 0,
        count
      };
    });

    return {
      ...teacher,
      itemAverages,
      totalEvals: teacherEvals.length
    };
  }, [selectedTeacherId, evaluations, teachers]);

  // Environment Heatmap Data
  const envStats = useMemo(() => {
    return LEARNING_ENV_ITEMS.map(item => {
      let total = 0;
      let count = 0;
      evaluations.forEach(ev => {
        if (ev.learningEnv[item]) {
          total += ev.learningEnv[item];
          count++;
        }
      });
      return {
        item,
        avg: count > 0 ? total / count : 0,
        count
      };
    });
  }, [evaluations]);

  // Hostel Heatmap Data
  const hostelStats = useMemo(() => {
    return HOSTEL_ITEMS.map(item => {
      let total = 0;
      let count = 0;
      evaluations.forEach(ev => {
        if (ev.hostel && ev.hostel[item]) {
          total += ev.hostel[item];
          count++;
        }
      });
      return {
        item,
        avg: count > 0 ? total / count : 0,
        count
      };
    });
  }, [evaluations]);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.designation || !newTeacher.subject) {
      setFormMessage({ text: "Please fill all fields.", type: 'error' });
      return;
    }

    const teacher: Teacher = {
      id: 'T' + Date.now(),
      name: newTeacher.name,
      designation: newTeacher.designation,
      subject: newTeacher.subject
    };

    storageService.saveTeacher(teacher);
    setTeachers(storageService.getTeachers());
    setNewTeacher({ name: '', designation: '', subject: '' });
    setFormMessage({ text: "Teacher added successfully!", type: 'success' });
    setTimeout(() => setFormMessage(null), 3000);
  };

  const handleExportCSV = () => {
    if (evaluations.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Timestamp", "Phase", "Teacher Name", "Designation", "Subject",
      ...TEACHER_EVAL_ITEMS,
      "Is Role Model",
      ...LEARNING_ENV_ITEMS,
      ...CLINICAL_ITEMS,
      ...HOSTEL_ITEMS,
      "Qualitative Problems"
    ];

    const rows = evaluations.map(ev => {
      const teacher = teachers.find(t => t.id === ev.teacherId);
      const dataRow = [
        new Date(ev.timestamp).toLocaleString(),
        ev.phase,
        teacher?.name || 'Unknown',
        teacher?.designation || 'Unknown',
        teacher?.subject || 'Unknown',
        ...TEACHER_EVAL_ITEMS.map(item => ev.ratings[item] || ''),
        ev.isRoleModel ? "Yes" : "No",
        ...LEARNING_ENV_ITEMS.map(item => ev.learningEnv[item] || ''),
        ...CLINICAL_ITEMS.map(item => ev.clinicalSkills?.[item] || 'N/A'),
        ...HOSTEL_ITEMS.map(item => ev.hostel?.[item] || 'N/A'),
        `"${ev.qualitativeProblems.replace(/"/g, '""')}"`
      ];
      return dataRow.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MedEval_Data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHeatColor = (val: number) => {
    if (val === 0) return 'bg-slate-100 text-slate-400';
    if (val < 2.5) return 'bg-red-100 text-red-700 font-bold';
    if (val < 3.5) return 'bg-yellow-100 text-yellow-700 font-bold';
    return 'bg-green-100 text-green-700 font-bold';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Administrative Dashboard</h1>
          <p className="text-slate-500">Evaluation summaries and institutional insights</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded-md transition-all whitespace-nowrap ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Stats
            </button>
            <button 
              onClick={() => setActiveTab('environment')}
              className={`px-4 py-2 rounded-md transition-all whitespace-nowrap ${activeTab === 'environment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Environment
            </button>
            <button 
              onClick={() => setActiveTab('problems')}
              className={`px-4 py-2 rounded-md transition-all whitespace-nowrap ${activeTab === 'problems' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Problems
            </button>
            <button 
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-md transition-all whitespace-nowrap ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Manage Teachers
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {activeTab !== 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Submissions</p>
              <p className="text-3xl font-bold text-blue-900">{evaluations.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">Avg Teacher Rating</p>
              <p className="text-3xl font-bold text-blue-900">
                {teacherStats.length > 0 ? (teacherStats.reduce((acc, t) => acc + t.avgScore, 0) / teacherStats.length).toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Teachers</p>
              <p className="text-3xl font-bold text-blue-900">{teachers.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Teacher Average Scores (1-5)</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} tick={{ fill: '#64748b' }} angle={-15} textAnchor="end" height={60} />
                      <YAxis domain={[0, 5]} fontSize={12} tick={{ fill: '#64748b' }} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} />
                      <Bar dataKey="avgScore" name="Avg Rating" radius={[4, 4, 0, 0]} onClick={(data) => setSelectedTeacherId(data.id)}>
                        {teacherStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.avgScore > 4 ? '#059669' : (entry.avgScore > 3 ? '#2563eb' : '#dc2626')} className="cursor-pointer hover:opacity-80" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Teacher Performance Summary</h3>
                  <p className="text-xs text-slate-400 mt-1">Click a teacher to view detailed parameters</p>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">Teacher</th>
                        <th className="px-6 py-3">Rating</th>
                        <th className="px-6 py-3">Role Model</th>
                        <th className="px-6 py-3">Sample</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {[...teacherStats].sort((a,b) => b.avgScore - a.avgScore).map(t => (
                        <tr key={t.id} className={`hover:bg-blue-50 transition-colors cursor-pointer ${selectedTeacherId === t.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`} onClick={() => setSelectedTeacherId(t.id)}>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.subject}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getHeatColor(t.avgScore)}`}>
                              {t.avgScore.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-blue-600">{t.roleModelPercent}%</td>
                          <td className="px-6 py-4 text-slate-500">n={t.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {selectedTeacherDetails && (
              <div className="bg-white p-8 rounded-xl border-2 border-blue-100 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">{selectedTeacherDetails.name}</h2>
                    <p className="text-slate-500">{selectedTeacherDetails.designation} of {selectedTeacherDetails.subject} • Based on {selectedTeacherDetails.totalEvals} evaluations</p>
                  </div>
                  <button 
                    onClick={() => setSelectedTeacherId(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {selectedTeacherDetails.itemAverages.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-700">{item.parameter}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getHeatColor(item.average)}`}>
                          {item.average.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${item.average > 4 ? 'bg-emerald-500' : (item.average > 3 ? 'bg-blue-500' : 'bg-rose-500')}`}
                          style={{ width: `${(item.average / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="font-bold text-xl text-slate-800 mb-6">Add New Teacher</h3>
                
                {formMessage && (
                  <div className={`mb-4 p-3 rounded text-sm font-medium ${formMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {formMessage.text}
                  </div>
                )}

                <form onSubmit={handleAddTeacher} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newTeacher.name}
                      onChange={e => setNewTeacher({...newTeacher, name: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Dr. Alice Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                    <input 
                      type="text" 
                      value={newTeacher.designation}
                      onChange={e => setNewTeacher({...newTeacher, designation: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Professor"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={newTeacher.subject}
                      onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Pathology"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Add Teacher
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Current Teaching Faculty</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Designation</th>
                        <th className="px-6 py-3">Subject</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">{t.id}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{t.name}</td>
                          <td className="px-6 py-4 text-slate-600">{t.designation}</td>
                          <td className="px-6 py-4 text-slate-600">{t.subject}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'environment' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">Learning Environment Satisfaction</h3>
              <div className="space-y-4">
                {envStats.map(item => (
                  <div key={item.item}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-600 truncate mr-2">{item.item}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getHeatColor(item.avg)}`}>
                        {item.avg.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.avg > 3.5 ? 'bg-green-500' : (item.avg > 2.5 ? 'bg-yellow-500' : 'bg-red-500')}`}
                        style={{ width: `${(item.avg / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">Hostel Facilities Satisfaction</h3>
              <div className="space-y-4">
                {hostelStats.map(item => (
                  <div key={item.item}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-600 truncate mr-2">{item.item}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getHeatColor(item.avg)}`}>
                        {item.avg.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.avg > 3.5 ? 'bg-green-500' : (item.avg > 2.5 ? 'bg-yellow-500' : 'bg-red-500')}`}
                        style={{ width: `${(item.avg / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Formative Assessment Problems & Qualitative Feedback</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {evaluations.filter(e => e.qualitativeProblems.trim() !== "").length === 0 ? (
                <div className="p-12 text-center text-slate-400">No specific problems reported yet.</div>
              ) : (
                evaluations.filter(e => e.qualitativeProblems.trim() !== "").map((ev, idx) => (
                  <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                        {ev.phase}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic">"{ev.qualitativeProblems}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
