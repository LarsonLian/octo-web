import React, { useEffect, useMemo, useState } from "react"
import {
    Archive,
    BarChart3,
    Bot,
    Briefcase,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    ClipboardList,
    Edit3,
    Expand,
    Link,
    Inbox,
    MoreHorizontal,
    Paperclip,
    Pin,
    Search,
    Settings,
    Sparkles,
    Trash2,
    UserPlus,
    Users,
} from "lucide-react"
import WKApp from "../../App"
import "./index.css"

type MatterView = "inbox" | "issues" | "squads" | "settings"

interface MatterThread {
    id: string
    title: string
    subtitle: string
    time: string
    status: "review" | "open" | "done"
    unread?: boolean
}

const INBOX_THREADS: MatterThread[] = [
    {
        id: "oct-2",
        title: "询问当前 agent 身份和模型",
        subtitle: "我是这个 Multica workspace ...",
        time: "1 小时",
        status: "open",
        unread: true,
    },
    {
        id: "oct-3",
        title: "回答运行环境询问：workspa...",
        subtitle: "状态设为 In Review",
        time: "4 小时",
        status: "review",
    },
]

const ISSUE_THREADS: MatterThread[] = [
    {
        id: "iss-18",
        title: "整理 runtime V2 设备详情交互",
        subtitle: "补充 Agent 绑定与费用栏位",
        time: "今天",
        status: "review",
        unread: true,
    },
    {
        id: "iss-12",
        title: "Bot 创建弹窗字段梳理",
        subtitle: "确认 visibility / runtime / skills",
        time: "昨天",
        status: "open",
    },
    {
        id: "iss-7",
        title: "MatterV2 三栏信息架构",
        subtitle: "收件箱与 Issues 使用同一详情 surface",
        time: "2 天前",
        status: "done",
    },
]

const SQUADS = [
    {
        id: "squad-1111",
        name: "1111",
        leader: "Prototyper",
        members: ["Prototyper", "CC-Protoper", "的方法"],
        creator: "lvsijia",
        created: "2 小时前",
        updated: "2 小时前",
        description: "添加描述",
    },
]

