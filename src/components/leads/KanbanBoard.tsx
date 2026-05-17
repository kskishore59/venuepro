import React, { useMemo } from 'react';
import { 
  DndContext, DragOverlay, closestCorners, KeyboardSensor, 
  PointerSensor, useSensor, useSensors, useDroppable
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lead } from '../../types';
import { LeadCard } from './LeadCard';

interface KanbanBoardProps {
  leads: Lead[];
  onLeadMove: (leadId: string, newStatus: string) => void;
  onLeadClick: (lead: Lead) => void;
}

const COLUMNS = [
  { id: 'new', title: 'New Inquiry', color: 'bg-gray-100 border-gray-200 text-gray-800' },
  { id: 'contacted', title: 'Contacted', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  { id: 'visit_scheduled', title: 'Site Visit', color: 'bg-yellow-100 border-yellow-200 text-yellow-800' },
  { id: 'proposal_sent', title: 'Proposal Sent', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  { id: 'negotiating', title: 'Negotiating', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  { id: 'won', title: 'Won', color: 'bg-green-100 border-green-200 text-green-800' },
  { id: 'lost', title: 'Lost', color: 'bg-red-100 border-red-200 text-red-800' },
];

interface DroppableColumnProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, className, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`${className} transition-colors duration-200 ${isOver ? 'bg-primary/5 border border-dashed border-primary/30' : ''}`}
    >
      {children}
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onLeadMove, onLeadClick }) => {
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);

  const columnsWithLeads = useMemo(() => {
    const cols: Record<string, Lead[]> = {};
    COLUMNS.forEach(c => cols[c.id] = []);
    leads.forEach(l => {
      if (cols[l.status]) cols[l.status].push(l);
    });
    return cols;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handling visually while dragging could be added here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Check if dropped on a column directly
    const isOverColumn = COLUMNS.find(c => c.id === overId);
    if (isOverColumn && lead.status !== overId) {
      onLeadMove(leadId, overId);
      return;
    }

    // Check if dropped on another card
    const overLead = leads.find(l => l.id === overId);
    if (overLead && lead.status !== overLead.status) {
      onLeadMove(leadId, overLead.status);
    }
  };

  return (
    <div className="flex h-[calc(100vh-16rem)] overflow-x-auto pb-4 gap-4">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map(col => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col bg-gray-50/50 rounded-lg border border-gray-200">
            <div className={`px-4 py-3 rounded-t-lg border-b font-semibold text-sm flex justify-between items-center ${col.color}`}>
              {col.title}
              <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{columnsWithLeads[col.id].length}</span>
            </div>
            
            <DroppableColumn id={col.id} className="flex-1 p-3 overflow-y-auto">
              {/* @ts-ignore */}
              <SortableContext id={col.id} items={columnsWithLeads[col.id].map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 min-h-[100px]">
                  {columnsWithLeads[col.id].map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
                  ))}
                </div>
              </SortableContext>
            </DroppableColumn>
          </div>
        ))}

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
