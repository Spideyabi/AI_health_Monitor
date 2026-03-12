import { useState, useEffect } from "react";
import { useVitals } from "./VitalsEngine";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Save, 
  Weight, 
  Ruler, 
  Stethoscope, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  Dna,
  Edit3,
  X,
  Plus,
  FileText,
  Clock,
  ExternalLink,
  Upload,
  BrainCircuit
} from "lucide-react";

export default function Profile() {
  const { user, updateProfile, setUser } = useVitals();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [reports, setReports] = useState({ ai: [], custom: user?.customReports || [] });
  const [uploadData, setUploadData] = useState({ title: "", fileName: "", fileData: "" });
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    age: user?.age || "",
    gender: user?.gender || "",
    weight: user?.weight || "",
    height: user?.height || "",
    healthHistory: user?.healthHistory || ""
  });

  // Sync formData with user state when user object loads
  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age || "",
        gender: user.gender || "",
        weight: user.weight || "",
        height: user.height || "",
        healthHistory: user.healthHistory || ""
      });
      
      // Decide if we start in edit mode (first time) or read-only
      if (user.age) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    }
  }, [user?.email, user?.age]);

  // Fetch reports on load
  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.email) return;
      try {
        const response = await fetch(`/api/user/profile?email=${user.email}`);
        const data = await response.json();
        if (response.ok) {
          // Force global state sync if server has more fields (e.g. after re-login)
          if (data.user) {
            setUser(data.user);
          }
          
          setReports({
            ai: data.aiReports || [],
            custom: data.user?.customReports || []
          });
        }
      } catch (error) {
        console.error("Fetch reports error:", error);
      }
    };
    fetchReports();
  }, [user?.email, user?.customReports]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } else {
      setMessage({ type: "error", text: result.message || "Failed to update profile" });
    }
    setIsSaving(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate reading file to Base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploadData({
        title: file.name.split('.')[0],
        fileName: file.name,
        fileData: event.target.result // Base64 string
      });
    };
    reader.readAsDataURL(file);
  };

  const saveCustomReport = async () => {
    if (!uploadData.fileData) return;
    setIsUploading(true);
    
    // Optimistically update custom reports
    const newCustomReports = [...reports.custom, { ...uploadData, uploadDate: new Date() }];
    
    const result = await updateProfile({ customReports: newCustomReports });
    if (result.success) {
      setReports(prev => ({ ...prev, custom: newCustomReports }));
      setUploadData({ title: "", fileName: "", fileData: "" });
      setMessage({ type: "success", text: "Report uploaded successfully!" });
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header with Edit Toggle */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
            <div className="w-full h-full rounded-2xl bg-[#050505] flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-zinc-500">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all border font-bold ${
            isEditing 
            ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20" 
            : "bg-purple-600/10 border-purple-500/50 text-purple-400 hover:bg-purple-600/20"
          }`}
        >
          {isEditing ? <X size={18} /> : <Edit3 size={18} />}
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Biometric Data Section */}
          <motion.div 
            layout
            className="stats-card p-8 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-8">
              <Dna className="text-purple-500" size={20} />
              <h2 className="text-xl font-bold">Biometric Profile</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <ProfileField 
                label="Age" 
                icon={<Calendar size={18} />} 
                value={formData.age} 
                isEditing={isEditing}
                type="number"
                onChange={(v) => setFormData({...formData, age: v})}
                placeholder="Years"
              />
              <ProfileField 
                label="Gender" 
                icon={<User size={18} />} 
                value={formData.gender} 
                isEditing={isEditing}
                type="select"
                onChange={(v) => setFormData({...formData, gender: v})}
                options={['male', 'female', 'other']}
              />
              <ProfileField 
                label="Weight" 
                icon={<Weight size={18} />} 
                value={formData.weight} 
                unit="kg"
                isEditing={isEditing}
                type="number"
                onChange={(v) => setFormData({...formData, weight: v})}
                placeholder="Mass"
              />
              <ProfileField 
                label="Height" 
                icon={<Ruler size={18} />} 
                value={formData.height} 
                unit="cm"
                isEditing={isEditing}
                type="number"
                onChange={(v) => setFormData({...formData, height: v})}
                placeholder="Stature"
              />
            </div>

            {isEditing && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="mt-10 flex justify-end"
              >
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
                >
                  {isSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Changes
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Medical History Section */}
          <motion.div 
            layout
            className="stats-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Stethoscope className="text-pink-500" size={20} />
              <h2 className="text-xl font-bold">Clinical History</h2>
            </div>
            
            {isEditing ? (
              <textarea
                className="w-full h-[150px] bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all text-sm resize-none text-zinc-300"
                value={formData.healthHistory}
                onChange={(e) => setFormData({...formData, healthHistory: e.target.value})}
                placeholder="Chronic conditions, allergies, or past surgeries..."
              />
            ) : (
              <p className="text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/5 italic min-h-[100px]">
                {formData.healthHistory || "No medical history recorded."}
              </p>
            )}
          </motion.div>

          {/* Reports Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 ml-2">
              <FileText className="text-emerald-500" />
              Medical Report Archive
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Reports List */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-500 ml-2">AI Consultations</h3>
                {reports.ai.length === 0 ? (
                  <EmptyState text="No AI reports yet" />
                ) : (
                  reports.ai.map((r, i) => (
                    <ReportCard key={i} title={r.diagnosis.title} date={new Date(r.createdAt)} type="ai" />
                  ))
                )}
              </div>

              {/* Custom Reports List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-500">Custom Uploads</h3>
                </div>
                {reports.custom.length === 0 && !uploadData.fileData ? (
                  <EmptyState text="No uploaded reports" />
                ) : (
                  <>
                    {uploadData.fileData && (
                      <div className="stats-card p-4 border-dashed border-purple-500/50 bg-purple-500/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-purple-400">Ready to save</span>
                          <button onClick={() => setUploadData({title:"", fileName:"", fileData:""})}><X size={14} /></button>
                        </div>
                        <input 
                          type="text" 
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm mb-3 outline-none"
                          value={uploadData.title}
                          onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                        />
                        <button 
                          onClick={saveCustomReport}
                          disabled={isUploading}
                          className="w-full py-2 bg-purple-600 rounded-lg text-xs font-bold"
                        >
                          {isUploading ? "Uploading..." : "Finalize Upload"}
                        </button>
                      </div>
                    )}
                    {reports.custom.map((r, i) => (
                      <ReportCard key={i} title={r.title} date={new Date(r.uploadDate)} type="custom" />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: File Upload & Stats */}
        <div className="space-y-8">
          <div className="stats-card p-6 bg-emerald-500/5 border-emerald-500/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload className="text-emerald-400" size={20} />
              Add Medical Record
            </h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Securely store lab results, doctor notes, or prescriptions to keep your health data Centralized.
            </p>
            
            <label className="w-full flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Plus className="text-zinc-600 group-hover:text-emerald-400 mb-2" size={24} />
                <p className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300">Choose document</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
            </label>
          </div>

          <div className="stats-card p-6">
            <h3 className="text-lg font-bold mb-6">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-zinc-500">Member Since</span>
                <span className="text-xs font-bold">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-zinc-500">Data Integrity</span>
                <span className="text-xs font-bold text-emerald-400">High Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility Components
function ProfileField({ label, icon, value, isEditing, type, onChange, placeholder, unit, options }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-600 ml-1">{label}</label>
      <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        isEditing ? "bg-white/10 border-purple-500/50 shadow-inner shadow-black/20" : "bg-white/5 border-white/5"
      }`}>
        <span className="text-zinc-500">{icon}</span>
        {isEditing ? (
          type === 'select' ? (
            <select 
              className="flex-1 bg-transparent text-sm outline-none capitalize"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Choose...</option>
              {options.map(opt => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
            </select>
          ) : (
            <input 
              type={type}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm outline-none"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )
        ) : (
          <span className="flex-1 text-sm font-medium text-zinc-300 capitalize">
            {value || "—"} {value && unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ReportCard({ title, date, type }) {
  return (
    <div className="group stats-card p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/5">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          type === 'ai' ? 'bg-purple-600/10 text-purple-400' : 'bg-emerald-600/10 text-emerald-400'
        }`}>
          {type === 'ai' ? <BrainCircuit size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate group-hover:text-purple-400 transition-colors">{title}</h4>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
            <Clock size={10} />
            {date.toLocaleDateString()}
          </div>
        </div>
        <ExternalLink size={14} className="text-zinc-700 group-hover:text-zinc-500" />
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="stats-card p-8 flex flex-col items-center justify-center text-center opacity-50 border-dashed">
      <X size={24} className="mb-2 text-zinc-700" />
      <span className="text-xs font-medium text-zinc-600">{text}</span>
    </div>
  );
}
