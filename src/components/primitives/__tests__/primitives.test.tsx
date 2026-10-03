import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Badge,
  Button,
  Checkbox,
  FormField,
  Input,
  Radio,
  Select,
  Switch,
  Textarea,
} from '../index';

describe('Button', () => {
  it('defaults to type=button and primary variant', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn.className).toContain('ui-button--primary');
  });

  it('is disabled and aria-busy while loading, and does not fire onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Go
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('honors the variant prop', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button').className).toContain('ui-button--danger');
  });
});

describe('Input / Textarea / Select invalid state', () => {
  it('sets aria-invalid when invalid', () => {
    render(<Input invalid aria-label="email" />);
    expect(screen.getByLabelText('email')).toHaveAttribute('aria-invalid', 'true');
  });
  it('Textarea forwards value + onChange', async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="body" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('body'), 'hi');
    expect(onChange).toHaveBeenCalled();
  });
  it('Select renders options and selects', async () => {
    render(
      <Select aria-label="pick" defaultValue="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    expect((screen.getByLabelText('pick') as HTMLSelectElement).value).toBe('b');
  });
});

describe('Checkbox / Radio / Switch', () => {
  it('Checkbox toggles and shows its label', async () => {
    render(<Checkbox label="Agree" />);
    const box = screen.getByRole('checkbox', { name: 'Agree' });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
  });
  it('Radio participates in a named group', async () => {
    render(
      <>
        <Radio name="g" value="1" label="One" />
        <Radio name="g" value="2" label="Two" />
      </>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Two' }));
    expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'One' })).not.toBeChecked();
  });
  it('Switch exposes role=switch and toggles', async () => {
    render(<Switch label="Notifications" />);
    const sw = screen.getByRole('switch', { name: 'Notifications' });
    await userEvent.click(sw);
    expect(sw).toBeChecked();
  });
});

describe('FormField', () => {
  it('wires label, description, error, and aria to the control', () => {
    render(
      <FormField
        htmlFor="email"
        label="Email"
        required
        description="We never share it."
        error="Required"
      >
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    // label points at the control
    expect(screen.getByText('Email').closest('label')).toHaveAttribute('for', 'email');
    expect(input).toHaveAttribute('id', 'email');
    // error marks invalid + is referenced via aria-describedby + is an alert
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedby = input.getAttribute('aria-describedby') ?? '';
    expect(describedby).toContain('email-desc');
    expect(describedby).toContain('email-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('omits error wiring when there is no error', () => {
    render(
      <FormField htmlFor="name" label="Name">
        <Input />
      </FormField>,
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('applies the tone class', () => {
    render(<Badge tone="success">Published</Badge>);
    const badge = screen.getByText('Published');
    expect(badge.className).toContain('ui-badge--success');
  });
});
