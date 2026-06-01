import { useState, useEffect } from 'react';
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import { getUserSettings, updateUserSettings } from "../services/userSettingsApi";
import toast from "../components/common/Toast";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    startTime: "", 
    endTime: "", 
    preventOverlap: false, 
    defaultDuration: "" 
  });

  useEffect(() => {
    getUserSettings()
      .then(data => { setFormData(data); setLoading(false); })
      .catch(() => { toast.error("Error al cargar"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserSettings(formData);
      toast.success("Configuración actualizada");
    } catch { 
      toast.error("Error al guardar"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Configuración</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Hora de inicio" type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
            <TextInput label="Hora de fin" type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
          </div>
          
          <TextInput label="Duración default (minutos)" type="number" value={formData.defaultDuration} onChange={(e) => setFormData({...formData, defaultDuration: e.target.value})} />
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.preventOverlap} onChange={(e) => setFormData({...formData, preventOverlap: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-700">Evitar solapamientos al consolidar actividades</span>
          </label>
          
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button onClick={handleSave} disabled={loading} className="flex-1">{loading ? "Guardando..." : "Guardar cambios"}</Button>
            <Button variant="secondary" onClick={() => window.history.back()} className="w-24 bg-slate-100">Volver</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default Settings;