import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import OwnerEditor from './index'
import type { OwnerEditorProps } from './index'
import type { MatterAssignee } from '../../bridge/types'

const meta: Meta<typeof OwnerEditor> = {
  title: 'Matter/OwnerEditor',
  component: OwnerEditor,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 40 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof OwnerEditor>

const mockAssignees: MatterAssignee[] = [
  { id: 'a1', matter_id: 'm1', user_id: '43e10cf1cd1e490584110a906ede665f', created_at: '' },
  { id: 'a2', matter_id: 'm1', user_id: 'd3888a398148451aabc0962f1c5ab7c7', created_at: '' },
]

const mockChannels = [
  { channelId: '111bcaea9ad145ca9b8fafdad50b2196', channelType: 2 },
]

/**
 * 可编辑态 — 发起人视角
 */
export const EditableAsCreator: Story = {
  args: {
    assignees: mockAssignees,
    canEdit: true,
    currentUid: '43e10cf1cd1e490584110a906ede665f',
    isCreator: true,
    candidateChannels: mockChannels,
    onToggle: async (uid, isAssigned) => {
      console.log(`Toggle ${uid}, currently assigned: ${isAssigned}`)
    },
  },
}

/**
 * 可编辑态 — 负责人视角（非 creator）
 */
export const EditableAsAssignee: Story = {
  args: {
    assignees: mockAssignees,
    canEdit: true,
    currentUid: 'd3888a398148451aabc0962f1c5ab7c7',
    isCreator: false,
    candidateChannels: mockChannels,
    onToggle: async (uid, isAssigned) => {
      console.log(`Toggle ${uid}, currently assigned: ${isAssigned}`)
    },
  },
}

/**
 * 只读态 — 无编辑权限
 */
export const ReadOnly: Story = {
  args: {
    assignees: mockAssignees,
    canEdit: false,
    currentUid: 'some-other-uid',
    isCreator: false,
    candidateChannels: mockChannels,
    onToggle: async () => {},
  },
}

/**
 * 单人负责 — 不可移除最后一位
 */
export const SingleAssignee: Story = {
  args: {
    assignees: [mockAssignees[0]],
    canEdit: true,
    currentUid: '43e10cf1cd1e490584110a906ede665f',
    isCreator: true,
    candidateChannels: mockChannels,
    onToggle: async (uid, isAssigned) => {
      console.log(`Toggle ${uid}, currently assigned: ${isAssigned}`)
    },
  },
}

/**
 * 无候选 channel — 下拉只显示当前负责人
 */
export const NoCandidateChannels: Story = {
  args: {
    assignees: mockAssignees,
    canEdit: true,
    currentUid: '43e10cf1cd1e490584110a906ede665f',
    isCreator: true,
    candidateChannels: [],
    onToggle: async () => {},
  },
}
