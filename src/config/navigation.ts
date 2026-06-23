import type { LucideIcon } from 'lucide-react'
import {
	Ticket,
	MessageCircle,
	Compass,
	Coins,
	Crosshair,
	Car,
	ShoppingBag,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// THA BRONX 3 导航分类（与 0_meta/关键词.json 一致）
// 图标与首页 Tools Grid 卡片保持一致，discord 用 MessageCircle（社区/聊天）
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'codes', path: '/codes', icon: Ticket, isContentType: true },
	{ key: 'discord', path: '/discord', icon: MessageCircle, isContentType: true },
	{ key: 'guide', path: '/guide', icon: Compass, isContentType: true },
	{ key: 'money', path: '/money', icon: Coins, isContentType: true },
	{ key: 'weapons', path: '/weapons', icon: Crosshair, isContentType: true },
	{ key: 'vehicles', path: '/vehicles', icon: Car, isContentType: true },
	{ key: 'gamepasses', path: '/gamepasses', icon: ShoppingBag, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['codes','discord','guide','money','weapons','vehicles','gamepasses']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
