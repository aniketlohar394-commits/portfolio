'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ClockTimePickerProps {
  value: string; // e.g. "17:18" or "09:00"
  onChange: (time: string) => void;
}

export default function ClockTimePicker({ value, onChange }: ClockTimePickerProps) {
  const [hour12, setHour12] = useState<number>(5);
  const [minute, setMinute] = useState<number>(18);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');
  const [pickingMode, setPickingMode] = useState<'hour' | 'minute'>('hour');

  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length === 2) {
        let h24 = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(h24) && !isNaN(m)) {
          setMinute(m);
          if (h24 >= 12) {
            setAmpm('PM');
            setHour12(h24 === 12 ? 12 : h24 - 12);
          } else {
            setAmpm('AM');
            setHour12(h24 === 0 ? 12 : h24);
          }
        }
      }
    }
  }, [value]);

  const emitChange = (h12: number, min: number, period: 'AM' | 'PM') => {
    let h24 = h12;
    if (period === 'PM' && h12 < 12) h24 = h12 + 12;
    if (period === 'AM' && h12 === 12) h24 = 0;

    const hStr = h24.toString().padStart(2, '0');
    const mStr = min.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const handleSelectHour = (h: number) => {
    setHour12(h);
    emitChange(h, minute, ampm);
    setPickingMode('minute');
  };

  const handleSelectMinute = (m: number) => {
    setMinute(m);
    emitChange(hour12, m, ampm);
  };

  const handleToggleAmpm = (newPeriod: 'AM' | 'PM') => {
    setAmpm(newPeriod);
    emitChange(hour12, minute, newPeriod);
  };

  // 12 Hours List
  const hours12List = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Minutes List
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Calculate pointer angle
  let handAngle = 0;
  const radiusPercent = 38;

  if (pickingMode === 'hour') {
    // 12 is at top (-90 deg), 1 is at -60 deg...
    const index = hour12 % 12;
    handAngle = (index * 30) - 90;
  } else {
    handAngle = (minute * 6) - 90;
  }

  const radian = (handAngle * Math.PI) / 180;
  const pointerX = 50 + radiusPercent * Math.cos(radian);
  const pointerY = 50 + radiusPercent * Math.sin(radian);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: '#1E293B', padding: '20px', borderRadius: '24px', color: '#F8FAFC', width: '100%', maxWidth: '320px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Clock size={14} color="#FF6B35" /> Select Time
      </div>

      {/* Digital Hour : Minute Display Boxes + AM/PM Toggle Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Hour Box */}
        <button
          type="button"
          onClick={() => setPickingMode('hour')}
          style={{
            background: pickingMode === 'hour' ? '#FF6B35' : '#334155',
            color: '#FFFFFF',
            fontSize: '36px',
            fontWeight: '800',
            padding: '10px 18px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            boxShadow: pickingMode === 'hour' ? '0 4px 14px rgba(255,107,53,0.4)' : 'none'
          }}
        >
          {hour12.toString().padStart(2, '0')}
        </button>

        <span style={{ fontSize: '32px', fontWeight: '800', color: '#94A3B8' }}>:</span>

        {/* Minute Box */}
        <button
          type="button"
          onClick={() => setPickingMode('minute')}
          style={{
            background: pickingMode === 'minute' ? '#FF6B35' : '#334155',
            color: '#FFFFFF',
            fontSize: '36px',
            fontWeight: '800',
            padding: '10px 18px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            boxShadow: pickingMode === 'minute' ? '0 4px 14px rgba(255,107,53,0.4)' : 'none'
          }}
        >
          {minute.toString().padStart(2, '0')}
        </button>

        {/* AM / PM Switching Buttons beside Minutes Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '4px' }}>
          <button
            type="button"
            onClick={() => handleToggleAmpm('AM')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              background: ampm === 'AM' ? '#FF6B35' : '#334155',
              color: ampm === 'AM' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 150ms ease'
            }}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handleToggleAmpm('PM')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              background: ampm === 'PM' ? '#FF6B35' : '#334155',
              color: ampm === 'PM' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 150ms ease'
            }}
          >
            PM
          </button>
        </div>
      </div>

      {/* Circular Radial Clock Face (12-Hour Format) */}
      <div style={{ position: 'relative', width: '240px', height: '240px', borderRadius: '50%', background: '#0F172A', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Center Dot */}
        <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B35', zIndex: 10 }}></div>

        {/* SVG Clock Pointer Hand Line */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          <line
            x1="50%"
            y1="50%"
            x2={`${pointerX}%`}
            y2={`${pointerY}%`}
            stroke="#FF6B35"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Pointer Circle Head */}
        <div
          style={{
            position: 'absolute',
            left: `${pointerX}%`,
            top: `${pointerY}%`,
            transform: 'translate(-50%, -50%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#FF6B35',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 8,
            boxShadow: '0 2px 10px rgba(255,107,53,0.5)'
          }}
        >
          {pickingMode === 'hour' ? hour12 : minute.toString().padStart(2, '0')}
        </div>

        {/* Render Numbers on 12-Hour Clock Face */}
        {pickingMode === 'hour' ? (
          hours12List.map((h) => {
            const index = h % 12;
            const angle = (index * 30) - 90;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 38 * Math.cos(rad);
            const y = 50 + 38 * Math.sin(rad);

            return (
              <button
                key={`h12-${h}`}
                type="button"
                onClick={() => handleSelectHour(h)}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'none',
                  border: 'none',
                  color: hour12 === h ? 'transparent' : '#F8FAFC',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  zIndex: 6
                }}
              >
                {h}
              </button>
            );
          })
        ) : (
          /* Minutes Mode (0, 5, 10 ... 55) */
          minutesList.map((m) => {
            const angle = (m * 6) - 90;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 36 * Math.cos(rad);
            const y = 50 + 36 * Math.sin(rad);

            return (
              <button
                key={`min-${m}`}
                type="button"
                onClick={() => handleSelectMinute(m)}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'none',
                  border: 'none',
                  color: minute === m ? 'transparent' : '#F8FAFC',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  zIndex: 6
                }}
              >
                {m.toString().padStart(2, '0')}
              </button>
            );
          })
        )}
      </div>

      {/* Mode Switch Helper Tag */}
      <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
        Tap digits or clock face to select {pickingMode} ({ampm})
      </div>
    </div>
  );
}
