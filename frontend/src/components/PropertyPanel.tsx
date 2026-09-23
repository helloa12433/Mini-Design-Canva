'use client';

import React from 'react';
import { Shape, RectShape, CircleShape, TextShape } from '../lib/types';
import { Sliders, Hash, Move, RotateCw, Palette, Type } from 'lucide-react';

interface PropertyPanelProps {
  selectedShape: Shape | null;
  onUpdateProperties: (id: string, updates: Partial<Shape>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedShape,
  onUpdateProperties
}) => {
  if (!selectedShape) {
    return (
      <aside className="property-panel w-72 bg-white border-l border-[#d0d7de] p-4 flex flex-col justify-center items-center text-center text-[#656d76] select-none">
        <Sliders className="w-8 h-8 mb-2 text-[#8c959f]" />
        <span className="text-xs font-semibold text-[#1f2328] mb-1">No Element Selected</span>
        <p className="text-[11px] leading-relaxed max-w-[180px]">
          Click any shape on the canvas to inspect and edit coordinates, dimensions, and fill.
        </p>
      </aside>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdateProperties(selectedShape.id, { [key]: value } as any);
  };

  return (
    <aside className="property-panel w-72 bg-white border-l border-[#d0d7de] p-4 flex flex-col gap-4 text-[#1f2328] overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#d0d7de]">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-[#0969da]" />
          <span className="text-xs font-bold tracking-wider uppercase text-[#1f2328]">
            Properties
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#f6f8fa] border border-[#d0d7de] text-[#656d76] capitalize">
          {selectedShape.type}
        </span>
      </div>

      {/* Position Section */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#656d76]">
          <Move className="w-3 h-3" /> Position
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-[#f6f8fa] border border-[#d0d7de] rounded px-2 py-1 focus-within:border-[#0969da] focus-within:bg-white transition-colors">
            <span className="text-[11px] font-mono text-[#656d76] w-4">X</span>
            <input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className="bg-transparent text-xs text-[#1f2328] font-semibold w-full outline-none text-right font-mono"
            />
          </div>
          <div className="flex items-center bg-[#f6f8fa] border border-[#d0d7de] rounded px-2 py-1 focus-within:border-[#0969da] focus-within:bg-white transition-colors">
            <span className="text-[11px] font-mono text-[#656d76] w-4">Y</span>
            <input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className="bg-transparent text-xs text-[#1f2328] font-semibold w-full outline-none text-right font-mono"
            />
          </div>
        </div>
      </div>

      {/* Dimensions Section */}
      {selectedShape.type === 'rect' && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#656d76]">
            <Hash className="w-3 h-3" /> Dimensions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center bg-[#f6f8fa] border border-[#d0d7de] rounded px-2 py-1 focus-within:border-[#0969da] focus-within:bg-white transition-colors">
              <span className="text-[11px] font-mono text-[#656d76] w-4">W</span>
              <input
                type="number"
                min={5}
                value={Math.round((selectedShape as RectShape).width)}
                onChange={(e) => handleChange('width', Math.max(5, Number(e.target.value)))}
                className="bg-transparent text-xs text-[#1f2328] font-semibold w-full outline-none text-right font-mono"
              />
            </div>
            <div className="flex items-center bg-[#f6f8fa] border border-[#d0d7de] rounded px-2 py-1 focus-within:border-[#0969da] focus-within:bg-white transition-colors">
              <span className="text-[11px] font-mono text-[#656d76] w-4">H</span>
              <input
                type="number"
                min={5}
                value={Math.round((selectedShape as RectShape).height)}
                onChange={(e) => handleChange('height', Math.max(5, Number(e.target.value)))}
                className="bg-transparent text-xs text-[#1f2328] font-semibold w-full outline-none text-right font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {selectedShape.type === 'circle' && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#656d76]">
            <Hash className="w-3 h-3" /> Radius
          </label>
          <div className="flex items-center bg-[#f6f8fa] border border-[#d0d7de] rounded px-2 py-1 focus-within:border-[#0969da] focus-within:bg-white transition-colors">
            <span className="text-[11px] font-mono text-[#656d76] w-4">R</span>
            <input
              type="number"
              min={5}
              value={Math.round((selectedShape as CircleShape).radius)}
              onChange={(e) => handleChange('radius', Math.max(5, Number(e.target.value)))}
              className="bg-transparent text-xs text-[#1f2328] font-semibold w-full outline-none text-right font-mono"
            />
          </div>
        </div>
      )}

      {/* Rotation Section */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#656d76]">
          <RotateCw className="w-3 h-3" /> Rotation
        </label>
        <div className="flex items-center bg-[#f6f8fa] border border-[#d0d7de] rounded px-2 py-1 focus-within:border-[#0969da] focus-within:bg-white transition-colors">
          <span className="text-[11px] font-mono text-[#656d76] w-4">°</span>
          <input
            type="number"
            value={Math.round(selectedShape.rotation || 0)}
            onChange={(e) => handleChange('rotation', Number(e.target.value) % 360)}
            className="bg-transparent text-xs text-[#1f2328] font-semibold w-full outline-none text-right font-mono"
          />
        </div>
      </div>

      {/* Text Properties Section */}
      {selectedShape.type === 'text' && (
        <div className="space-y-2.5">
          <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#656d76]">
            <Type className="w-3 h-3" /> Text Content
          </label>
          <textarea
            rows={3}
            value={(selectedShape as TextShape).text}
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded p-2 text-xs text-[#1f2328] outline-none focus:border-[#0969da] focus:bg-white resize-none transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#656d76] font-medium">Font Size</span>
            <div className="flex items-center bg-[#f6f8fa] border border-[#d0d7de] rounded px-2 py-1 w-24 focus-within:border-[#0969da] focus-within:bg-white transition-colors">
              <input
                type="number"
                min={8}
                max={120}
                value={(selectedShape as TextShape).fontSize || 22}
                onChange={(e) => handleChange('fontSize', Math.max(8, Number(e.target.value)))}
                className="bg-transparent text-xs text-[#1f2328] font-semibold w-full outline-none text-right font-mono"
              />
              <span className="text-[10px] text-[#656d76] ml-1">px</span>
            </div>
          </div>
        </div>
      )}

      {/* Fill Color Section */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#656d76]">
          <Palette className="w-3 h-3" /> Fill Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedShape.fill}
            onChange={(e) => handleChange('fill', e.target.value)}
            className="w-8 h-8 rounded border border-[#d0d7de] bg-transparent cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={selectedShape.fill}
            onChange={(e) => handleChange('fill', e.target.value)}
            className="bg-[#f6f8fa] border border-[#d0d7de] rounded px-2.5 py-1 text-xs font-mono text-[#1f2328] font-semibold flex-1 outline-none uppercase focus:border-[#0969da] focus:bg-white transition-colors"
          />
        </div>

        {/* Quick Swatches */}
        <div className="flex items-center gap-1.5 pt-1">
          {['#0969da', '#1f883d', '#d29922', '#cf222e', '#8250df', '#bf3989', '#1f2328', '#ffffff'].map(
            (color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('fill', color)}
                className="w-5 h-5 rounded-full border border-[#d0d7de] hover:scale-110 transition-transform shadow-xs"
                style={{ backgroundColor: color }}
              />
            )
          )}
        </div>
      </div>
    </aside>
  );
};
