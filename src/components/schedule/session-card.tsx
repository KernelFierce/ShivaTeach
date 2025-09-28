'use client';

import { useDrag } from 'react-dnd';

export const ItemTypes = {
  SESSION: 'session',
};

export interface SessionCardProps {
  session: any; // Replace with a proper session type later
  getUserName: (id: string) => string;
  getCourseName: (id: string) => string;
  timeZone: string;
  formatInTimeZone: any;
  onClick: () => void;
}

export function SessionCard({ session, getUserName, getCourseName, timeZone, formatInTimeZone, onClick }: SessionCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SESSION,
    item: { id: session.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="bg-primary/10 border-l-4 border-primary text-primary-foreground p-2 rounded-md cursor-pointer"
    >
      <p className="text-xs font-bold text-primary">
        {getCourseName(session.courseId)}
      </p>
      <p className="text-[11px] text-primary/80">
        {getUserName(session.studentId)} w/ {' '}
        {getUserName(session.teacherId)}
      </p>
      <p className="text-[10px] text-primary/60 pt-1">
        {formatInTimeZone(session.startTime.toDate(), 'p', { timeZone })} - {formatInTimeZone(session.endTime.toDate(), 'p', { timeZone })}
      </p>
    </div>
  );
}
