import Avatar from './Avatar';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Avatar> = {
  title: 'Avatar',
  component: Avatar,
  argTypes: {
    variant: {
      options: ['circle', 'square', 'rounded'],
      control: {
        type: 'radio',
      },
    },
    size: {
      options: ['small', 'medium', 'large', 'extraLarge'],
      control: {
        type: 'radio',
      },
    },
    name: {
      control: {
        type: 'text',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    size: 'extraLarge',
    variant: 'circle',
    src: '/images/avatar-2.jpg',
    name: 'John Doe',
  },
};
