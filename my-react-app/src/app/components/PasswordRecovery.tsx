import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import { apiService } from '../../services/api';

interface Props {
  initialEmail: string;
  onBack: () => void;
  onSuccess: (email: string, message: string) => void;
  onBusyChange: (busy: boolean) => void;
}

export default function PasswordRecovery({ initialEmail, onBack, onSuccess, onBusyChange }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (step === 'reset' && password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    onBusyChange(true);
    try {
      if (step === 'email') {
        setMessage(await apiService.forgotPassword(email.trim()));
        setStep('reset');
      } else {
        const success = await apiService.resetPassword(email.trim(), password, code.trim());
        onSuccess(email.trim(), success);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset your password. Please try again.');
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  };

  return <div className="password-recovery">
    <div className="recovery-icon" aria-hidden="true">{step === 'email' ? <Mail size={38} strokeWidth={1.3} /> : <KeyRound size={38} strokeWidth={1.3} />}</div>
    <h2 id="auth-title">{step === 'email' ? 'Forgot your password?' : 'Reset your password'}</h2>
    <p className="recovery-description">{step === 'email' ? 'It happens! Enter your email and we’ll send you a code to reset your password.' : <>Enter the code sent to <strong>{email.trim()}</strong> and choose your new password.</>}</p>
    {message && <p className="recovery-success" role="status">{message}</p>}
    <form onSubmit={submit}>
      {step === 'email' ? <label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus disabled={busy} /></label> : <>
        <label>Reset code<input value={code} onChange={e => setCode(e.target.value)} required pattern="[0-9]+" inputMode="numeric" autoComplete="one-time-code" autoFocus disabled={busy} /></label>
        <div className="auth-password-field"><label htmlFor="reset-password">New password</label><div className="auth-password-input"><input id="reset-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required disabled={busy} /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide new password' : 'Show new password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} disabled={busy}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <div className="auth-password-field"><label htmlFor="confirm-password">Confirm password</label><div className="auth-password-input"><input id="confirm-password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required disabled={busy} /><button type="button" className="password-toggle" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(value => !value)} disabled={busy}>{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
      </>}
      {error && <p role="alert">{error}</p>}
      <button className="orange-button" disabled={busy || (step === 'reset' && !code.trim())}>{busy ? 'Please wait…' : step === 'email' ? 'Send code' : 'Reset password'}</button>
    </form>
    {step === 'reset' && <button type="button" className="auth-switch" disabled={busy} onClick={() => { setStep('email'); setCode(''); setPassword(''); setConfirmation(''); setShowPassword(false); setShowConfirmation(false); setError(''); setMessage(''); }}>Use a different email</button>}
    <button type="button" className="auth-switch recovery-back" disabled={busy} onClick={onBack}>Back to sign in</button>
  </div>;
}
