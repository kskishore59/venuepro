import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lead } from '../../types';
import { format, differenceInDays } from 'date-fns';
import { Phone, MessageCircle, Globe, Search, UserPlus, Users, Share2, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

const getSourceIcon = (source?: string) => {
  switch (source?.toLowerCase()) {
    case 'whatsapp': return <MessageCircle className="w-3 h-3 text-green-500" />;
    case 'google': return <Search className="w-3 h-3 text-blue-500" />;
    case 'justdial': return <Globe className="w-3 h-3 text-orange-500" />;
    case 'walk-in': return <UserPlus className="w-3 h-3 text-purple-500" />;
    case 'referral': return <Share2 className="w-3 h-3 text-indigo-500" />;
    case 'instagram': return <Users className="w-3 h-3 text-pink-500" />;
    default: return <HelpCircle className="w-3 h-3 text-gray-400" />;
  }
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { type: 'Lead', lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysSinceContact = lead.last_contact_date 
    ? differenceInDays(new Date(), new Date(lead.last_contact_date))
    : differenceInDays(new Date(), new Date(lead.created_at));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead)}
      className={cn(
        "bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group",
        isDragging && "opacity-50 border-dashed border-2 border-primary"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm truncate pr-2">{lead.name}</h4>
        <div className="flex-shrink-0" title={lead.source}>
          {getSourceIcon(lead.source)}
        </div>
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <Phone className="w-3 h-3 mr-1" /> {lead.phone}
      </div>

      {(lead.event_type || lead.tentative_date) && (
        <div className="text-xs bg-gray-50 p-1.5 rounded text-gray-600 mb-2 truncate">
          {lead.event_type && <span className="capitalize">{lead.event_type}</span>}
          {lead.event_type && lead.tentative_date && ' • '}
          {lead.tentative_date && format(new Date(lead.tentative_date), 'dd MMM yyyy')}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <div className={cn("text-xs font-medium", daysSinceContact > 3 ? "text-red-600" : "text-gray-500")}>
          {daysSinceContact === 0 ? 'Contacted today' : `${daysSinceContact}d ago`}
        </div>
        
        {lead.assigned_to && (
          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold" title="Assigned Staff">
            {lead.assigned_to.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};
