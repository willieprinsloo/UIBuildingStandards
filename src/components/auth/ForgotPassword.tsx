// src/components/auth/ForgotPassword.tsx
import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { FormField } from '../primitives/FormField';
import { Input } from '../primitives/Input';
import './auth-forms.css';

export interface ForgotPasswordProps {
  /** Called with the email on submit. May be async. Should trigger a backend
   * endpoint that sends the reset email (via MetaMail) — never a mail key in
   * the client. */
  onSubmit: (email: string) => Promise<void> | void;
  /** Optional link back to sign-in (slot). */
  backToSignIn?: ReactNode;
}

/** "Forgot password" request form. Slots into the LoginScreen's form panel.
 * Shows a neutral confirmation (no account enumeration). Primitives only. */
export function ForgotPassword({ onSubmit, backToSignIn }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(email.trim());
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="ui-auth-form">
        <h2 className="ui-auth-form__title">Check your email</h2>
        <p className="ui-auth-form__lede">
          If <strong>{email}</strong> has an account, we’ve sent a link to reset
          your password.
        </p>
        {backToSignIn != null && <p className="ui-auth-form__footer">{backToSignIn}</p>}
      </div>
    );
  }

  return (
    <form className="ui-auth-form" onSubmit={handleSubmit}>
      <h2 className="ui-auth-form__title">Reset your password</h2>
      <p className="ui-auth-form__lede">
        Enter your email and we’ll send you a link to set a new password.
      </p>
      <div className="ui-auth-form__fields">
        <FormField htmlFor="forgot-email" label="Email address">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
      </div>
      <Button type="submit" loading={submitting} disabled={!email.trim()} fullWidth>
        Send reset link
      </Button>
      {backToSignIn != null && <p className="ui-auth-form__footer">{backToSignIn}</p>}
    </form>
  );
}
