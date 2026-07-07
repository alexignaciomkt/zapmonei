'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Camera, Save, Loader2, DollarSign, Tag, Calendar, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createTransactionClient } from '@/lib/api-client';

const transactionSchema = z.object({
  amount: z.string().min(1, 'Informe o valor'),
  type: z.enum(['ganho', 'gasto']),
  category: z.string().min(1, 'Selecione uma categoria'),
  description: z.string().optional(),
  date: z.string().min(1, 'Selecione a data'),
  is_work: z.boolean(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
}

export default function TransactionModal({ isOpen, onClose, onSuccess, userId }: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'ganho',
      category: 'Corrida',
      date: new Date().toISOString().split('T')[0],
      is_work: true,
    }
  });

  const transactionType = watch('type');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const onSubmit = async (data: TransactionFormValues) => {
    if (!userId) {
      alert('Usuário não identificado.');
      return;
    }
    setLoading(true);

    try {
      // Parse amount: accept both ',' and '.'
      const rawAmount = data.amount.replace(/\./g, '').replace(',', '.');
      const parsedAmount = parseFloat(rawAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error('Valor inválido');

      const payload = {
        tipo: data.type,
        valor: parsedAmount,
        categoria: data.category,
        descricao: data.description || undefined,
        contexto: data.is_work ? 'trabalho' : 'pessoal',
        ocorrencia_em: new Date(data.date + 'T12:00:00').toISOString(),
        user_id: userId,
      };

      await createTransactionClient(payload);

      reset();
      setFile(null);
      setPreview(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert(`Erro: ${error?.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[51] p-4"
          >
            <div className="glass rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-neutral" />
                    Novo Lançamento
                  </h2>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Tipo Switch */}
                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setValue('type', 'ganho')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        transactionType === 'ganho' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Ganho
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('type', 'gasto')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        transactionType === 'gasto' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'
                      }`}
                    >
                      <Minus className="w-4 h-4" /> Gasto
                    </button>
                  </div>

                  {/* Valor */}
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      {...register('amount')}
                      type="text"
                      placeholder="0,00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-lg font-bold placeholder:text-slate-600 focus:outline-none focus:border-neutral/50 transition-colors"
                    />
                    {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount.message}</p>}
                  </div>

                  {/* Categoria e Data Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        {...register('category')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-neutral/50 transition-colors appearance-none [&>option]:bg-[#0a0a0a] [&>option]:text-white"
                      >
                        <option value="">Categoria</option>
                        <option value="Combustível">Combustível</option>
                        <option value="Alimentação">Alimentação</option>
                        <option value="Corrida">Corrida</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Mercado">Mercado</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...register('date')}
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-neutral/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <textarea
                      {...register('description')}
                      placeholder="Descrição (opcional)"
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-neutral/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Upload de Recibo */}
                  <div className="relative">
                    <input
                      type="file"
                      id="receipt-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="receipt-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                        preview ? 'border-neutral/50 bg-neutral/5' : 'border-white/10 hover:border-white/20 bg-white/2'
                      }`}
                    >
                      {preview ? (
                        <div className="relative w-full h-full flex items-center justify-center p-2">
                          <img src={preview} alt="Preview" className="h-full rounded-lg object-contain" />
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }}
                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/80"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Camera className="w-8 h-8 text-slate-500" />
                          <span className="text-xs text-slate-400">Anexar Recibo / Foto</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Contexto Switch */}
                  <div className="flex items-center gap-3 py-2 px-1">
                    <div className="flex-1 text-sm text-slate-400">Gasto de Trabalho?</div>
                    <button
                      type="button"
                      onClick={() => setValue('is_work', !watch('is_work'))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${watch('is_work') ? 'bg-neutral' : 'bg-slate-700'}`}
                    >
                      <motion.div
                        animate={{ x: watch('is_work') ? 26 : 2 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-neutral to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-neutral/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> Salvar Lançamento
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
