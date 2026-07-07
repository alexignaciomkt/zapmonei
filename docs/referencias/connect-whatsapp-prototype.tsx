'use client';

import { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, Loader2, QrCode, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function ConnectWhatsApp() {
  const [status, setStatus] = useState<'disconnected' | 'pairing' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [instanceName, setInstanceName] = useState('');

  const handleStartPairing = async () => {
    if (!userId || !instanceName) {
      alert('Por favor, preencha o ID do usuário e o nome da instância.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/evolution/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, instanceName }),
      });

      const data = await response.json();

      if (data.status === 'connected') {
        setStatus('connected');
      } else if (data.qrcode) {
        setQrCode(data.qrcode);
        setStatus('pairing');
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      alert('Erro ao iniciar pareamento. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  // Polling para verificar status da conexão
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'pairing' && instanceName) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/evolution/instance?instanceName=${instanceName}`);
          const data = await response.json();

          if (data.instance?.status === 'open') {
            setStatus('connected');
            setQrCode(null);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, instanceName]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Conectar WhatsApp</h1>
          <p className="text-gray-500 mt-2">Conecte seu próprio número para usar o agente IA</p>
        </div>

        {status === 'disconnected' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID do Usuário (Supabase)</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Ex: uuid-do-usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Instância (WhatsApp)</label>
              <input
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Ex: jose_whatsapp"
              />
            </div>
            <button
              onClick={handleStartPairing}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <QrCode className="h-5 w-5 mr-2" />
              )}
              Gerar QR Code
            </button>
          </div>
        )}

        {status === 'pairing' && qrCode && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 border-2 border-green-500 rounded-xl shadow-inner">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
            </div>
            <div className="flex items-center text-amber-600 animate-pulse">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              <p className="text-sm font-medium">Aguardando leitura do QR Code...</p>
            </div>
            <button
              onClick={() => setStatus('disconnected')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancelar e voltar
            </button>
          </div>
        )}

        {status === 'connected' && (
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Conectado com Sucesso!</h2>
            <p className="text-gray-600">
              Seu WhatsApp está pronto para interagir com o ZapMonei.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Ir para o Painel
            </button>
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex items-start space-x-3 text-xs text-gray-500">
            <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
