import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface RegisterViewProps {
  onBackToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onBackToLogin }) => {
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessSegment, setBusinessSegment] = useState('clinica');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    if (!businessName.trim()) {
      setErrorMessage('Por favor, informe o nome do seu estabelecimento (clínica, barbearia, salão).');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu melhor e-mail comercial.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUpWithEmail({
        name,
        email,
        phone,
        password,
        accountType: 'empresa',
        businessName,
        businessSegment,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Não foi possível criar sua conta. Tente novamente.');
      } else {
        if (result.message) {
          setSuccessMessage(result.message);
        } else {
          // Automatic login and navigation
          navigate('/');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro inesperado ao criar conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] sm:w-[480px] p-6 sm:p-8 bg-white text-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="text-center mb-6 flex flex-col items-center">
        <BrandLogo size="lg" showTagline={false} className="mb-2" />
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Cadastre seu Estabelecimento
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          14 dias grátis para testar a plataforma personalizada com a sua marca
        </p>
      </div>

      {/* Info Badge */}
      <div className="mb-5 p-3 rounded-2xl bg-[#EDE9FE]/70 border border-[#C4B5FD] flex items-center gap-2.5 text-xs text-[#4C1D95]">
        <span className="material-symbols-outlined text-[1.25rem] text-[#7C3AED] shrink-0">verified_user</span>
        <span className="font-medium leading-relaxed">
          Crie seu sistema, personalize logo e cores e receba seus links exclusivos para clientes.
        </span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200"
        >
          <span className="material-symbols-outlined text-rose-600 text-[1.125rem] shrink-0 mt-0.5">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200"
        >
          <span className="material-symbols-outlined text-emerald-600 text-[1.125rem] shrink-0 mt-0.5">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome do Responsável */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Seu Nome Completo
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[1.125rem] pointer-events-none">
              person
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Dra. Mariana Silveira"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-xs font-medium text-slate-900 transition-all outline-none"
            />
          </div>
        </div>

        {/* Nome do Estabelecimento */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nome do seu Estabelecimento
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[1.125rem] pointer-events-none">
              storefront
            </span>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Clínica Bella Vita / Barbearia Dom Camilo"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-xs font-medium text-slate-900 transition-all outline-none"
            />
          </div>
        </div>

        {/* Segmento da Empresa */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Segmento de Atuação
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[1.125rem] pointer-events-none">
              category
            </span>
            <select
              value={businessSegment}
              onChange={(e) => setBusinessSegment(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-xs font-medium text-slate-900 transition-all outline-none cursor-pointer"
            >
              <option value="clinica">🌸 Clínica, Estética & Dermatologia</option>
              <option value="barbearia">✂️ Barbearia & Cuidados Masculinos</option>
              <option value="salao">💇‍♀️ Salão de Beleza & Cabelereiros</option>
              <option value="saude_spa">🌿 Saúde, Fisioterapia & Spa</option>
              <option value="outro">⚡ Outros Serviços com Agendamento</option>
            </select>
          </div>
        </div>

        {/* WhatsApp Comercial */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            WhatsApp para Notificações
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[1.125rem] pointer-events-none">
              chat
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-xs font-medium text-slate-900 transition-all outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Seu E-mail Comercial (Login)
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[1.125rem] pointer-events-none">
              mail
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@seuestabelecimento.com.br"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-xs font-medium text-slate-900 transition-all outline-none"
            />
          </div>
        </div>

        {/* Senha */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Crie uma Senha
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[1.125rem] pointer-events-none">
              lock
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-xs font-medium text-slate-900 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.125rem]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 mt-2 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#4C1D95]/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Criando seu sistema...</span>
            </div>
          ) : (
            <>
              <span>Criar Minha Conta & Começar Teste Grátis</span>
              <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Já possui uma conta de empresa?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-[#7C3AED] hover:text-[#4C1D95] font-bold hover:underline cursor-pointer"
          >
            Fazer Login
          </button>
        </p>
      </div>
    </div>
  );
};
