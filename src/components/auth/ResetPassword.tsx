// src/components/auth/ResetPassword.tsx
import { useState, type FormEvent } from 'react';
import { Button } from '../primitives/Button';
import { FormField } from '../primitives/FormField';
import { Input } from '../primitives/Input';
import './auth-forms.css';

export interface ResetPasswordProps {
  /** Called with the new password on a valid submit (the reset token is held
   * by the consumer, e.g. from the URL). May be async. */
  onSubmit: (password: string) => Promise<void> | void;
  minLength?: number;
}

/** "Set a new password" form (from a reset link). Slots into the LoginScreen's
 * form panel. Validates match + minimum length. Primitives only. */
export function ResetPassword({ onSubmit, minLength = 8 }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < minLength) {
      setError(`Your password must be at least ${minLength} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(password);
      setDone(true);
    } catch {
      setError('This reset link may have expired. Request a new one and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="ui-auth-form">
        <h2 className="ui-auth-form__title">Password updated</h2>
        <p className="ui-auth-form__lede">You can now sign in with your new password.</p>
      </div>
    );
  }

  const ready = Boolean(password && confirm);

  return (
    <form className="ui-auth-form" onSubmit={handleSubmit}>
      <h2 className="ui-auth-form__title">Set a new password</h2>
      {error && (
        <p className="ui-auth-form__error" role="alert">
          {error}
        </p>
      )}
      <div className="ui-auth-form__fields">
        <FormField htmlFor="reset-password" label="New password">
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="reset-confirm" label="Confirm new password">
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FormField>
      </div>
      <Button type="submit" loading={submitting} disabled={!ready} fullWidth>
        Set password
      </Button>
    </form>
  );
}
