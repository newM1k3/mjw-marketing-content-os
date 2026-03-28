import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ContentStatus, Priority } from "./store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusBadgeClass(status: ContentStatus): string {
  const map: Record<ContentStatus, string> = {
    Backlog: 'badge-backlog',
    Briefing: 'badge-briefing',
    Drafting: 'badge-drafting',
    Editing: 'badge-editing',
    Approved: 'badge-approved',
    Scheduled: 'badge-scheduled',
    Published: 'badge-published',
  };
  return map[status] ?? 'badge-backlog';
}

export function priorityBadgeClass(priority: Priority): string {
  const map: Record<Priority, string> = {
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  };
  return map[priority] ?? 'badge-low';
}

export function brandClass(brandId: string): string {
  if (brandId === 'brand-escape-maze') return 'brand-escape-maze';
  if (brandId === 'brand-mjw-design') return 'brand-mjw-design';
  return 'badge-backlog';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '\u2014';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function daysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const STATUS_ORDER: ContentStatus[] = [
  'Backlog', 'Briefing', 'Drafting', 'Editing', 'Approved', 'Scheduled', 'Published'
];

export const CONTENT_TYPES = ['Blog Post', 'GBP Post', 'Social Post', 'YouTube', 'Email', 'Lead Magnet', 'Video'] as const;
export const PLATFORMS = ['Google Business Profile', 'Blog', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Email'] as const;
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
export const SEARCH_INTENTS = ['Informational', 'Navigational', 'Transactional', 'Commercial', ''] as const;
