import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import LinkChannelsModal from './index'
import type { MatterChannel } from '../../bridge/types'

const meta: Meta<typeof LinkChannelsModal> = {
  title: 'Matter/LinkChannelsModal',
  component: LinkChannelsModal,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LinkChannelsModal>

const mockLinkedChannels: MatterChannel[] = [
  {
    id: 'ch1',
    matter_id: 'm1',
    channel_id: '111bcaea9ad145ca9b8fafdad50b2196',
    channel_type: 2,
    linked_by: '43e10cf1cd1e490584110a906ede665f',
    created_at: '2026-05-10T11:39:13.773Z',
  },
]

/**
 * 默认态 — 打开关联群聊弹窗
 */
export const Default: Story = {
  args: {
    visible: true,
    matterId: '8575cfce-e60a-4ee6-a3c5-7121cd46490d',
    matterTitle: 'Octo 产品策略 PPT 打磨',
    linkedChannels: [],
    onClose: () => {},
    onLinked: () => {},
  },
}

/**
 * 已有关联群 — 部分群标记为"已关联"不可重复选
 */
export const WithLinkedChannels: Story = {
  args: {
    visible: true,
    matterId: '8575cfce-e60a-4ee6-a3c5-7121cd46490d',
    matterTitle: 'Octo 产品策略 PPT 打磨',
    linkedChannels: mockLinkedChannels,
    onClose: () => {},
    onLinked: () => {},
  },
}

/**
 * 长标题 — 测试弹窗标题溢出
 */
export const LongMatterTitle: Story = {
  args: {
    visible: true,
    matterId: '8575cfce-e60a-4ee6-a3c5-7121cd46490d',
    matterTitle: '这是一个非常非常长的事项标题用来测试弹窗头部文本是否能正确截断和换行显示不会溢出容器边界',
    linkedChannels: [],
    onClose: () => {},
    onLinked: () => {},
  },
}

/**
 * 隐藏态 — visible=false
 */
export const Hidden: Story = {
  args: {
    visible: false,
    matterId: '8575cfce',
    linkedChannels: [],
    onClose: () => {},
    onLinked: () => {},
  },
}
