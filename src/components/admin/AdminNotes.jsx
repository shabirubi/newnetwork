import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminNotes() {
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: ''
  });

  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const getUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    getUser();
  }, []);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['admin-notes'],
    queryFn: () => base44.entities.AdminNote.list('-created_date', 500)
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.AdminNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notes']);
      toast.success('ההערה נוצרה');
      resetForm();
    },
    onError: () => toast.error('שגיאה ביצירת הערה')
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AdminNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notes']);
      toast.success('ההערה עודכנה');
      resetForm();
    },
    onError: () => toast.error('שגיאה בעדכון')
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notes']);
      toast.success('ההערה נמחקה');
    },
    onError: () => toast.error('שגיאה במחיקה')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const noteData = {
      ...formData,
      author_email: user.email,
      author_name: user.full_name || user.email
    };

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', priority: 'medium', status: 'pending', assigned_to: '' });
    setEditingNote(null);
    setShowForm(false);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      priority: note.priority,
      status: note.status,
      assigned_to: note.assigned_to || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!confirm('האם למחוק הערה זו?')) return;
    deleteNoteMutation.mutate(id);
  };

  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  const statusIcons = {
    pending: Clock,
    in_progress: AlertCircle,
    completed: CheckCircle
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">הערות מנהלים</h2>
          <p className="text-gray-400">תקשורת פנימית בין מנהלי המערכת</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#E31E24]">
          <Plus className="w-4 h-4 ml-2" />
          הערה חדשה
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            {editingNote ? 'עריכת הערה' : 'הערה חדשה'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="כותרת"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Textarea
              placeholder="תוכן ההערה..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              className="bg-gray-700 border-gray-600 text-white h-32"
            />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">דחיפות</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                  <option value="urgent">דחוף</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">סטטוס</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                >
                  <option value="pending">ממתין</option>
                  <option value="in_progress">בטיפול</option>
                  <option value="completed">הושלם</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">מוקצה ל</label>
                <Input
                  placeholder="אימייל מנהל"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-[#E31E24]">
                {editingNote ? 'עדכן' : 'צור'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline" className="bg-gray-700 border-gray-600">
                ביטול
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-3">
        {notes.map((note) => {
          const StatusIcon = statusIcons[note.status];
          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">{note.title}</h3>
                    <span className={`${priorityColors[note.priority]} w-2 h-2 rounded-full`}></span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{note.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{note.author_name}</span>
                    <span>•</span>
                    <span>{new Date(note.created_date).toLocaleString('he-IL')}</span>
                    {note.assigned_to && (
                      <>
                        <span>•</span>
                        <span>מוקצה ל: {note.assigned_to}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {note.status === 'pending' ? 'ממתין' : note.status === 'in_progress' ? 'בטיפול' : 'הושלם'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(note)} size="sm" variant="outline" className="bg-gray-700 border-gray-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDelete(note.id)} size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}