import Autocomplete from './Autocomplete';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Autocomplete> = {
  title: 'Autocomplete',
  component: Autocomplete,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    options: [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
      { label: 'Three', value: 3 },
    ],
    getOptionLabel: (option: any) => option.label,
  },
};

