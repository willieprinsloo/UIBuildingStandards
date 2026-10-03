import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginScreen } from '../index';

describe('LoginScreen', () => {
  it('renders the brand slot and the form slot', () => {
    render(
      <LoginScreen brand={<h1>Acme</h1>}>
        <form aria-label="sign-in-form">
          <button type="submit">Continue</button>
        </form>
      </LoginScreen>,
    );
    expect(screen.getByRole('heading', { name: 'Acme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('exposes labelled brand + sign-in regions', () => {
    render(
      <LoginScreen brand={<span>brand</span>}>
        <span>form</span>
      </LoginScreen>,
    );
    expect(screen.getByRole('region', { name: 'About this product' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders the optional aside slot when provided', () => {
    render(
      <LoginScreen brand={<span>brand</span>} aside={<button type="button">Theme</button>}>
        <span>form</span>
      </LoginScreen>,
    );
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
  });
});
