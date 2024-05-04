import Select from './Select';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Select> = {
  title: 'Select',
  component: Select,
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'] as string[],
    getOptionLabel: (option) => option as string,
    placeholder: 'Select an option',
  },
};
