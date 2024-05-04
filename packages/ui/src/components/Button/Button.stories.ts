import Button from './Button';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['contained', 'outlined', 'text', 'tonal'],
      control: {
        type: 'select',
      },
    },
    color: {
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      control: {
        type: 'select',
      },
    },
    size: {
      options: ['small', 'medium', 'large'],
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
  },
};

