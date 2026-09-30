'use client';

import React, { useRef, useEffect } from 'react';
import { CurvePoint } from '@/types/audio';

interface PitchCanvasProps {
  targetCurve: CurvePoint[];
  currentPitch: number;      // Current vocal Hz detected
  isVoiced: boolean;
  elapsedMs: number;
  totalDurationMs: number;
  targetFreq: number;
  recordedHistory: Array<{ timeMs: number; freq: number; isVoiced: boolean }>;
  minFreqDisplay?: number;
  maxFreqDisplay?: number;
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  targetCurve,
  currentPitch,
  isVoiced,
  elapsedMs,
  totalDurationMs,
  targetFreq,
  recordedHistory,
  minFreqDisplay = 80,
  maxFreqDisplay = 350,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Background
    ctx.fillStyle = '#0B132B';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines (horizontal frequency lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const numLines = 5;
    for (let i = 1; i < numLines; i++) {
      const y = (height / numLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Helper: Map timeMs to X coordinate
    const timeToX = (t: number) => {
      return (t / totalDurationMs) * (width - 40) + 20;
    };

    // Helper: Map frequency in Hz to Y coordinate (logarithmic perception)
    const freqToY = (f: number) => {
      if (f <= 0) return height;
      const minLog = Math.log(minFreqDisplay);
      const maxLog = Math.log(maxFreqDisplay);
      const fLog = Math.log(Math.max(minFreqDisplay, Math.min(maxFreqDisplay, f)));
      const norm = (fLog - minLog) / (maxLog - minLog);
      // Invert Y because canvas Y=0 is at top
      return height - 30 - norm * (height - 60);
    };

    // 2. Draw Target Curve (Route Vocale Cible)
    if (targetCurve.length > 1) {
      // Draw target tolerance corridor
      ctx.beginPath();
      for (let i = 0; i < targetCurve.length; i++) {
        const x = timeToX(targetCurve[i].timeMs);
        // +45 cents is * 2^(45/1200)
        const yTop = freqToY(targetCurve[i].freq * 1.026);
        if (i === 0) ctx.moveTo(x, yTop);
        else ctx.lineTo(x, yTop);
      }
      for (let i = targetCurve.length - 1; i >= 0; i--) {
        const x = timeToX(targetCurve[i].timeMs);
        const yBottom = freqToY(targetCurve[i].freq * 0.974);
        ctx.lineTo(x, yBottom);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(224, 169, 109, 0.08)';
      ctx.fill();

      // Draw Main Target Line
      ctx.beginPath();
      ctx.strokeStyle = '#E0A96D';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(224, 169, 109, 0.4)';
      ctx.shadowBlur = 8;

      for (let i = 0; i < targetCurve.length; i++) {
        const x = timeToX(targetCurve[i].timeMs);
        const y = freqToY(targetCurve[i].freq);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. Draw User's Vocal History (Trajectoire Vocale)
    if (recordedHistory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#48CAE4';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(72, 202, 228, 0.6)';
      ctx.shadowBlur = 10;

      let inSegment = false;
      for (let i = 0; i < recordedHistory.length; i++) {
        const pt = recordedHistory[i];
        if (pt.isVoiced && pt.freq > 0) {
          const x = timeToX(pt.timeMs);
          const y = freqToY(pt.freq);
          if (!inSegment) {
            ctx.moveTo(x, y);
            inSegment = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          inSegment = false;
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 4. Draw Current Playhead (Vertical Cursor)
    const currentX = timeToX(elapsedMs);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(currentX, 10);
    ctx.lineTo(currentX, height - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw Target Point on Playhead
    if (targetFreq > 0) {
      const targetY = freqToY(targetFreq);
      ctx.beginPath();
      ctx.arc(currentX, targetY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#E0A96D';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 6. Draw User Real-time Voice Cursor
    if (isVoiced && currentPitch > 0) {
      const voiceY = freqToY(currentPitch);
      ctx.beginPath();
      ctx.arc(currentX, voiceY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#48CAE4';
      ctx.shadowColor = 'rgba(72, 202, 228, 0.9)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 7. Labels: Aigu / Grave
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('AIGU (مرتفع)', 24, 25);
    ctx.fillText('GRAVE (منخفض)', 24, height - 15);

    ctx.restore();
  }, [
    targetCurve,
    currentPitch,
    isVoiced,
    elapsedMs,
    totalDurationMs,
    targetFreq,
    recordedHistory,
    minFreqDisplay,
    maxFreqDisplay,
  ]);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0B132B]">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
