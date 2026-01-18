import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, X, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TodoList() {
  const [isOpen, setIsOpen] = useState(false);
  const [todos, setTodos] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todosApp');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newTodo, setNewTodo] = useState("");

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const updated = [...todos, { id: Date.now(), text: newTodo, completed: false }];
    setTodos(updated);
    localStorage.setItem('todosApp', JSON.stringify(updated));
    setNewTodo("");
    toast.success('משימה נוספה');
  };

  const toggleTodo = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    localStorage.setItem('todosApp', JSON.stringify(updated));
  };

  const deleteTodo = (id) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    localStorage.setItem('todosApp', JSON.stringify(updated));
    toast.success('משימה נמחקה');
  };

  const completed = todos.filter(t => t.completed).length;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 relative">
            <CheckSquare className="w-8 h-8 text-white" />
            {todos.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {todos.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">רשימת משימות</h3>
            <p className="text-blue-100">ניהול משימות יומיות</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          עקוב אחרי משימותיך וארגן את יומך
        </p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold dark:text-white">משימותיי</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {todos.length > 0 && (
                <div className="mb-6 flex items-center justify-between text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    {completed} מתוך {todos.length} משימות הושלמו
                  </p>
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all" style={{width: `${(completed/todos.length)*100}%`}}></div>
                  </div>
                </div>
              )}

              <form onSubmit={addTodo} className="mb-6 flex gap-2">
                <Input
                  type="text"
                  placeholder="הוסף משימה חדשה..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5" />
                </Button>
              </form>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {todos.length > 0 ? (
                  todos.map(todo => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          todo.completed
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {todo.completed && <CheckSquare className="w-4 h-4" />}
                      </button>
                      <span
                        className={`flex-1 ${
                          todo.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'dark:text-white'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    אין משימות כרגע
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}