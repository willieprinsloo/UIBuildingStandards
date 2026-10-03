import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePassword, ForgotPassword, ResetPassword } from '../index';

describe('ChangePassword', () => {
  it('rejects mismatched passwords without calling onSubmit', async () => {
    const onSubmit = vi.fn();
    render(<ChangePassword onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Current password'), 'oldpass12');
    await userEvent.type(screen.getByLabelText('New password'), 'newpass12');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('do not match');
  });

  it('submits current + new when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ChangePassword onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Current password'), 'oldpass12');
    await userEvent.type(screen.getByLabelText('New password'), 'newpass12');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpass12');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
    expect(onSubmit).toHaveBeenCalledWith('oldpass12', 'newpass12');
  });
});

describe('ForgotPassword', () => {
  it('submits the email and shows a neutral confirmation', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ForgotPassword onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Email address'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(onSubmit).toHaveBeenCalledWith('a@b.com');
    expect(await screen.findByText('Check your email')).toBeInTheDocument();
  });
});

describe('ResetPassword', () => {
  it('enforces the minimum length', async () => {
    const onSubmit = vi.fn();
    render(<ResetPassword onSubmit={onSubmit} minLength={8} />);
    await userEvent.type(screen.getByLabelText('New password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Set password' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('at least 8');
  });

  it('submits the new password and confirms', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResetPassword onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('New password'), 'newpass12');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpass12');
    await userEvent.click(screen.getByRole('button', { name: 'Set password' }));
    expect(onSubmit).toHaveBeenCalledWith('newpass12');
    expect(await screen.findByText('Password updated')).toBeInTheDocument();
  });
});
