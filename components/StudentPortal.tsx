
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TEACHER_EVAL_ITEMS, 
  LEARNING_ENV_ITEMS, 
  CLINICAL_ITEMS, 
  HOSTEL_ITEMS,
} from '../constants';
import { EvaluationRecord, Phase, Teacher } from '../types';
import { storageService } from '../services/storage';
import RatingScale from './RatingScale';

const StudentPortal: React.FC = () => {
  const [studentToken] = useState("STUDENT_DEMO_HASH");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [phase, setPhase] = useState<Phase>(Phase.P1);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [resideInHostel, setResideInHostel] = useState(false);
  
  const [teacherRatings, setTeacherRatings] = useState<Record<string, number>>({});
  const [envRatings, setEnvRatings] = useState<Record<string, number>>({});
  const [clinicalRatings, setClinicalRatings] = useState<Record<string, number>>({});
  const [hostelRatings, setHostelRatings] = useState<Record<string, number>>({});
  const [isRoleModel, setIsRoleModel] = useState<boolean | null>(null);
  const [qualitativeProblems, setQualitativeProblems] = useState("");
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  useEffect(() => {
    setTeachers(storageService.getTeachers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacherId) {
      setMessage({ text: "Please select a teacher.", type: 'error' });
      return;
    }

    if (storageService.hasEvaluated(studentToken, selectedTeacherId)) {
      setMessage({ text: "You have already evaluated this teacher.", type: 'error' });
      return;
    }

    const newEval: EvaluationRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      phase,
      teacherId: selectedTeacherId,
      ratings: teacherRatings,
      isRoleModel: isRoleModel || false,
      learningEnv: envRatings,
      clinicalSkills: (phase === Phase.P3 || phase === Phase.P4) ? clinicalRatings : undefined,
      hostel: resideInHostel ? hostelRatings : undefined,
      resideInHostel,
      qualitativeProblems
    };

    storageService.saveEvaluation(newEval);
    storageService.addLogEntry(`${studentToken}_${selectedTeacherId}`);
    
    setMessage({ text: "Evaluation submitted successfully. Thank you for your feedback.", type: 'success' });
    
    setTeacherRatings({});
    setIsRoleModel(null);
    setQualitativeProblems("");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Student Evaluation Portal</h1>
        <p className="text-slate-500">Your feedback is anonymous and used for academic improvement.</p>
      </header>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium">{message.text}</p>
          <button onClick={() => setMessage({ text: '', type: null })} className="text-sm underline">Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">1</span>
            Initial Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phase of Study</label>
              <select 
                value={phase}
                onChange={(e) => setPhase(e.target.value as Phase)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(Phase).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={resideInHostel}
                  onChange={(e) => setResideInHostel(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Reside in College Hostel?</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Teacher for Evaluation</label>
              <select 
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.designation} - {t.subject})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">2</span>
            Teacher Performance
          </h2>
          <p className="text-sm text-slate-500 mb-6">Rate from 1 (Never) to 5 (Almost Always)</p>
          
          <div className="space-y-2">
            {TEACHER_EVAL_ITEMS.map(item => (
              <RatingScale 
                key={item}
                label={item}
                value={teacherRatings[item] || 0}
                onChange={(val) => setTeacherRatings(prev => ({...prev, [item]: val}))}
              />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-4">I consider this teacher a role model:</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsRoleModel(true)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${isRoleModel === true ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsRoleModel(false)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${isRoleModel === false ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">3</span>
            Learning Environment
          </h2>
          <p className="text-sm text-slate-500 mb-6">Satisfaction with institutional facilities and phase routine.</p>
          
          <div className="space-y-2">
            {LEARNING_ENV_ITEMS.map(item => (
              <RatingScale 
                key={item}
                label={item}
                value={envRatings[item] || 0}
                onChange={(val) => setEnvRatings(prev => ({...prev, [item]: val}))}
              />
            ))}
          </div>
        </div>

        {(phase === Phase.P3 || phase === Phase.P4) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-blue-800 mb-2 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">4</span>
              Clinical Phase Evaluation
            </h2>
            <p className="text-sm text-slate-500 mb-6">Specific items for students in the 3rd or 4th clinical phases.</p>
            
            <div className="space-y-2">
              {CLINICAL_ITEMS.map(item => (
                <RatingScale 
                  key={item}
                  label={item}
                  value={clinicalRatings[item] || 0}
                  onChange={(val) => setClinicalRatings(prev => ({...prev, [item]: val}))}
                />
              ))}
            </div>
          </div>
        )}

        {resideInHostel && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-blue-800 mb-2 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">H</span>
              Hostel Environment
            </h2>
            <p className="text-sm text-slate-500 mb-6">Feedback regarding residential life.</p>
            
            <div className="space-y-2">
              {HOSTEL_ITEMS.map(item => (
                <RatingScale 
                  key={item}
                  label={item}
                  value={hostelRatings[item] || 0}
                  onChange={(val) => setHostelRatings(prev => ({...prev, [item]: val}))}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">?</span>
            Problems & Suggestions
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Do you think there are problems in formative assessments (items, cards, terms) or the overall environment? Mention below:
            </label>
            <textarea 
              rows={4}
              value={qualitativeProblems}
              onChange={(e) => setQualitativeProblems(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Type your problems or suggestions here..."
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg sticky bottom-4 z-10"
        >
          Submit Anonymous Evaluation
        </button>
      </form>
    </div>
  );
};

export default StudentPortal;
