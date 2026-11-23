import React, { useState } from 'react';
import { LegalSheet, type LegalDoc } from './LegalSheet';

/**
 * Create Account / Sign In screen (from the Stitch "lockscreen" design).
 * UI only for now: the Supabase wiring (sign up, sign in, saved session) comes next.
 */
interface Props {
  /** Called when the form is submitted with valid-looking input. Wired to Supabase later. */
  onSubmit?: (mode: Mode, values: { name: string; email: string; password: string }) => Promise<string | null>;
  onBack?: () => void;
}

export type Mode = 'signup' | 'signin';

const CSS = `
.ls-glass-input {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.18);
  transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
}
.ls-glass-input:focus-within {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.55);
  box-shadow: 0 0 20px rgba(255,255,255,0.18), inset 0 0 8px rgba(255,255,255,0.08);
  transform: translateY(-1px) scale(1.01);
}
.ls-glass-input:focus-within .ls-icon {
  color: #fff;
  filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
  transform: scale(1.08);
}
.ls-glass-input input:focus { outline: none; box-shadow: none; }
.ls-glass-circle {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.18);
  transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
.ls-glass-circle:hover { background: rgba(255,255,255,0.2); transform: scale(1.08); }
.ls-glass-circle:active { transform: scale(0.92); }
.ls-cta { position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
.ls-cta::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 40%; height: 200%;
  background: linear-gradient(60deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(25deg); animation: lsShimmer 5s infinite ease-in-out;
}
.ls-cta:active { transform: scale(0.97); }
@keyframes lsShimmer { 0%,70% { left: -80%; } 85%,100% { left: 140%; } }
@keyframes lsIn { 0% { opacity: 0; transform: translateY(22px) scale(0.98); } 100% { opacity: 1; transform: none; } }
.ls-a1 { animation: lsIn .7s cubic-bezier(.16,1,.3,1) .05s both; }
.ls-a2 { animation: lsIn .7s cubic-bezier(.16,1,.3,1) .15s both; }
.ls-a3 { animation: lsIn .7s cubic-bezier(.16,1,.3,1) .25s both; }
.ls-a4 { animation: lsIn .7s cubic-bezier(.16,1,.3,1) .35s both; }
.ls-a5 { animation: lsIn .7s cubic-bezier(.16,1,.3,1) .45s both; }
.ls-a6 { animation: lsIn .7s cubic-bezier(.16,1,.3,1) .55s both; }
.ls-a7 { animation: lsIn .7s cubic-bezier(.16,1,.3,1) .65s both; }
@keyframes lsDrift1 { 0%,100% { transform: translate(0,0) scale(1); opacity:.35; } 50% { transform: translate(35px,-18px) scale(1.15); opacity:.6; } }
@keyframes lsDrift2 { 0%,100% { transform: translate(0,0) scale(1); opacity:.25; } 50% { transform: translate(-30px,20px) scale(1.2); opacity:.55; } }
.ls-orb1 { animation: lsDrift1 12s ease-in-out infinite; }
.ls-orb2 { animation: lsDrift2 16s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .ls-root *, .ls-root *::after { animation: none !important; transition-duration: .01ms !important; }
}
`;

const inputCls =
  'w-full bg-transparent border-0 text-[14.5px] text-white placeholder-gray-400 p-0 font-normal tracking-wide outline-none';

