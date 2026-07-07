'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { loginClient } from '@/lib/api-client';
import { Phone, Lock, ChevronRight, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

// ── Phone mask helper ──
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 9) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)} ${digits.slice(9)}`;
}

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      setError('Por favor, insira um número de WhatsApp válido.');
      setLoading(false);
      return;
    }

    try {
      await loginClient(cleanPhone, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh text-white font-outfit flex items-center justify-center relative overflow-hidden"
      style={{ background: '#050505', padding: '16px' }}
    >
      {/* ── Background Effects ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ top: '-30%', right: '-20%', width: '70%', height: '70%', background: 'rgba(204,255,0,0.03)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ bottom: '-30%', left: '-20%', width: '70%', height: '70%', background: 'rgba(45,63,231,0.03)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.012,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Centered Modal ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '400px', zIndex: 10 }}
      >
        {/* Glass Card */}
        <div
          style={{
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '32px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{ width: '60px', height: '60px', margin: '0 auto 16px' }}
            >
              <img
                src="/icone.png"
                alt="ZapMonei"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 20px rgba(204,255,0,0.2))',
                }}
              />
            </motion.div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Acesse seu painel
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
              Entre com seu WhatsApp e a senha cadastrada
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  color: '#fb7185',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Phone Field */}
            <div style={{ marginBottom: '14px' }}>
              <label
                htmlFor="login-phone"
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: '6px',
                  marginLeft: '4px',
                }}
              >
                Número de WhatsApp
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }}>
                  <Phone size={17} />
                </div>
                <input
                  id="login-phone"
                  type="text"
                  inputMode="numeric"
                  placeholder="55 11 99999 9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  autoComplete="tel"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '14px 16px 14px 44px',
                    fontSize: '15px',
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(204,255,0,0.3)';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(204,255,0,0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.background = 'rgba(255,255,255,0.04)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: '6px',
                  marginLeft: '4px',
                }}
              >
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }}>
                  <Lock size={17} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '14px 44px 14px 44px',
                    fontSize: '15px',
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(204,255,0,0.3)';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(204,255,0,0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.background = 'rgba(255,255,255,0.04)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.2)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#CCFF00',
                color: '#050505',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(204,255,0,0.12)',
              }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.filter = 'none'; }}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>Entrar no Painel <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          {/* Divider + Sign Up */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
              Ainda não tem uma conta?{' '}
              <a
                href="https://zapmonei.com.br"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#CCFF00', fontWeight: 700, textDecoration: 'none' }}
              >
                Conheça o ZapMonei
              </a>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'rgba(255,255,255,0.15)',
            fontSize: '10px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          <ShieldCheck size={12} />
          <span>Conexão segura e criptografada</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
