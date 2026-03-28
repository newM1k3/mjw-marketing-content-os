// Kanban Board — Drag-and-drop content pipeline view
import { useState, useCallback } from "react";
import { DndContext, DragOverlay, closestCorners, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { store, type ContentItem, type ContentStatus } from "@/lib/store";
import { statusBadgeClass, priorityBadgeClass, brandClass, formatDate } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

const COLUMNS: { status: ContentStatus; label: string; color: string }[] = [
  { status: 'Backlog',   label: 'Backlog',   color: '#64748b' },
  { status: 'Briefing',  label: 'Briefing',  color: '#fbbf24' },
  { status: 'Drafting',  label: 'Drafting',  color: '#6ee7f7' },
  { status: 'Editing',   label: 'Editing',   color: '#a78bfa' },
  { status: 'Approved',  label: 'Approved',  color: '#34d399' },
  { status: 'Scheduled', label: 'Scheduled', color: '#fb923c' },
  { status: 'Published', label: 'Published', color: '#6ee7b7' },
];

function KanbanCard({ item, brands, isDragging }: {
  item: ContentItem;
  brands: ReturnType<typeof store.getBrands>;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  const brandName = brands.find(b => b.id === item.brandId)?.name ?? item.brandId;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: '#1a1f2e', borderColor: '#2d3748' }}
      className="rounded-lg border p-3 cursor-default select-none group"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={14} style={{ color: '#64748b' }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium leading-snug mb-2 line-clamp-2" style={{ color: '#e2e8f0' }}>{item.title}</p>
          <div className="flex flex-wrap gap-1 mb-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${brandClass(item.brandId)}`}>{brandName}</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${priorityBadgeClass(item.priority)}`}>{item.priority}</span>
          </div>
          {item.targetKeyword && (
            <p className="text-xs truncate" style={{ color: '#64748b' }}>{item.targetKeyword}</p>
          )}
          {item.dueDate && (
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{formatDate(item.dueDate)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ status, label, color, items, brands }: {
  status: ContentStatus;
  label: string;
  color: string;
  items: ContentItem[];
  brands: ReturnType<typeof store.getBrands>;
}) {
  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-xs font-semibold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
        </div>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: `${color}18`, color }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div
          className="flex-1 rounded-xl p-2 space-y-2 min-h-32"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          {items.length === 0 && (
            <div className="flex items-center justify-center h-20">
              <p className="text-xs" style={{ color: '#2d3748' }}>Drop here</p>
            </div>
          )}
          {items.map(item => (
            <KanbanCard key={item.id} item={item} brands={brands} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanPage() {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterBrand, setFilterBrand] = useState('');

  const brands = store.getBrands();
  const allContent = store.getContent();
  const content = filterBrand ? allContent.filter(c => c.brandId === filterBrand) : allContent;

  const columnItems = useCallback((status: ContentStatus) =>
    content.filter(c => c.status === status),
    [content]
  );

  const activeItem = activeId ? allContent.find(c => c.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedId = active.id as string;
    // Determine target column: over could be a card id or column id
    const overId = over.id as string;

    // Find which column the over target belongs to
    let targetStatus: ContentStatus | null = null;
    for (const col of COLUMNS) {
      if (col.status === overId) { targetStatus = col.status; break; }
      if (content.find(c => c.id === overId && c.status === col.status)) {
        targetStatus = col.status; break;
      }
    }

    if (targetStatus) {
      const dragged = allContent.find(c => c.id === draggedId);
      if (dragged && dragged.status !== targetStatus) {
        store.updateContent(draggedId, { status: targetStatus });
        toast.success(`Moved to ${targetStatus}`);
        refresh();
      }
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Kanban Board</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Drag cards to move between stages</p>
        </div>
        <select
          value={filterBrand}
          onChange={e => setFilterBrand(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
        >
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full pb-4" style={{ minWidth: 'max-content' }}>
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                color={col.color}
                items={columnItems(col.status)}
                brands={brands}
              />
            ))}
          </div>
          <DragOverlay>
            {activeItem && (
              <div className="rounded-lg border p-3 shadow-2xl rotate-1" style={{ background: '#1a1f2e', borderColor: '#6ee7f7', width: 256 }}>
                <p className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{activeItem.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