export const LoginScreen: React.FC<Props> = ({ onSubmit, onBack }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(true);
  const [remember, setRemember] = useState(true);
  const [legal, setLegal] = useState<LegalDoc | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (isSignup && !name.trim()) return setError('Please enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Please enter a valid email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (isSignup && !agree) return setError('Please accept the Terms of Service and Privacy Policy.');
    setError('');
    setBusy(true);
    const err = await onSubmit?.(mode, { name: name.trim(), email: email.trim(), password });
    setBusy(false);
    if (err) setError(err);
  };

  const switchMode = () => {
    setMode(isSignup ? 'signin' : 'signup');
    setError('');
  };

  return (
    <div
      className="ls-root absolute inset-0 overflow-hidden text-white flex flex-col"
      style={{
        backgroundImage: 'url(/lockscreen/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <style>{CSS}</style>
      {/* Dulls the background so the form stays readable */}
      <div className="absolute inset-0 bg-stone-950/60 pointer-events-none" />
      {/* Soft drifting light in the sky */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="ls-orb1 absolute top-14 left-1/4 w-44 h-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="ls-orb2 absolute top-40 right-4 w-52 h-52 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-5 pb-5 overflow-y-auto">
        <div>
          <div className="ls-a1 h-10">
            {!isSignup && (
              <button
                type="button"
                aria-label="Go back"
                onClick={onBack ?? switchMode}
                className="ls-glass-circle w-10 h-10 rounded-full flex items-center justify-center text-white/90"
              >
                <svg className="w-5 h-5 -ml-0.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
          </div>

          <div className="mt-6 text-center px-3 ls-a2">
            <h1 className="text-[28px] leading-tight font-bold tracking-tight">
              {isSignup ? 'Create Account' : 'Welcome again <3'}
            </h1>
            <p className="text-[13.5px] leading-relaxed text-[#c2c5cd] mt-2 max-w-[270px] mx-auto">
              {isSignup
                ? 'Join us today to manage everything your farm needs with ease.'
                : 'Everything your farm needs, in the palm of your hand. Welcome again'}
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
            {isSignup && (
              <div className="ls-glass-input ls-a3 h-14 rounded-full flex items-center px-5 gap-3.5">
                <svg className="ls-icon w-5 h-5 text-gray-300 shrink-0 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="ls-glass-input ls-a4 h-14 rounded-full flex items-center px-5 gap-3.5">
              <svg className="ls-icon w-5 h-5 text-gray-300 shrink-0 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect height="15" rx="3.5" width="20" x="2" y="4.5" />
                <path d="m4.5 7.5 7.5 5 7.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                className={inputCls}
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="ls-glass-input ls-a5 h-14 rounded-full flex items-center px-5 gap-3.5">
              <svg className="ls-icon w-5 h-5 text-gray-300 shrink-0 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect height="11" rx="3" width="16" x="4" y="10" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="15.5" fill="currentColor" r="1" stroke="none" />
              </svg>
              <input
                className={inputCls + (showPw ? '' : ' tracking-widest')}
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                onClick={() => setShowPw((v) => !v)}
                className="text-gray-300 hover:text-white p-1 active:scale-90 transition-all"
              >
                {showPw ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                    <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>

            {isSignup && (
              <label className="ls-a6 flex items-start gap-2.5 pt-1 px-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded-[4px] accent-white cursor-pointer"
                />
                <span className="text-[12.5px] leading-snug text-gray-200">
                  I agree to the{' '}
                  <button type="button" onClick={(e) => { e.preventDefault(); setLegal('terms'); }} className="text-white font-medium underline">Terms of Service</button> and{' '}
                  <button type="button" onClick={(e) => { e.preventDefault(); setLegal('privacy'); }} className="text-white font-medium underline">Privacy Policy</button>
                </span>
              </label>
            )}

            {!isSignup && (
              <div className="ls-a6 flex items-center px-1 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded-[4px] accent-white cursor-pointer"
                  />
                  <span className="text-[12.5px] text-gray-200">Remember me</span>
                </label>
              </div>
            )}

            {error && (
              <p role="alert" className="text-[12.5px] text-red-200 text-center px-2">
                {error}
              </p>
            )}

            <div className="ls-a7 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="ls-cta disabled:opacity-70 w-full py-3.5 bg-white text-stone-950 font-bold text-[15px] rounded-full shadow-lg flex items-center justify-center tracking-wide"
              >
                {busy ? 'Please wait…' : isSignup ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>

        <footer className="ls-a7 text-center pt-6 pb-2">
          <p className="text-[13px] text-[#9ca3af]">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={switchMode} className="font-bold text-white ml-1 hover:underline">
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </footer>
      </div>
      {legal && <LegalSheet doc={legal} onClose={() => setLegal(null)} />}
    </div>
  );
};
