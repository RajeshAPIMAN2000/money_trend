import { goalIconSrc } from './brandAssets.js'

const unwrap = (payload) => payload?.data ?? payload ?? {}

export const GOAL_TYPE_META = {
  DREAM_HOUSE: {
    code: 'DREAM_HOUSE',
    label: 'Dream House',
    iconKey: 'Dream House',
  },
  RETIREMENT: {
    code: 'RETIREMENT',
    label: 'Retirement Plan',
    iconKey: 'Retirement Plan',
  },
  CHILD_EDUCATION: {
    code: 'CHILD_EDUCATION',
    label: 'Child Education',
    iconKey: 'Child Education',
  },
  EMERGENCY_FUND: {
    code: 'EMERGENCY_FUND',
    label: 'Emergency Fund',
    iconKey: 'Emergency Fund',
  },
}

export const DEFAULT_GOAL_TYPES = Object.values(GOAL_TYPE_META)

export function formatGoalInr(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 100000) {
    return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
  }
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function formatGoalDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Human-readable time left until target date (days / months / years). */
export function formatRemainingDuration(targetDate) {
  if (!targetDate) {
    return { label: '—', days: null, overdue: false }
  }
  const end = new Date(targetDate)
  if (Number.isNaN(end.getTime())) {
    return { label: '—', days: null, overdue: false }
  }
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diffMs = end.getTime() - start.getTime()
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (days < 0) {
    const overdueDays = Math.abs(days)
    if (overdueDays >= 365) {
      const y = Math.floor(overdueDays / 365)
      return { label: `${y} yr${y === 1 ? '' : 's'} overdue`, days, overdue: true }
    }
    if (overdueDays >= 30) {
      const m = Math.floor(overdueDays / 30)
      return { label: `${m} mo${m === 1 ? '' : 's'} overdue`, days, overdue: true }
    }
    return { label: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`, days, overdue: true }
  }
  if (days === 0) return { label: 'Due today', days: 0, overdue: false }

  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  const remDays = days % 30

  if (years > 0) {
    if (months > 0) return { label: `${years} yr ${months} mo left`, days, overdue: false }
    return { label: `${years} year${years === 1 ? '' : 's'} left`, days, overdue: false }
  }
  if (months > 0) {
    if (remDays > 0 && months < 3) {
      return { label: `${months} mo ${remDays} day${remDays === 1 ? '' : 's'} left`, days, overdue: false }
    }
    return { label: `${months} month${months === 1 ? '' : 's'} left`, days, overdue: false }
  }
  return { label: `${days} day${days === 1 ? '' : 's'} left`, days, overdue: false }
}

export function goalTypeLabel(type) {
  const key = String(type || '').toUpperCase()
  return GOAL_TYPE_META[key]?.label || String(type || 'Goal').replace(/_/g, ' ')
}

export function resolveGoalIcon(goalType, title) {
  const meta = GOAL_TYPE_META[String(goalType || '').toUpperCase()]
  return goalIconSrc(meta?.iconKey || title || goalType) || null
}

function mapMilestone(m, i = 0) {
  const pct = Number(m.percent ?? m.pct ?? m.threshold_pct ?? m.stage_percent ?? 0)
  const stage = Number(m.stage ?? m.stage_number ?? i + 1)
  const done = Boolean(
    m.done
    ?? m.achieved
    ?? m.completed
    ?? m.is_achieved
    ?? (m.status && String(m.status).toLowerCase() === 'achieved'),
  )
  return {
    stage,
    percent: pct,
    label: m.label ?? m.name ?? m.title ?? `Stage ${stage}`,
    done,
    achievedAt: m.achieved_at ?? m.completed_at ?? null,
  }
}

export function mapGoal(item) {
  if (!item || typeof item !== 'object') return null

  const goalType = String(item.goal_type ?? item.type ?? item.goalType ?? '').toUpperCase()
  const title = item.title ?? item.name ?? item.goal_name ?? goalTypeLabel(goalType)
  const target = Number(item.target_amount ?? item.target ?? item.goal_amount ?? 0)
  const saved = Number(
    item.current_amount
    ?? item.saved_amount
    ?? item.saved
    ?? item.progress_amount
    ?? item.contributed_amount
    ?? 0,
  )
  const achievement = item.achievement ?? item.progress ?? {}
  const pctRaw = achievement.progress_pct
    ?? achievement.percent
    ?? item.progress_pct
    ?? item.progress
    ?? item.pct
    ?? (target > 0 ? (saved / target) * 100 : 0)
  const pct = Math.min(100, Math.max(0, Math.round(Number(pctRaw) || 0)))

  const milestonesRaw = achievement.milestones
    ?? item.milestones
    ?? []
  const milestones = Array.isArray(milestonesRaw)
    ? milestonesRaw.map(mapMilestone)
    : []

  const currentStage = achievement.current_stage
    ?? achievement.stage
    ?? item.current_stage
    ?? milestones.filter((m) => m.done).length
    ?? 1

  const nextMilestone = achievement.next_milestone
    ?? item.next_milestone
    ?? milestones.find((m) => !m.done)
    ?? null

  const market = item.market ?? {}
  const projection = item.projection ?? item.projections ?? {}

  const user = item.user ?? item.owner ?? null

  const targetDate = item.target_date ?? item.date ?? item.deadline ?? null
  const remainingTime = formatRemainingDuration(targetDate)

  return {
    id: item.id,
    goalType,
    goalTypeLabel: goalTypeLabel(goalType),
    title,
    name: title,
    notes: item.notes ?? '',
    target,
    targetDisplay: item.target_display ?? formatGoalInr(target),
    saved,
    savedDisplay: item.saved_display ?? item.current_display ?? formatGoalInr(saved),
    remaining: Math.max(0, target - saved),
    remainingDisplay: formatGoalInr(Math.max(0, target - saved)),
    pct,
    targetDate,
    targetDateLabel: formatGoalDate(targetDate),
    remainingTimeLabel: remainingTime.label,
    remainingDays: remainingTime.days,
    remainingOverdue: remainingTime.overdue,
    status: String(item.status ?? 'active').toLowerCase(),
    iconSrc: item.icon_url ?? resolveGoalIcon(goalType, title),
    icon: item.icon ?? '🎯',
    color: item.color ?? 'bg-blue-100 text-blue-700',
    achievement: {
      currentStage: Number(currentStage) || 1,
      progressPct: pct,
      nextMilestone: nextMilestone
        ? (typeof nextMilestone === 'object' ? mapMilestone(nextMilestone) : { label: String(nextMilestone) })
        : null,
      milestones,
    },
    milestones,
    market: {
      fdRate: market.fd_rate ?? market.today_fd_rate ?? market.interest_rate ?? null,
      label: market.label ?? market.message ?? null,
    },
    projection: {
      monthlyNeeded: projection.monthly_needed ?? projection.required_sip ?? projection.sip ?? null,
      estimatedMaturity: projection.estimated_maturity ?? projection.maturity_amount ?? null,
      message: projection.message ?? null,
    },
    sip: projection.monthly_needed ?? projection.required_sip ?? item.sip ?? item.monthly_sip ?? null,
    userId: item.user_id ?? user?.id ?? null,
    userName: user?.full_name ?? user?.name ?? item.user_name ?? item.full_name ?? null,
    userEmail: user?.email ?? item.user_email ?? item.email ?? null,
    userPhone: user?.phone ?? item.user_phone ?? item.phone ?? null,
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
    raw: item,
  }
}

export function parseGoalTypes(payload) {
  const root = unwrap(payload)
  const list = Array.isArray(root)
    ? root
    : (root.types ?? root.goal_types ?? root.items ?? [])

  if (!list.length) return DEFAULT_GOAL_TYPES.map((t) => ({ ...t, iconSrc: resolveGoalIcon(t.code) }))

  return list.map((t) => {
    if (typeof t === 'string') {
      const code = t.toUpperCase()
      const meta = GOAL_TYPE_META[code] || { code, label: goalTypeLabel(code), iconKey: code }
      return { ...meta, iconSrc: resolveGoalIcon(code) }
    }
    const code = String(t.code ?? t.id ?? t.goal_type ?? t.type ?? '').toUpperCase()
    const meta = GOAL_TYPE_META[code] || {
      code,
      label: t.label ?? t.name ?? goalTypeLabel(code),
      iconKey: t.label ?? code,
    }
    return {
      ...meta,
      label: t.label ?? t.name ?? meta.label,
      description: t.description ?? t.desc ?? '',
      iconSrc: resolveGoalIcon(code, t.label),
    }
  })
}

export function parseGoalsList(payload) {
  const root = unwrap(payload)
  const list = Array.isArray(root)
    ? root
    : (root.goals ?? root.items ?? root.user_goals ?? (Array.isArray(root.data) ? root.data : []))

  const items = (list || []).map(mapGoal).filter(Boolean)
  const summary = root.goals_summary ?? root.summary ?? {}

  return {
    items,
    count: root.count ?? root.total ?? items.length,
    summary: {
      total: Number(summary.total ?? summary.total_goals ?? items.length),
      active: Number(summary.active ?? summary.active_goals ?? items.filter((g) => g.status === 'active').length),
      achieved: Number(summary.achieved ?? summary.completed ?? items.filter((g) => g.pct >= 100).length),
      totalTarget: Number(summary.total_target ?? summary.target_amount ?? 0),
      totalSaved: Number(summary.total_saved ?? summary.saved_amount ?? 0),
    },
  }
}

export function parseGoalDetail(payload) {
  const root = unwrap(payload)
  const item = root.goal ?? root.item ?? root
  return mapGoal(item)
}

/** Map for Home "My Goals" cards */
export function mapGoalForHome(goal) {
  const g = goal?.raw ? goal : mapGoal(goal)
  if (!g) return null
  return {
    id: g.id,
    name: g.title,
    target: g.targetDisplay,
    pct: g.pct,
    icon: g.icon,
    iconSrc: g.iconSrc,
    color: g.color,
    goalType: g.goalType,
  }
}
