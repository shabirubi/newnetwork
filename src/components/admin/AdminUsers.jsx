import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Trash2, UserCheck, UserX, Mail, Calendar, Shield, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 1000)
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      await base44.asServiceRole.entities.User.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-users']);
      toast.success('המשתמש נמחק בהצלחה');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('שגיאה במחיקת המשתמש');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.asServiceRole.entities.User.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-users']);
      toast.success('המשתמש עודכן בהצלחה');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('שגיאה בעדכון המשתמש');
    }
  });

  const handleDelete = (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;
    deleteUserMutation.mutate(id);
  };

  const toggleRole = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    updateUserMutation.mutate({ id: user.id, data: { role: newRole } });
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
          <h2 className="text-3xl font-bold text-white mb-2">ניהול משתמשים</h2>
          <p className="text-gray-400">סה"כ {users.length} משתמשים</p>
        </div>
        <Button onClick={refetch} variant="outline" className="bg-gray-800 border-gray-700">
          <RefreshCw className="w-4 h-4 ml-2" />
          רענן
        </Button>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{user.full_name || 'ללא שם'}</p>
                    {user.role === 'admin' && (
                      <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        מנהל
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.created_date).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => toggleRole(user)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  {user.role === 'admin' ? (
                    <>
                      <UserX className="w-4 h-4 ml-2" />
                      הסר מנהל
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 ml-2" />
                      הפוך למנהל
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDelete(user.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}