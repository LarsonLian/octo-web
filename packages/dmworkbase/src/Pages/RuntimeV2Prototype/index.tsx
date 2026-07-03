import React, { useEffect, useMemo, useState } from "react"
import {
    Activity,
    Bot,
    Cpu,
    Monitor,
    Plus,
    Search,
    Server,
    Square,
    Wifi,
} from "lucide-react"
import WKApp from "../../App"
import "./index.css"

type RuntimeStatus = "online" | "warning"

interface RuntimeRow {
    id: string
    name: string
    builtin: boolean
    status: RuntimeStatus
    agents: string[]
    cost: string
    cli: string
    icon: string
}

interface Machine {
    id: string
    name: string
    status: RuntimeStatus
    runtimes: RuntimeRow[]
    version: string
    daemon: string
    scope: string
}

const MACHINES: Machine[] = [
    {
        id: "kaka-mbp",
        name: "kaka-mbp",
        status: "online",
        version: "0.3.12",
        daemon: "019f1b79...",
        scope: "全部空间",
        runtimes: [
            { id: "claude", name: "Claude", builtin: true, status: "online", agents: ["机器人", "机器人"], cost: "$0.00", cli: "2.1.145 (Claude Code)", icon: "✳" },
            { id: "codex", name: "Codex", builtin: true, status: "online", agents: ["机器人"], cost: "$0.00", cli: "codex-cli 0....", icon: "◎" },
            { id: "hermes", name: "Hermes", builtin: true, status: "online", agents: [], cost: "—", cli: "Hermes Agent...", icon: "◉" },
            { id: "openclaw", name: "Openclaw", builtin: true, status: "online", agents: [], cost: "—", cli: "OpenClaw 202...", icon: "🦀" },
            { id: "opencode", name: "Opencode", builtin: true, status: "online", agents: [], cost: "—", cli: "1.2.26", icon: "■" },
        ],
    },
    {
        id: "build-mini",
        name: "build-mini",
        status: "online",
        version: "0.3.10",
        daemon: "019f2a41...",
        scope: "研发空间",
        runtimes: [
            { id: "claude-build", name: "Claude", builtin: true, status: "online", agents: ["机器人"], cost: "$0.00", cli: "2.1.140 (Claude Code)", icon: "✳" },
            { id: "codex-build", name: "Codex", builtin: true, status: "online", agents: ["机器人", "机器人"], cost: "$0.00", cli: "codex-cli 0....", icon: "◎" },
        ],
    },
]

const FILTERS = [
    { id: "all", label: "全部" },
    { id: "online", label: "在线" },
    { id: "warning", label: "异常" },
] as const

type FilterId = typeof FILTERS[number]["id"]

