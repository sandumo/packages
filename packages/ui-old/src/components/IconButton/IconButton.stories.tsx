import IconButton from './IconButton';
import type { Meta, StoryObj } from '@storybook/react';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const meta: Meta<typeof IconButton> = {
  title: 'IconButton',
  component: IconButton,
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
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    size: 'medium',
    color: 'primary',
    children: <PersonRoundedIcon />,
  },
};

