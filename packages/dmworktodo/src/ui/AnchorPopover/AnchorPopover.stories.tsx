import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import AnchorPopover from './index'

const meta: Meta<typeof AnchorPopover> = {
  title: 'Matter/AnchorPopover',
  component: AnchorPopover,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 40, minHeight: 400 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AnchorPopover>

/**
 * 默认态 — 展示原消息上下文弹窗
 */
export const Default: Story = {
  args: {
    channelId: '111bcaea9ad145ca9b8fafdad50b2196',
    channelType: 2,
    messageIds: ['2049456264156450816', '2049456375074820096'],
    channelName: '产品负责人群',
    x: 200,
    y: 100,
    onClose: () => {},
  },
}

/**
 * 子区消息 — channelType=5
 */
export const ThreadChannel: Story = {
  args: {
    channelId: '111bcaea9ad145ca9b8fafdad50b2196____abc123',
    channelType: 5,
    messageIds: ['2049456264156450816'],
    channelName: '产品讨论子区',
    x: 200,
    y: 100,
    onClose: () => {},
  },
}

/**
 * 多条消息
 */
export const MultipleMessages: Story = {
  args: {
    channelId: '111bcaea9ad145ca9b8fafdad50b2196',
    channelType: 2,
    messageIds: [
      '2049456264156450816',
      '2049456375074820096',
      '2049469868163371008',
      '2049470882379632640',
    ],
    channelName: '产品负责人群',
    x: 300,
    y: 150,
    onClose: () => {},
  },
}

/**
 * 无锚定坐标 — 居中显示
 */
export const Centered: Story = {
  args: {
    channelId: '111bcaea9ad145ca9b8fafdad50b2196',
    channelType: 2,
    messageIds: ['2049456264156450816'],
    channelName: '产品负责人群',
    onClose: () => {},
  },
}
