'use client';

import React from 'react';
import {
  Square,
  Circle,
  Type,
  Trash2,
  Undo2,
  Redo2,
  Download,
  Save,
  FolderOpen,
  FilePlus,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AutosaveStatus } from '../hooks/useCanvasState';
import { User } from '../lib/types';

interface ToolbarProps {
  onAddShape: (type: 'rect' | 'circle' | 'text') => void;
  onDeleteSelected: () => void;
  hasSelected: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onExportPng: () => void;
  onSave: () => void;
  onOpenCanvasModal: () => void;
  onNewCanvas: () => void;
  canvasName: string;
  onCanvasNameChange: (name: string) => void;
  autosaveStatus: AutosaveStatus;
  currentUser: User | null;
  onLogout: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddShape,
  onDeleteSelected,
  hasSelected,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onExportPng,
  onSave,
  onOpenCanvasModal,
  onNewCanvas,
  canvasName,
  onCanvasNameChange,
  autosaveStatus,
  currentUser,
  onLogout
}) => {
  return (
    <header className="app-header flex items-center justify-between px-4 py-2 bg-white border-b border-[#d0d7de] text-[#1f2328] select-none shadow-sm">
      {/* Left: Project title & canvas name input */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#0969da] flex items-center justify-center font-bold text-white text-xs shadow-sm">
            M
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#1f2328]">
            Mini Design Canvas
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#d0d7de]" />

        <input
          type="text"
          value={canvasName}
          onChange={(e) => onCanvasNameChange(e.target.value)}
          placeholder="Untitled Canvas"
          className="bg-[#f6f8fa] border border-[#d0d7de] hover:border-[#0969da] focus:border-[#0969da] rounded px-2.5 py-1 text-xs text-[#1f2328] font-medium outline-none transition-colors w-40 sm:w-52"
        />

        {/* Autosave status indicator */}
        <div className="flex items-center gap-1.5 text-xs text-[#656d76]">
          {autosaveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-[#9a6700]">
              <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[#1a7f37]">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
          {autosaveStatus === 'unsaved' && (
            <span className="flex items-center gap-1 text-[#656d76]">
              <span className="w-2 h-2 rounded-full bg-[#9a6700]" /> Unsaved
            </span>
          )}
          {autosaveStatus === 'error' && (
            <span className="flex items-center gap-1 text-[#cf222e]">
              <AlertCircle className="w-3 h-3" /> Save failed
            </span>
          )}
        </div>
      </div>

      {/* Center: Shapes & History Tools */}
      <div className="flex items-center gap-1 bg-[#f6f8fa] p-1 rounded-md border border-[#d0d7de]">
        {/* Insert Shapes */}
        <button
          onClick={() => onAddShape('rect')}
          title="Add Rectangle"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] hover:text-[#0969da] rounded transition-colors"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAddShape('circle')}
          title="Add Circle"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] hover:text-[#0969da] rounded transition-colors"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAddShape('text')}
          title="Add Text"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] hover:text-[#0969da] rounded transition-colors"
        >
          <Type className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#d0d7de] mx-1" />

        {/* History Controls */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] disabled:text-[#8c959f] disabled:hover:bg-transparent rounded transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] disabled:text-[#8c959f] disabled:hover:bg-transparent rounded transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#d0d7de] mx-1" />

        {/* Layer Controls */}
        <button
          onClick={onBringForward}
          disabled={!hasSelected}
          title="Bring Forward"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] disabled:text-[#8c959f] disabled:hover:bg-transparent rounded transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={onSendBackward}
          disabled={!hasSelected}
          title="Send Backward"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] disabled:text-[#8c959f] disabled:hover:bg-transparent rounded transition-colors"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={onBringToFront}
          disabled={!hasSelected}
          title="Bring to Front"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] disabled:text-[#8c959f] disabled:hover:bg-transparent rounded transition-colors"
        >
          <ChevronsUp className="w-4 h-4" />
        </button>
        <button
          onClick={onSendToBack}
          disabled={!hasSelected}
          title="Send to Back"
          className="p-1.5 hover:bg-[#eaeef2] text-[#24292f] disabled:text-[#8c959f] disabled:hover:bg-transparent rounded transition-colors"
        >
          <ChevronsDown className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#d0d7de] mx-1" />

        {/* Delete Element */}
        <button
          onClick={() => onDeleteSelected()}
          disabled={!hasSelected}
          title="Delete Selected Element (Del)"
          className="p-1.5 hover:bg-[#ffebe9] text-[#cf222e] disabled:text-[#8c959f] disabled:hover:bg-transparent rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right: File Actions & User Session */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewCanvas}
          title="New Canvas"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white hover:bg-[#f6f8fa] border border-[#d0d7de] rounded transition-colors text-[#24292f] shadow-sm"
        >
          <FilePlus className="w-3.5 h-3.5 text-[#656d76]" />
          <span className="hidden sm:inline">New</span>
        </button>

        <button
          onClick={onOpenCanvasModal}
          title="Open Saved Canvases"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white hover:bg-[#f6f8fa] border border-[#d0d7de] rounded transition-colors text-[#24292f] shadow-sm"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#656d76]" />
          <span className="hidden sm:inline">Open</span>
        </button>

        <button
          onClick={onSave}
          title="Save Canvas"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#1f883d] hover:bg-[#1a7f37] text-white rounded transition-colors shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={onExportPng}
          title="Export Canvas as PNG"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#0969da] hover:bg-[#0860ca] text-white rounded transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PNG</span>
        </button>

        <div className="h-4 w-[1px] bg-[#d0d7de] mx-1" />

        {/* User Profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-1.5 text-xs text-[#656d76]">
              <UserIcon className="w-3.5 h-3.5 text-[#0969da]" />
              <span className="font-semibold text-[#1f2328] max-w-[90px] truncate">
                {currentUser.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-1 hover:bg-[#ffebe9] hover:text-[#cf222e] rounded transition-colors text-[#656d76]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
