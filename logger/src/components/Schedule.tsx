import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}


interface ScheduleProps {
  events: { start_time: number; end_time: number; day: string; activity: string }[];
}

const NoToolbar = () => {
  return <div></div>;
};

const Schedule: React.FC<ScheduleProps> = ({ events }) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const mappedEvents: CalendarEvent[] = events.map((item) => {
      const { activity, day, start_time, end_time } = item;

      const today = new Date();
      const dayOffset = today.getDay();
      today.setDate(today.getDate() - dayOffset + dayMap(day))
      console.log(today)

      const startDate = new Date(today);
      startDate.setHours(start_time, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setHours(end_time, 0, 0, 0);

      return {
        title: activity,
        start: startDate,
        end: endDate,
      };
    });

    setCalendarEvents(mappedEvents);
  }, [events]);

  return (
    <div className="schedule-container">
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week']}
          style={{ height: 500 }}
          components={{
            toolbar: NoToolbar,
          }}
        />
      </div>
    </div>
  );
};


function dayMap(day: string): number {
  const mapping: Record<string, number> = {
    U: 0, // Sunday
    M: 1, // Monday
    T: 2, // Tuesday
    W: 3, // Wednesday
    R: 4, // Thursday
    F: 5, // Friday
    S: 6, // Saturday
  };
  return mapping[day] || 0;
}


export default Schedule;
