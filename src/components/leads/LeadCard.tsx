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
        "bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-[#107ed8]/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group",
        isDragging && "opacity-50 border-dashed border-2 border-[#107ed8] shadow-lg shadow-[#107ed8]/10"
      )}
    >
      <div className="flex justify-between items-start mb-2.5">
        <h4 className="font-bold text-slate-900 text-sm truncate pr-2 tracking-tight">{lead.name}</h4>
        <div className="flex-shrink-0" title={lead.source}>
          {getSourceIcon(lead.source)}
        </div>
      </div>
      
      <div className="flex items-center text-xs font-medium text-slate-500 mb-2.5">
        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {lead.phone}
      </div>

      {(lead.event_type || lead.tentative_date) && (
        <div className="text-[11px] bg-slate-50 border border-slate-100 p-1.5 rounded-lg text-slate-600 mb-3 truncate font-medium">
          {lead.event_type && <span className="capitalize">{lead.event_type}</span>}
          {lead.event_type && lead.tentative_date && ' • '}
          {lead.tentative_date && format(new Date(lead.tentative_date), 'dd MMM yyyy')}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className={cn("text-[10px] font-bold uppercase tracking-wider", daysSinceContact > 3 ? "text-red-500" : "text-slate-400")}>
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
