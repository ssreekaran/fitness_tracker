import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';
type Weekday = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface RecurrenceRule {
  frequency: Frequency;
  interval: number;
  count?: number;
  endDate?: Date;
  weekdays?: Weekday[];
  monthDay?: number;
  customDays?: number;
  customWeeks?: number;
  customMonths?: number;
}

interface RecurrenceOptionsProps {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
}

const RecurrenceOptions: React.FC<RecurrenceOptionsProps> = ({ value, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [recurring, setRecurring] = useState(!!value);
  const [frequency, setFrequency] = useState<Frequency>(value?.frequency || 'weekly');
  const [interval, setInterval] = useState(value?.interval || 1);
  const [endOption, setEndOption] = useState<'count' | 'date'>(value?.count ? 'count' : 'date');
  const [count, setCount] = useState<number>(value?.count || 5);
  const [endDate, setEndDate] = useState<Date>(
    value?.endDate ? new Date(value.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    value?.weekdays || ['monday', 'wednesday', 'friday']
  );
  const [monthDay, setMonthDay] = useState<number>(value?.monthDay || new Date().getDate());
  const [customDays, setCustomDays] = useState<number>(value?.customDays || 1);
  const [customWeeks, setCustomWeeks] = useState<number>(value?.customWeeks || 1);
  const [customMonths, setCustomMonths] = useState<number>(value?.customMonths || 1);

  const toggleRecurring = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isRecurring = e.target.checked;
    setRecurring(isRecurring);
    
    if (isRecurring) {
      updateRecurrenceRule();
    } else {
      onChange(null);
    }
  };

  const toggleWeekday = (day: Weekday) => {
    const newWeekdays = weekdays.includes(day)
      ? weekdays.filter(d => d !== day)
      : [...weekdays, day];
    
    setWeekdays(newWeekdays);
    updateRecurrenceRule({ weekdays: newWeekdays });
  };

  const updateRecurrenceRule = (updates: Partial<RecurrenceRule> = {}) => {
    const rule: RecurrenceRule = {
      frequency,
      interval,
      count: endOption === 'count' ? count : undefined,
      endDate: endOption === 'date' ? endDate : undefined,
      ...(frequency === 'weekly' && { weekdays }),
      ...(frequency === 'monthly' && { monthDay }),
      ...(frequency === 'custom' && { 
        customDays,
        customWeeks,
        customMonths 
      }),
      ...updates
    };
    
    // Ensure we always have either a count or an end date
    if (!rule.count && !rule.endDate) {
      rule.count = 5; // Default to 5 occurrences if nothing is set
    }
    
    onChange(rule);
  };

  const handleFrequencyChange = (newFrequency: Frequency) => {
    setFrequency(newFrequency);
    setShowCustom(newFrequency === 'custom');
    updateRecurrenceRule({ frequency: newFrequency });
  };

  const handleEndOptionChange = (option: 'count' | 'date') => {
    setEndOption(option);
    
    const updates: Partial<RecurrenceRule> = { count: undefined, endDate: undefined };
    if (option === 'count') updates.count = count;
    if (option === 'date') updates.endDate = endDate;
    
    updateRecurrenceRule(updates);
  };

  const weekDayLabels = [
    { value: 'sunday', label: 'Sun' },
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
  ] as const;

  return (
    <div className="recurrence-options">
      <Form.Group className="mb-3">
        <Form.Check
          type="switch"
          id="recurring-switch"
          label="Recurring event"
          checked={recurring}
          onChange={toggleRecurring}
        />
      </Form.Group>

      {recurring && (
        <div className="recurrence-details">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Recurrence</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  {['daily', 'weekly', 'monthly', 'custom'].map((freq) => (
                    <Button
                      key={freq}
                      variant={frequency === freq ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleFrequencyChange(freq as Frequency)}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Button>
                  ))}
                </div>
                {frequency !== 'custom' && (
                  <div className="d-flex align-items-center mt-2">
                    <span className="me-2">Every</span>
                    <Form.Control
                      type="number"
                      min={1}
                      value={interval}
                      onChange={(e) => {
                        const newInterval = parseInt(e.target.value) || 1;
                        setInterval(newInterval);
                        updateRecurrenceRule({ interval: newInterval });
                      }}
                      style={{ width: '70px', display: 'inline-block' }}
                      size="sm"
                    />
                    <span className="ms-2">
                      {frequency === 'daily' 
                        ? interval === 1 ? 'day' : 'days'
                        : frequency === 'weekly' 
                          ? interval === 1 ? 'week' : 'weeks'
                          : interval === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {frequency === 'weekly' && (
            <Form.Group className="mb-3">
              <Form.Label>Repeat on</Form.Label>
              <div className="d-flex gap-2">
                {weekDayLabels.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={weekdays.includes(value as Weekday) ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => toggleWeekday(value as Weekday)}
                    style={{
                      width: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <span style={{ width: '100%', textAlign: 'center' }}>{label}</span>
                  </Button>
                ))}
              </div>
            </Form.Group>
          )}

          {frequency === 'monthly' && (
            <Form.Group className="mb-3">
              <Form.Label>Day of month</Form.Label>
              <Form.Select
                value={monthDay}
                onChange={(e) => {
                  const day = parseInt(e.target.value);
                  setMonthDay(day);
                  updateRecurrenceRule({ monthDay: day });
                }}
                size="sm"
                style={{ width: '100px' }}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                    {day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {showCustom && (
            <div className="custom-recurrence mb-3">
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Every</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min={1}
                        value={customDays}
                        onChange={(e) => {
                          const days = parseInt(e.target.value) || 1;
                          setCustomDays(days);
                          updateRecurrenceRule({ customDays: days });
                        }}
                        size="sm"
                      />
                      <span className="ms-2">day(s)</span>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Every</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min={1}
                        value={customWeeks}
                        onChange={(e) => {
                          const weeks = parseInt(e.target.value) || 1;
                          setCustomWeeks(weeks);
                          updateRecurrenceRule({ customWeeks: weeks });
                        }}
                        size="sm"
                      />
                      <span className="ms-2">week(s)</span>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Every</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min={1}
                        value={customMonths}
                        onChange={(e) => {
                          const months = parseInt(e.target.value) || 1;
                          setCustomMonths(months);
                          updateRecurrenceRule({ customMonths: months });
                        }}
                        size="sm"
                      />
                      <span className="ms-2">month(s)</span>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Ends</Form.Label>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  id="end-after"
                  name="end-option"
                  checked={endOption === 'count'}
                  onChange={() => handleEndOptionChange('count')}
                  className="me-2"
                />
                <span className="me-2">After</span>
                <Form.Control
                  type="number"
                  min={1}
                  value={count}
                  onChange={(e) => {
                    const newCount = parseInt(e.target.value) || 1;
                    setCount(newCount);
                    updateRecurrenceRule({ count: newCount });
                  }}
                  size="sm"
                  style={{ width: '80px' }}
                  disabled={endOption !== 'count'}
                />
                <span className="ms-2">occurrences</span>
              </div>
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  id="end-date"
                  name="end-option"
                  checked={endOption === 'date'}
                  onChange={() => handleEndOptionChange('date')}
                  className="me-2"
                />
                <span className="me-2">On</span>
                <Form.Control
                  type="date"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setEndDate(newDate);
                    updateRecurrenceRule({ endDate: newDate });
                  }}
                  size="sm"
                  style={{ width: '150px' }}
                  disabled={endOption !== 'date'}
                />
              </div>
            </div>
          </Form.Group>
        </div>
      )}
    </div>
  );
};

export default RecurrenceOptions;
