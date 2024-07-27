import Typography from './Typography';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Typography> = {
  title: 'Typography',
  component: Typography,
  argTypes: {
    variant: {
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'button',
        'caption',
        'overline',
      ],
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    children: 'Sample Text',
  },
};

export const Heading1: Story = {
  args: {
    children: 'Heading 1',
    variant: 'h1',
  },
};

export const Heading2: Story = {
  args: {
    children: 'Heading 2',
    variant: 'h2',
  },
};

export const Heading3: Story = {
  args: {
    children: 'Heading 3',
    variant: 'h3',
  },
};

export const Heading4: Story = {
  args: {
    children: 'Heading 4',
    variant: 'h4',
  },
};

export const Heading5: Story = {
  args: {
    children: 'Heading 5',
    variant: 'h5',
  },
};

export const Heading6: Story = {
  args: {
    children: 'Heading 6',
    variant: 'h6',
  },
};

export const Subtitle1: Story = {
  args: {
    children: 'Subtitle 1',
    variant: 'subtitle1',
  },
};

export const Subtitle2: Story = {
  args: {
    children: 'Subtitle 2',
    variant: 'subtitle2',
  },
};

export const Body1: Story = {
  args: {
    children: 'Body 1',
    variant: 'body1',
  },
};

export const Body2: Story = {
  args: {
    children: 'Body 2',
    variant: 'body2',
  },
};

export const Button: Story = {
  args: {
    children: 'Button',
    variant: 'button',
  },
};

export const Caption: Story = {
  args: {
    children: 'Caption',
    variant: 'caption',
  },
};

export const Overline: Story = {
  args: {
    children: 'Overline',
    variant: 'overline',
  },
};