export default function MatterV2Prototype() {
    const [activeView, setActiveView] = useState<MatterView>("inbox")
    const [activeThreadId, setActiveThreadId] = useState(INBOX_THREADS[0].id)
    const [workspaceOpen, setWorkspaceOpen] = useState(false)
    const [workspaceName, setWorkspaceName] = useState("OctoLoop")
    const [workspaces, setWorkspaces] = useState(["工作空间 1", "工作空间 2", "工作空间 3"])
    const [creatingWorkspace, setCreatingWorkspace] = useState(false)
    const [newWorkspaceName, setNewWorkspaceName] = useState("")
    const [newWorkspaceMembers, setNewWorkspaceMembers] = useState("lvsijia, Prototyper")
    const [newWorkspaceTeam, setNewWorkspaceTeam] = useState("Product Prototype Team")
    const [createIssueOpen, setCreateIssueOpen] = useState(false)

    const threads = activeView === "inbox" ? INBOX_THREADS : ISSUE_THREADS
    const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0]

    function setView(nextView: MatterView) {
        setActiveView(nextView)
        if (nextView === "settings") return
        const first = nextView === "inbox" ? INBOX_THREADS[0] : ISSUE_THREADS[0]
        setActiveThreadId(first.id)
    }

    function showSurface(thread = activeThread, view = activeView) {
        if (view === "settings") {
            WKApp.routeRight.replaceToRoot(<MatterMembersSettings />)
            return
        }
        if (view === "issues") {
            WKApp.routeRight.replaceToRoot(<MatterIssuesBoard />)
            return
        }
        if (view === "squads") {
            WKApp.routeRight.replaceToRoot(<MatterSquadsList />)
            return
        }
        WKApp.routeRight.replaceToRoot(
            <MatterV2Surface
                view={view}
                threads={INBOX_THREADS}
                activeThreadId={thread.id}
                onSelectThread={setActiveThreadId}
            />
        )
    }

    useEffect(() => {
        showSurface()
    }, [activeView, activeThreadId])

    useEffect(() => {
        const handleActivated = (payload: { menuId?: string }) => {
            if (payload?.menuId === "matter-v2") showSurface()
        }
        WKApp.mittBus.on("wk:nav-menu-activated" as any, handleActivated as any)
        return () => WKApp.mittBus.off("wk:nav-menu-activated" as any, handleActivated as any)
    }, [activeView, activeThreadId])

    return (
        <aside className="wk-matter-v2-sidebar" aria-label="MatterV2 sidebar">
            <header className="wk-matter-v2-sidebar__workspace">
                <button
                    type="button"
                    className="wk-matter-v2-sidebar__workspace-btn"
                    aria-haspopup="menu"
                    aria-expanded={workspaceOpen}
                    onClick={() => setWorkspaceOpen((open) => !open)}
                >
                    <span className="wk-matter-v2-sidebar__mark">{workspaceName.charAt(0)}</span>
                    <strong>{workspaceName}</strong>
                    <ChevronDown size={15} />
                </button>
                {workspaceOpen && (
                    <div className="wk-matter-v2-sidebar__workspace-menu" role="menu">
                        {!creatingWorkspace ? (
                            <>
                                {workspaces.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            setWorkspaceName(name)
                                            setWorkspaceOpen(false)
                                        }}
                                    >
                                        <span className="wk-matter-v2-sidebar__mark">{name.slice(-1)}</span>
                                        <strong>{name}</strong>
                                    </button>
                                ))}
                                <div className="wk-matter-v2-sidebar__workspace-divider" />
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setCreatingWorkspace(true)
                                        setNewWorkspaceName("")
                                        setNewWorkspaceMembers("lvsijia, Prototyper")
                                        setNewWorkspaceTeam("Product Prototype Team")
                                    }}
                                >
                                    <span className="wk-matter-v2-sidebar__mark">＋</span>
                                    <strong>创建工作区</strong>
                                </button>
                            </>
                        ) : (
                            <form
                                className="wk-matter-v2-sidebar__workspace-create"
                                onSubmit={(event) => {
                                    event.preventDefault()
                                    const name = newWorkspaceName.trim() || `工作空间 ${workspaces.length + 1}`
                                    setWorkspaces((items) => [...items, name])
                                    setWorkspaceName(name)
                                    setCreatingWorkspace(false)
                                    setWorkspaceOpen(false)
                                }}
                            >
                                <label>
                                    <span>新工作区名称</span>
                                    <input
                                        autoFocus
                                        value={newWorkspaceName}
                                        onChange={(event) => setNewWorkspaceName(event.target.value)}
                                        placeholder={`工作空间 ${workspaces.length + 1}`}
                                    />
                                </label>
                                <div className="wk-matter-v2-sidebar__workspace-meta">
                                    <span>Meta 信息</span>
                                    <label>
                                        <small>初始 Members</small>
                                        <input
                                            value={newWorkspaceMembers}
                                            onChange={(event) => setNewWorkspaceMembers(event.target.value)}
                                            placeholder="lvsijia, Prototyper"
                                        />
                                    </label>
                                    <label>
                                        <small>初始团队</small>
                                        <input
                                            value={newWorkspaceTeam}
                                            onChange={(event) => setNewWorkspaceTeam(event.target.value)}
                                            placeholder="Product Prototype Team"
                                        />
                                    </label>
                                    <p>仅用于原型展示，不会发送邀请或创建真实团队。</p>
                                </div>
                                <div>
                                    <button type="button" onClick={() => setCreatingWorkspace(false)}>取消</button>
                                    <button type="submit">创建</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </header>

            <div className="wk-matter-v2-sidebar__quick">
                <button type="button"><Search size={16} />搜索...<kbd>⌘K</kbd></button>
                <button type="button" onClick={() => setCreateIssueOpen(true)}><Edit3 size={16} />新建 issue<kbd>C</kbd></button>
            </div>

            <nav className="wk-matter-v2-sidebar__nav">
                <button type="button" className={activeView === "inbox" ? "is-active" : ""} onClick={() => setView("inbox")}>
                    <Inbox size={16} />
                    收件箱
                </button>
                <button type="button">
                    <Circle size={16} />
                    我的 issue
                </button>
            </nav>

            <div className="wk-matter-v2-sidebar__group">
                <span>工作区</span>
                <button type="button" className={activeView === "issues" ? "is-active" : ""} onClick={() => setView("issues")}>
                    <ClipboardList size={16} />
                    Issues
                </button>
                <button type="button"><Briefcase size={16} />项目</button>
                <button type="button"><Sparkles size={16} />自动化</button>
                <button type="button" className={activeView === "squads" ? "is-active" : ""} onClick={() => setView("squads")}>
                    <Users size={16} />
                    小队
                </button>
                <button type="button"><BarChart3 size={16} />用量</button>
                <button type="button" className={activeView === "settings" ? "is-active" : ""} onClick={() => setView("settings")}>
                    <Settings size={16} />
                    设置
                </button>
            </div>

            {createIssueOpen && <MatterCreateIssueModal onClose={() => setCreateIssueOpen(false)} />}
        </aside>
    )
}

