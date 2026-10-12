import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import './DateOfBirthPicker.css';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function DateOfBirthPicker({ value, onChange, disabled }: { value: string; onChange: (date: string) => void; disabled?: boolean }) {
  const today = new Date(new Date().toLocaleDateString('en-US', { timeZone: 'Africa/Accra' }));
  const initial = value ? new Date(`${value}T12:00:00`) : new Date(today.getFullYear() - 25, 0, 1);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear] = useState(initial.getFullYear());
  const [draft, setDraft] = useState(value);
  const first = new Date(year, month, 1).getDay();
  const count = Math.ceil((first + new Date(year, month + 1, 0).getDate()) / 7) * 7;
  const selected = draft ? new Date(`${draft}T12:00:00`) : null;
  return <Popover open={open} onOpenChange={next => {
    if (next) { setDraft(value); const date = value ? new Date(`${value}T12:00:00`) : initial; setMonth(date.getMonth()); setYear(date.getFullYear()); }
    setOpen(next);
  }}>
    <PopoverTrigger asChild><button type="button" id="signup-dob" className="dob-trigger" disabled={disabled}><span>{value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select date of birth'}</span><CalendarDays size={18} /></button></PopoverTrigger>
    <PopoverContent className="dob-calendar" align="center" onClick={event => event.stopPropagation()}>
      <div className="dob-heading"><div><h3>Select Date</h3><div className="dob-selectors"><select aria-label="Birth month" value={month} onChange={event => setMonth(Number(event.target.value))}>{months.map((name, index) => <option key={name} value={index}>{name}</option>)}</select><select aria-label="Birth year" value={year} onChange={event => setYear(Number(event.target.value))}>{Array.from({ length: 121 }, (_, index) => today.getFullYear() - index).map(y => <option key={y} value={y}>{y}</option>)}</select></div></div><div className="dob-date-icon" aria-hidden="true"><CalendarDays /><strong>{String(selected?.getDate() ?? 1).padStart(2, '0')}</strong></div></div>
      <div className="dob-days">{weekdays.map(day => <span key={day} className="dob-weekday">{day}</span>)}{Array.from({ length: count }, (_, index) => {
        const date = new Date(year, month, index - first + 1);
        const iso = isoDate(date);
        const outside = date.getMonth() !== month;
        return <button type="button" key={iso} disabled={outside || date > today} aria-label={date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} aria-pressed={draft === iso} className={`${outside ? 'outside' : ''} ${date.getDay() === 0 ? 'sunday' : ''} ${draft === iso ? 'selected' : ''}`} onClick={() => setDraft(iso)}>{String(date.getDate()).padStart(2, '0')}</button>;
      })}</div>
      <button type="button" className="dob-confirm" disabled={!draft} onClick={() => { onChange(draft); setOpen(false); }}>Confirm</button>
    </PopoverContent>
  </Popover>;
}
