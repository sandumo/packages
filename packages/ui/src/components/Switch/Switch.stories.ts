import Switch from './Switch';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Switch> = {
  title: 'Switch',
  component: Switch,
  argTypes: {
    size: {
      control: {
        type: 'radio',
        options: ['small', 'medium', 'large'],
      },
    },
    color: {
      control: {
        type: 'radio',
        options: ['primary', 'secondary'],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    size: 'medium',
    color: 'success',
  },
};