export { MatterV2Prototype }

const BOARD_COLUMNS = [
    { id: "backlog", label: "待规划", count: 0, tone: "neutral", cards: [] },
    {
        id: "todo",
        label: "待办",
        count: 1,
        tone: "neutral",
        cards: [
            {
                key: "OCT-1",
                title: "test",
                desc: "",
                project: "Octo-Runtime",
                agent: "未分配",
                updated: "",
            },
        ],
    },
    { id: "doing", label: "进行中", count: 0, tone: "warm", cards: [] },
    {
        id: "review",
        label: "审核中",
        count: 2,
        tone: "green",
        cards: [
            {
                key: "OCT-3",
                title: "回答运行环境询问：workspace 绝对路径、机器名称、执行状态",
                desc: "User request 请回答以下关于当前运行环...",
                project: "Octo-Runtime",
                agent: "CC-Protoper",
                updated: "更新于 4 小时前",
            },
            {
                key: "OCT-2",
                title: "询问当前 agent 身份和模型",
                desc: "User request 你是什么agents 什么模型",
                project: "Octo-Runtime",
                agent: "Prototyper",
                updated: "更新于 4 小时前",
            },
        ],
    },
    { id: "done", label: "已完成", count: 0, tone: "blue", cards: [] },
] as const

function MatterIssuesBoard() {
    const [createIssueOpen, setCreateIssueOpen] = useState(false)

    return (
        <section className="wk-matter-board" aria-label="MatterV2 Issues kanban">
            <header className="wk-matter-board__head">
                <div className="wk-matter-board__title">
                    <ClipboardList size={17} />
                    <strong>Issues</strong>
                </div>
            </header>

            <div className="wk-matter-board__toolbar">
                <div className="wk-matter-board__tabs">
                    <button type="button" className="is-active">全部</button>
                    <button type="button">成员</button>
                    <button type="button">智能体</button>
                </div>
                <div className="wk-matter-board__actions">
                    <button type="button">0 工作中</button>
                    <button type="button">筛选</button>
                    <button type="button">手动</button>
                    <button type="button">看板</button>
                </div>
            </div>

            <div className="wk-matter-board__columns">
                {BOARD_COLUMNS.map((column) => (
                    <section key={column.id} className={`wk-matter-board__column wk-matter-board__column--${column.tone}`}>
                        <header>
                            <span className="wk-matter-board__status-dot" />
                            <strong>{column.label}</strong>
                            <small>{column.count}</small>
                            <MoreHorizontal size={15} />
                            <button type="button" onClick={() => setCreateIssueOpen(true)}>+</button>
                        </header>

                        {column.cards.length === 0 ? (
                            <div className="wk-matter-board__empty">无 issue</div>
                        ) : (
                            <div className="wk-matter-board__cards">
                                {column.cards.map((card) => (
                                    <button
                                        key={card.key}
                                        type="button"
                                        className="wk-matter-board__card"
                                        onClick={() => WKApp.routeRight.replaceToRoot(<MatterIssueDetail issue={card} />)}
                                    >
                                        <div className="wk-matter-board__card-key">— {card.key}</div>
                                        <h3>{card.title}</h3>
                                        {card.desc && <p>{card.desc}</p>}
                                        <span className="wk-matter-board__project">📁 {card.project}</span>
                                        <footer>
                                            <span>{card.agent}</span>
                                            {card.updated && <time>{card.updated}</time>}
                                        </footer>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {createIssueOpen && <MatterCreateIssueModal onClose={() => setCreateIssueOpen(false)} />}
        </section>
    )
}

function MatterCreateIssueModal({ onClose }: { onClose: () => void }) {
    const [agentMode, setAgentMode] = useState(false)
    const [keepCreating, setKeepCreating] = useState(false)

    return (
        <div className="wk-matter-create-issue" role="presentation" onMouseDown={onClose}>
            <section
                className="wk-matter-create-issue__dialog"
                role="dialog"
                aria-modal="true"
                aria-label="新建 issue"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="wk-matter-create-issue__head">
                    <div className="wk-matter-create-issue__crumb">
                        <span>OctoLoop</span>
                        <ChevronRight size={13} />
                        <strong>手动创建</strong>
                    </div>
                    <div className="wk-matter-create-issue__tools">
                        <button type="button" aria-label="展开"><Expand size={16} /></button>
                        <button type="button" aria-label="关闭" onClick={onClose}>×</button>
                    </div>
                </header>

                <main className="wk-matter-create-issue__body">
                    <input className="wk-matter-create-issue__title" placeholder="issue 标题" autoFocus />
                    <textarea className="wk-matter-create-issue__desc" placeholder="添加描述..." />
                </main>

                <div className="wk-matter-create-issue__chips">
                    <button type="button"><Circle size={14} />待办</button>
                    <button type="button">— 无优先级</button>
                    <button type="button"><span>L</span>lvsijia</button>
                    <button type="button">截止日期</button>
                    <button type="button">📁 Octo-Runtime</button>
                    <button type="button"><MoreHorizontal size={15} /></button>
                </div>

                <footer className="wk-matter-create-issue__foot">
                    <button type="button" aria-label="添加附件"><Paperclip size={17} /></button>
                    <button type="button" aria-label="添加链接"><Link size={17} /></button>
                    <div className="wk-matter-create-issue__actions">
                        <button
                            type="button"
                            className={agentMode ? "is-active" : ""}
                            onClick={() => setAgentMode((value) => !value)}
                        >
                            ↔ 切换到智能体
                        </button>
                        <label>
                            <input
                                type="checkbox"
                                checked={keepCreating}
                                onChange={(event) => setKeepCreating(event.target.checked)}
                            />
                            <span>继续创建</span>
                        </label>
                        <button type="button" className="wk-matter-create-issue__submit" onClick={onClose}>创建 issue</button>
                    </div>
                </footer>
            </section>
        </div>
    )
}

function MatterSquadsList() {
    const [createOpen, setCreateOpen] = useState(false)

    return (
        <section className="wk-matter-squads" aria-label="MatterV2 squads list">
            <header className="wk-matter-squads__head">
                <div className="wk-matter-squads__title">
                    <Users size={17} />
                    <strong>小队</strong>
                    <span>{SQUADS.length}</span>
                </div>
                <button type="button" className="wk-matter-squads__create" onClick={() => setCreateOpen(true)}>
                    <UserPlus size={15} />
                    新建小队
                </button>
            </header>

            <div className="wk-matter-squads__toolbar">
                <div className="wk-matter-squads__tabs">
                    <button type="button" className="is-active">我的 <span>1</span></button>
                    <button type="button">全部 <span>1</span></button>
                </div>
                <div className="wk-matter-squads__actions">
                    <button type="button">筛选</button>
                    <button type="button">小队 ↑</button>
                </div>
            </div>

            <div className="wk-matter-squads__table" role="table" aria-label="小队列表">
                <div className="wk-matter-squads__row wk-matter-squads__head-row" role="row">
                    <div role="columnheader">小队 ↑</div>
                    <div role="columnheader">队长</div>
                    <div role="columnheader">成员</div>
                    <div role="columnheader">创建者</div>
                </div>
                {SQUADS.map((squad) => (
                    <button
                        key={squad.id}
                        type="button"
                        className="wk-matter-squads__row wk-matter-squads__item"
                        role="row"
                        onClick={() => WKApp.routeRight.replaceToRoot(<MatterSquadDetail squad={squad} />)}
                    >
                        <div className="wk-matter-squads__name" role="cell">
                            <span><Users size={16} /></span>
                            <strong>{squad.name}</strong>
                        </div>
                        <div className="wk-matter-squads__leader" role="cell"><Bot size={14} />{squad.leader}</div>
                        <div className="wk-matter-squads__members" role="cell">
                            {squad.members.map((member) => <i key={member}><Bot size={12} /></i>)}
                        </div>
                        <div className="wk-matter-squads__creator" role="cell"><i>L</i>{squad.creator}</div>
                    </button>
                ))}
            </div>

            {createOpen && <MatterCreateSquadModal onClose={() => setCreateOpen(false)} />}
        </section>
    )
}

function MatterCreateSquadModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="wk-matter-squad-modal" role="presentation" onMouseDown={onClose}>
            <section
                className="wk-matter-squad-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-label="创建 Squad"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="wk-matter-squad-modal__head">
                    <div>
                        <h2>创建 Squad</h2>
                        <p>创建一个由 Leader Agent 协调团队的协作 Squad，可选添加成员。</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="关闭">×</button>
                </header>

                <main className="wk-matter-squad-modal__body">
                    <button type="button" className="wk-matter-squad-modal__image" aria-label="上传小队头像">
                        <Users size={24} />
                    </button>
                    <div className="wk-matter-squad-modal__form">
                        <label>
                            <span>名称</span>
                            <input autoFocus placeholder="例如 前端团队" />
                        </label>
                        <label>
                            <span>描述</span>
                            <input placeholder="描述这个 Squad 负责什么..." />
                            <small>0 / 255</small>
                        </label>
                    </div>

                    <section className="wk-matter-squad-modal__leader">
                        <span>Leader Agent</span>
                        <p>Leader 接收分配给此 Squad 的所有任务并协调团队。</p>
                        <button type="button">
                            <UserPlus size={16} />
                            选择一个 Leader Agent
                            <ChevronDown size={15} />
                        </button>
                        <label>
                            <Search size={15} />
                            <input placeholder="搜索 Agent 或成员..." />
                        </label>
                        <div className="wk-matter-squad-modal__agents">
                            <strong>我的 AGENT</strong>
                            {["Prototyper", "CC-Protoper", "的方法"].map((agent) => (
                                <button key={agent} type="button">
                                    <Bot size={15} />
                                    {agent}
                                </button>
                            ))}
                        </div>
                    </section>
                </main>
            </section>
        </div>
    )
}

function MatterSquadDetail({
    squad,
}: {
    squad: typeof SQUADS[number]
}) {
    const [activeTab, setActiveTab] = useState<"members" | "instructions">("members")

    return (
        <section className="wk-matter-squad-detail" aria-label="小队详情">
            <header className="wk-matter-squad-detail__top">
                <div className="wk-matter-squad-detail__crumb">
                    <span>小队</span>
                    <ChevronRight size={13} />
                    <strong><Users size={15} />{squad.name}</strong>
                </div>
                <button type="button"><Trash2 size={15} />归档</button>
            </header>

            <div className="wk-matter-squad-detail__layout">
                <aside className="wk-matter-squad-detail__profile">
                    <div className="wk-matter-squad-detail__identity">
                        <span><Users size={30} /></span>
                        <h2>{squad.name}</h2>
                        <p>{squad.description}</p>
                    </div>
                    <dl>
                        <dt>详情</dt>
                        <div><span>Leader</span><strong><Bot size={13} />{squad.leader}</strong></div>
                        <div><span>Members</span><strong>{squad.members.length}</strong></div>
                        <div><span>Created by</span><strong><i>L</i>{squad.creator}</strong></div>
                        <div><span>Created</span><strong>{squad.created}</strong></div>
                        <div><span>Updated</span><strong>{squad.updated}</strong></div>
                    </dl>
                </aside>

                <main className="wk-matter-squad-detail__main">
                    <nav className="wk-matter-squad-detail__tabs">
                        <button type="button" className={activeTab === "members" ? "is-active" : ""} onClick={() => setActiveTab("members")}>
                            <Users size={15} />
                            Members
                        </button>
                        <button type="button" className={activeTab === "instructions" ? "is-active" : ""} onClick={() => setActiveTab("instructions")}>
                            <ClipboardList size={15} />
                            Instructions
                        </button>
                    </nav>

                    {activeTab === "members" ? (
                        <section className="wk-matter-squad-detail__members">
                            <header>
                                <div>
                                    <h3>成员</h3>
                                    <p>该小队有 {squad.members.length} 名成员</p>
                                </div>
                                <div>
                                    <button type="button"><PlusIcon />创建智能体</button>
                                    <button type="button"><PlusIcon />添加成员</button>
                                </div>
                            </header>
                            <div className="wk-matter-squad-detail__member-list">
                                {squad.members.map((member, index) => (
                                    <article key={member}>
                                        <span><Bot size={17} /><i /></span>
                                        <div>
                                            <strong>{member}</strong>
                                            <small>Agent {index === 0 ? " · 负责人 · 空闲" : " · 空闲"}</small>
                                            <p>{index === 0 ? "leader" : "添加角色..."}</p>
                                            <time>最近活动 1 分钟前</time>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <section className="wk-matter-squad-detail__instructions">
                            <p>小队指引会在 Leader 智能体处理分配给该小队的 issue 时注入到它的 prompt 中。可用来给 Leader 提供贯穿全队的指导、协作规范，或每次任务都应遵循的上下文。</p>
                            <textarea placeholder="e.g. Always start by writing a failing test. Prefer small, atomic commits." />
                        </section>
                    )}
                </main>
            </div>
        </section>
    )
}

function PlusIcon() {
    return <span aria-hidden="true">＋</span>
}

function MatterMembersSettings() {
    return (
        <section className="wk-matter-settings" aria-label="MatterV2 members settings">
            <aside className="wk-matter-settings__nav">
                <h2>设置</h2>
                <div className="wk-matter-settings__group">
                    <span>OctoLoop</span>
                    <button type="button" className="is-active">
                        <Users size={16} />
                        成员
                    </button>
                </div>
            </aside>

            <main className="wk-matter-settings__main">
                <header className="wk-matter-settings__title">
                    <Users size={17} />
                    <strong>成员（1）</strong>
                </header>

                <section className="wk-matter-settings__invite">
                    <div className="wk-matter-settings__invite-title">
                        <span>＋</span>
                        <strong>邀请成员</strong>
                    </div>
                    <div className="wk-matter-settings__invite-row">
                        <input placeholder="user@company.com" />
                        <button type="button" className="wk-matter-settings__role">成员⌄</button>
                        <button type="button" className="wk-matter-settings__invite-btn">邀请</button>
                    </div>
                </section>

                <section className="wk-matter-settings__member">
                    <span className="wk-matter-settings__avatar">L</span>
                    <div>
                        <strong>lvsijia</strong>
                        <small>lvsijia@mininglamp.com</small>
                    </div>
                    <span className="wk-matter-settings__owner">♛ 所有者</span>
                </section>
            </main>
        </section>
    )
}

function MatterIssueDetail({
    issue,
}: {
    issue: {
        key: string
        title: string
        desc: string
        project: string
        agent: string
        updated: string
    }
}) {
    const isRuntimeQuestion = issue.key === "OCT-3"

    return (
        <section className="wk-matter-issue-detail" aria-label="Issue detail prototype">
            <header className="wk-matter-issue-detail__top">
                <div className="wk-matter-issue-detail__crumb">
                    <span>📁 {issue.project}</span>
                    <ChevronRight size={14} />
                    <strong>{issue.key} {issue.title}</strong>
                </div>
                <div className="wk-matter-issue-detail__tools">
                    <Pin size={17} />
                    <MoreHorizontal size={17} />
                    <button type="button" onClick={() => WKApp.routeRight.replaceToRoot(<MatterIssuesBoard />)}>看板</button>
                </div>
            </header>

            <main className="wk-matter-issue-detail__main">
                <article className="wk-matter-issue-detail__content">
                    <section className="wk-matter-issue-detail__request">
                        <h1>User request</h1>
                        {isRuntimeQuestion ? (
                            <>
                                <p>请回答以下关于当前运行环境的问题：</p>
                                <ol>
                                    <li>你的工作 workspace 的绝对路径是什么？</li>
                                    <li>当前机器名称是什么？</li>
                                    <li>执行的状态如何？</li>
                                </ol>
                            </>
                        ) : (
                            <>
                                <p>{issue.desc || "请继续推进这个 issue，并补充下一步处理建议。"}</p>
                                <ol>
                                    <li>确认当前任务目标。</li>
                                    <li>补齐必要上下文。</li>
                                    <li>给出可执行的下一步。</li>
                                </ol>
                            </>
                        )}
                        <div className="wk-matter-issue-detail__inline-actions">☺︎　📎</div>
                        <button type="button" className="wk-matter-issue-detail__add">＋ 添加子 issue</button>
                    </section>

                    <section className="wk-matter-issue-detail__activity">
                        <header>
                            <h2>动态</h2>
                            <span>取消订阅　🤖 L</span>
                        </header>
                        <div className="wk-matter-issue-detail__fold">› 2 条动态</div>
                        <MessageCard
                            author={issue.agent === "未分配" ? "Prototyper" : issue.agent}
                            time={issue.updated || "4 小时前"}
                            body={[
                                "运行环境询问回答：",
                                "1. Workspace 绝对路径： /Users/lvsijia/multica_workspaces/bfa7830c-929d-493d-9650-4f31d86e54ff/550c0581/workdir",
                                "2. 机器名称： kaka-mbp（macOS / Darwin 25.5.0，arm64 架构，Apple Silicon）",
                                "3. 执行状态：正常。CLI 认证有效，可以正常读写 issue、评论及状态，环境健康无异常。",
                            ]}
                        />
                        <div className="wk-matter-issue-detail__events">
                            <div><CheckCircle2 size={15} />CC-Protoper 状态从 进行中 改为 审核中 <time>4 小时前</time></div>
                            <div><Archive size={15} />CC-Protoper 完成了 task（1 次）<time>4 小时前</time></div>
                        </div>
                        <div className="wk-matter-issue-detail__comment">
                            <span>留下评论...</span>
                            <span>📎</span>
                            <button type="button">↑</button>
                        </div>
                    </section>
                </article>

                <aside className="wk-matter-issue-detail__props">
                    <h3>属性⌄</h3>
                    <dl>
                        <dt>状态</dt>
                        <dd><CheckCircle2 size={15} />审核中</dd>
                        <dt>负责人</dt>
                        <dd>🤖 {issue.agent === "未分配" ? "CC-Protoper" : issue.agent}</dd>
                        <dt>项目</dt>
                        <dd>📁 {issue.project}</dd>
                    </dl>
                    <button type="button">＋ 添加字段</button>

                    <h3>Pull Request⌄</h3>
                    <p>还没有关联的 PR。在 PR 的分支名、标题或正文里引用本 issue 的 identifier 即可自动关联。</p>

                    <h3>详情⌄</h3>
                    <dl>
                        <dt>创建者</dt>
                        <dd>🤖 CC-Protoper</dd>
                        <dt>创建时间</dt>
                        <dd>Jul 2</dd>
                        <dt>更新时间</dt>
                        <dd>Jul 2</dd>
                    </dl>

                    <h3>执行日志⌄</h3>
                    <p>› 显示历史运行（2）</p>

                    <h3>Token 用量⌄</h3>
                    <dl>
                        <dt>输入</dt>
                        <dd>3.1k</dd>
                        <dt>输出</dt>
                        <dd>1.5k</dd>
                        <dt>缓存</dt>
                        <dd>343.9k 读 / 78.6k 写</dd>
                        <dt>运行次数</dt>
                        <dd>2</dd>
                    </dl>
                </aside>
            </main>
        </section>
    )
}

function MatterV2Surface({
    view,
    threads,
    activeThreadId,
    onSelectThread,
}: {
    view: MatterView
    threads: MatterThread[]
    activeThreadId: string
    onSelectThread: (threadId: string) => void
}) {
    const activeThread = useMemo(
        () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
        [threads, activeThreadId],
    )

    return (
        <section className="wk-matter-v2-shell" aria-label="MatterV2 prototype">
            <aside className="wk-matter-v2-picker" aria-label="二级选择器">
                <header className="wk-matter-v2-picker__head">
                    <strong>{view === "inbox" ? "收件箱" : "Issues"}</strong>
                    <MoreHorizontal size={16} />
                </header>
                <div className="wk-matter-v2-picker__list">
                    {threads.map((thread) => (
                        <button
                            key={thread.id}
                            type="button"
                            className={thread.id === activeThread.id ? "is-active" : ""}
                            onClick={() => onSelectThread(thread.id)}
                        >
                            <span className="wk-matter-v2-picker__bot"><Bot size={14} /></span>
                            <span className="wk-matter-v2-picker__copy">
                                <strong>{thread.title}</strong>
                                <small>
                                    {thread.subtitle}
                                    {thread.status === "review" && <em> In Review</em>}
                                </small>
                            </span>
                            <span className="wk-matter-v2-picker__time">{thread.time}</span>
                            {thread.unread && <span className="wk-matter-v2-picker__signal" />}
                        </button>
                    ))}
                </div>
            </aside>

            <MatterDetail thread={activeThread} view={view} />
        </section>
    )
}

function MatterDetail({ thread, view }: { thread: MatterThread; view: MatterView }) {
    const isInbox = view === "inbox"

    return (
        <article className="wk-matter-v2-detail" aria-label="MatterV2 detail">
            <header className="wk-matter-v2-detail__top">
                <div className="wk-matter-v2-detail__crumb">
                    <span>📁 Octo-Runtime</span>
                    <ChevronRight size={14} />
                    <strong>{isInbox ? "OCT-2 询问当前 agent 身份和模型" : thread.title}</strong>
                </div>
                <div className="wk-matter-v2-detail__tools">
                    <CheckCircle2 size={17} />
                    <Pin size={17} />
                    <MoreHorizontal size={17} />
                </div>
            </header>

            <main className="wk-matter-v2-detail__body">
                <div className="wk-matter-v2-detail__activity">⌄ 2 条动态</div>
                <MessageCard
                    author="Prototyper"
                    time="4 小时前"
                    body={[
                        "我是这个 Multica workspace 里的本地 coding agent。",
                        "Agent 身份： Prototyper",
                        "Agent ID： 22bbe9c3-d580-4405-9f2e-c0e3d36e5743",
                        "模型： Codex，基于 GPT-5",
                    ]}
                />
                <div className="wk-matter-v2-detail__activity">› 2 条动态</div>
                <MessageCard
                    author="lvsijia"
                    time="1 小时前"
                    body={["@CC-Protoper 继续干一下"]}
                    user
                    highlighted
                />
                <MessageCard
                    author="CC-Protoper"
                    time="1 小时前"
                    body={[
                        "我是这个 Multica workspace 里的本地 coding agent。",
                        "Agent 身份： CC-Protoper",
                        "Agent ID： be653103-b7cc-4d4f-931a-8530c287d65c",
                        "模型： Claude Code，基于 Anthropic Claude Opus 4.7",
                    ]}
                    shaded
                />
                <div className="wk-matter-v2-detail__activity">⌄ 1 条动态</div>
                <div className="wk-matter-v2-detail__event">
                    <Archive size={14} />
                    <span>CC-Protoper 完成了 task（1 次）</span>
                    <time>1 小时前</time>
                </div>
            </main>
        </article>
    )
}

function MessageCard({
    author,
    time,
    body,
    user,
    highlighted,
    shaded,
}: {
    author: string
    time: string
    body: string[]
    user?: boolean
    highlighted?: boolean
    shaded?: boolean
}) {
    return (
        <section className={`wk-matter-v2-card${highlighted ? " is-highlighted" : ""}${shaded ? " is-shaded" : ""}`}>
            <header>
                <ChevronDown size={14} />
                <span className={user ? "wk-matter-v2-card__user" : "wk-matter-v2-card__agent"}>
                    {user ? "L" : <Bot size={14} />}
                    {!user && <i />}
                </span>
                <strong>{author}</strong>
                <time>{time}</time>
                <MoreHorizontal size={16} />
            </header>
            <div className="wk-matter-v2-card__body">
                {body.map((line) => (
                    <p key={line}>{line}</p>
                ))}
            </div>
            <footer>
                <span className="wk-matter-v2-card__reply">L</span>
                <span>回复...</span>
                <span>📎</span>
                <span>↑</span>
            </footer>
        </section>
    )
}
