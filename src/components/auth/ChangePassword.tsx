// src/components/auth/ChangePassword.tsx
import { useState, type FormEvent } from 'react';
import { Button } from '../primitives/Button';
import { FormField } from '../primitives/FormField';
import { Input } from '../primitives/Input';
import './auth-forms.css';

export interface ChangePasswordProps {
  /** Called with (currentPassword, newPassword) on a valid submit. May be async. */
  onSubmit: (current: string, next: string) => Promise<void> | void;
  /** Minimum new-password length. Default 8. */
  minLength?: number;
}

/** In-app password change form (lives inside the AppShell, not the split
 * screen). Validates match + minimum length client-side. Primitives only. */
export function ChangePassword({ onSubmit, minLength = 8 }: ChangePasswordProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (next.length < minLength) {
      setError(`Your new password must be at least ${minLength} characters.`);
      return;
    }
    if (next !== confirm) {
      setError('The new passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      setError('We could not change your password. Check your current password and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const ready = Boolean(current && next && confirm);

  return (
    <form className="ui-auth-form" onSubmit={handleSubmit}>
      <h2 className="ui-auth-form__title">Change password</h2>
      {done && <p className="ui-auth-form__success">Your password has been changed.</p>}
      {error && (
        <p className="ui-auth-form__error" role="alert">
          {error}
        </p>
      )}
      <div className="ui-auth-form__fields">
        <FormField htmlFor="current-password" label="Current password">
          <Input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="new-password" label="New password">
          <Input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="confirm-password" label="Confirm new password">
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FormField>
      </div>
      <Button type="submit" loading={submitting} disabled={!ready}>
        Change password
      </Button>
    </form>
  );
}