export default function RuntimeV2Prototype() {
    const [activeMachineId, setActiveMachineId] = useState(MACHINES[0].id)
    const [filter, setFilter] = useState<FilterId>("all")
    const [query, setQuery] = useState("")
    const [selectedRuntimeId, setSelectedRuntimeId] = useState(MACHINES[0].runtimes[0].id)
    const [showCreatePanel, setShowCreatePanel] = useState(false)

    const activeMachine = MACHINES.find((machine) => machine.id === activeMachineId) ?? MACHINES[0]
    const allRuntimes = MACHINES.flatMap((machine) => machine.runtimes)

    const filteredMachines = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        return MACHINES.filter((machine) => {
            const matchesQuery = !normalizedQuery || machine.name.toLowerCase().includes(normalizedQuery)
            const matchesFilter = filter === "all" || machine.status === filter
            return matchesQuery && matchesFilter
        })
    }, [filter, query])

    const selectedRuntime = activeMachine.runtimes.find((runtime) => runtime.id === selectedRuntimeId)
        ?? activeMachine.runtimes[0]

    function showDetail(machine = activeMachine, runtime = selectedRuntime) {
        WKApp.routeRight.replaceToRoot(
            <RuntimeV2Detail
                machine={machine}
                selectedRuntimeId={runtime?.id ?? machine.runtimes[0]?.id ?? ""}
                onSelectRuntime={(runtimeId) => setSelectedRuntimeId(runtimeId)}
                onOpenCreate={() => setShowCreatePanel(true)}
            />
        )
    }

    useEffect(() => {
        showDetail()
    }, [activeMachineId, selectedRuntimeId])

    useEffect(() => {
        const handleActivated = (payload: { menuId?: string }) => {
            if (payload?.menuId === "runtimes-v2") {
                showDetail()
            }
        }
        WKApp.mittBus.on("wk:nav-menu-activated" as any, handleActivated as any)
        return () => {
            WKApp.mittBus.off("wk:nav-menu-activated" as any, handleActivated as any)
        }
    }, [activeMachineId, selectedRuntimeId])

    function selectMachine(machine: Machine) {
        setActiveMachineId(machine.id)
        const firstRuntimeId = machine.runtimes[0]?.id ?? ""
        setSelectedRuntimeId(firstRuntimeId)
        WKApp.routeRight.replaceToRoot(
            <RuntimeV2Detail
                machine={machine}
                selectedRuntimeId={firstRuntimeId}
                onSelectRuntime={(runtimeId) => setSelectedRuntimeId(runtimeId)}
                onOpenCreate={() => setShowCreatePanel(true)}
            />
        )
    }

    return (
        <div className="wk-runtime-v2">
            <header className="wk-runtime-v2__left-head">
                <div className="wk-runtime-v2__title">
                    <Server size={18} />
                    <span>运行时</span>
                    <span className="wk-runtime-v2__count">{allRuntimes.length}</span>
                </div>
                <button className="wk-runtime-v2__add-btn" type="button" onClick={() => setShowCreatePanel(true)}>
                    <Plus size={15} />
                    添加运行时
                </button>
            </header>

            <div className="wk-runtime-v2__left-body">
                <label className="wk-runtime-v2__search">
                    <Search size={15} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="搜索机器..."
                    />
                </label>
                <div className="wk-runtime-v2__filters">
                    {FILTERS.map((item) => {
                        const count = item.id === "all"
                            ? MACHINES.length
                            : MACHINES.filter((machine) => machine.status === item.id).length
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={`wk-runtime-v2__filter${filter === item.id ? " is-active" : ""}`}
                                onClick={() => setFilter(item.id)}
                            >
                                <span className={`wk-runtime-v2__dot wk-runtime-v2__dot--${item.id}`} />
                                {item.label} {count}
                            </button>
                        )
                    })}
                </div>

                <div className="wk-runtime-v2__section-label">远程</div>
                <div className="wk-runtime-v2__machine-list">
                    {filteredMachines.map((machine) => (
                        <button
                            key={machine.id}
                            type="button"
                            className={`wk-runtime-v2__machine${machine.id === activeMachine.id ? " is-active" : ""}`}
                            onClick={() => selectMachine(machine)}
                        >
                            <span className="wk-runtime-v2__machine-icon">
                                <Monitor size={18} />
                            </span>
                            <span className="wk-runtime-v2__machine-main">
                                <strong>{machine.name}</strong>
                                <span>
                                    <span className="wk-runtime-v2__dot wk-runtime-v2__dot--online" />
                                    {machine.runtimes.slice(0, 4).map((runtime) => runtime.icon).join(" ")}
                                    {machine.runtimes.length > 4 ? " +1" : ""}
                                </span>
                            </span>
                            <span className="wk-runtime-v2__machine-meta">{machine.runtimes.length} 个运行时</span>
                        </button>
                    ))}
                </div>
            </div>

            {showCreatePanel && (
                <div className="wk-runtime-v2__overlay" role="presentation" onClick={() => setShowCreatePanel(false)}>
                    <aside
                        className="wk-runtime-v2__create-panel"
                        aria-label="添加运行时原型面板"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="wk-runtime-v2__create-head">
                            <h2>添加运行时</h2>
                            <button type="button" onClick={() => setShowCreatePanel(false)}>关闭</button>
                        </div>
                        <div className="wk-runtime-v2__prototype-note">
                            原型占位：这里不会提交真实数据，后续可接安装命令、授权和 daemon 注册流程。
                        </div>
                        <div className="wk-runtime-v2__create-options">
                            {[
                                { icon: <Cpu size={18} />, title: "内置运行时", desc: "Claude / Codex / Hermes 等本机能力" },
                                { icon: <Activity size={18} />, title: "远程运行时", desc: "连接另一台机器上的 daemon" },
                                { icon: <Square size={18} />, title: "自定义 Runtime", desc: "预留给第三方运行时插件" },
                            ].map((option) => (
                                <button key={option.title} type="button" className="wk-runtime-v2__create-option">
                                    <span>{option.icon}</span>
                                    <span>
                                        <strong>{option.title}</strong>
                                        <small>{option.desc}</small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}

export { RuntimeV2Prototype }

function RuntimeV2Detail({
    machine,
    selectedRuntimeId,
    onSelectRuntime,
    onOpenCreate,
}: {
    machine: Machine
    selectedRuntimeId: string
    onSelectRuntime: (runtimeId: string) => void
    onOpenCreate: () => void
}) {
    const selectedRuntime = machine.runtimes.find((runtime) => runtime.id === selectedRuntimeId)
        ?? machine.runtimes[0]

    return (
        <section className="wk-runtime-v2-detail" aria-label="运行时详情">
            <div className="wk-runtime-v2__device-head">
                <div>
                    <div className="wk-runtime-v2__device-title">
                        <h1>{machine.name}</h1>
                        <span className="wk-runtime-v2__status-pill">
                            <Wifi size={12} />
                            在线
                        </span>
                    </div>
                    <div className="wk-runtime-v2__device-meta">
                        <strong>{machine.runtimes.length} 个运行时</strong>
                        <span>{machine.runtimes.length} 个在线</span>
                        <span>{machine.scope}</span>
                        <span>{machine.version}</span>
                        <span>daemon {machine.daemon}</span>
                    </div>
                </div>
            </div>

            <div className="wk-runtime-v2__table" role="table" aria-label="运行时清单">
                <div className="wk-runtime-v2__table-row wk-runtime-v2__table-head" role="row">
                    <div role="columnheader">运行时</div>
                    <div role="columnheader">健康度</div>
                    <div role="columnheader">智能体</div>
                    <div role="columnheader">费用 · 7 天</div>
                    <div role="columnheader">CLI</div>
                </div>

                {machine.runtimes.map((runtime) => (
                    <button
                        key={runtime.id}
                        type="button"
                        className={`wk-runtime-v2__table-row wk-runtime-v2__runtime-row${selectedRuntime?.id === runtime.id ? " is-selected" : ""}`}
                        role="row"
                        onClick={() => onSelectRuntime(runtime.id)}
                    >
                        <div className="wk-runtime-v2__runtime-name" role="cell">
                            <span className="wk-runtime-v2__runtime-icon" aria-hidden>{runtime.icon}</span>
                            <strong>{runtime.name}</strong>
                            {runtime.builtin && <span className="wk-runtime-v2__tag">内置</span>}
                        </div>
                        <div className="wk-runtime-v2__health" role="cell">
                            <Wifi size={12} />
                            在线
                        </div>
                        <div className="wk-runtime-v2__agents" role="cell">
                            {runtime.agents.length > 0
                                ? runtime.agents.map((agent, index) => (
                                    <span key={`${runtime.id}-${index}`} title={agent}>
                                        <Bot size={13} />
                                    </span>
                                ))
                                : <span className="wk-runtime-v2__muted">—</span>}
                        </div>
                        <div className="wk-runtime-v2__cost" role="cell">{runtime.cost}</div>
                        <div className="wk-runtime-v2__cli" role="cell">{runtime.cli}</div>
                    </button>
                ))}
            </div>

            <div className="wk-runtime-v2__detail-strip">
                <div>
                    <span className="wk-runtime-v2__detail-label">当前选中</span>
                    <strong>{selectedRuntime?.name}</strong>
                </div>
                <div>
                    <span className="wk-runtime-v2__detail-label">运行模式</span>
                    <strong>内置 Runtime</strong>
                </div>
                <div>
                    <span className="wk-runtime-v2__detail-label">最近心跳</span>
                    <strong>刚刚</strong>
                </div>
                <div>
                    <span className="wk-runtime-v2__detail-label">本地动作</span>
                    <button type="button" onClick={onOpenCreate}>配置</button>
                </div>
            </div>
        </section>
    )
}
