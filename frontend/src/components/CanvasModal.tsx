'use client';

import React, { useEffect, useState } from 'react';
import { CanvasMetadata } from '../lib/types';
import { api } from '../lib/api';
import { X, Trash2, Folder, Clock, Shapes, Loader2 } from 'lucide-react';

interface CanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCanvas: (id: string) => Promise<void>;
  onDeleteActiveCanvas?: () => void;
  currentCanvasId: string | null;
}

export const CanvasModal: React.FC<CanvasModalProps> = ({
  isOpen,
  onClose,
  onLoadCanvas,
  onDeleteActiveCanvas,
  currentCanvasId
}) => {
  const [canvases, setCanvases] = useState<CanvasMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCanvases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCanvases();
      if (res.success && res.data) {
        setCanvases(res.data);
      } else {
        setError(res.error || 'Failed to load canvases');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching canvases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCanvases();
      setConfirmDeleteId(null);
    }
  }, [isOpen]);

  const executeDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const res = await api.deleteCanvas(id);
      if (res.success) {
        setCanvases((prev) => prev.filter((c) => c._id !== id));
        if (id === currentCanvasId && onDeleteActiveCanvas) {
          onDeleteActiveCanvas();
        }
      } else {
        alert(res.error || 'Failed to delete canvas');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting canvas');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      executeDelete(id);
    } else {
      setConfirmDeleteId(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-white border border-[#d0d7de] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#d0d7de] bg-[#f6f8fa]">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-[#0969da]" />
            <h2 className="text-sm font-semibold text-[#1f2328]">Your Saved Canvases</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#eaeef2] text-[#656d76] hover:text-[#1f2328] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 bg-[#ffffff]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#656d76]">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#0969da]" />
              <span className="text-xs">Fetching canvases...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[#ffebe9] border border-[#ff8182]/40 rounded text-xs text-[#cf222e]">
              {error}
            </div>
          )}

          {!loading && canvases.length === 0 && (
            <div className="text-center py-12 text-[#656d76]">
              <Shapes className="w-8 h-8 mx-auto mb-2 text-[#8c959f]" />
              <p className="text-xs font-medium text-[#1f2328]">No saved canvases yet.</p>
              <p className="text-[11px] text-[#656d76] mt-1">
                Create shapes and click &apos;Save&apos; to persist your work.
              </p>
            </div>
          )}

          {!loading &&
            canvases.map((canvas) => {
              const isCurrent = canvas._id === currentCanvasId;
              const isConfirming = confirmDeleteId === canvas._id;
              const formattedDate = new Date(canvas.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={canvas._id}
                  onClick={async () => {
                    await onLoadCanvas(canvas._id);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-md border transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#ddf4ff] border-[#54aeff] hover:bg-[#cbeeff]'
                      : 'bg-[#ffffff] border-[#d0d7de] hover:border-[#0969da]/60 hover:bg-[#f6f8fa]'
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1f2328] truncate">
                        {canvas.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#0969da] text-white px-1.5 py-0.5 rounded font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#656d76]">
                      <span className="flex items-center gap-1">
                        <Shapes className="w-3 h-3" /> {canvas.shapeCount} elements
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDeleteClick(e, canvas._id)}
                          className="px-2 py-1 text-[11px] bg-[#cf222e] text-white font-semibold rounded hover:bg-[#a40e26] transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 text-[11px] bg-[#eaeef2] text-[#656d76] font-medium rounded hover:bg-[#d0d7de] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleDeleteClick(e, canvas._id)}
                        disabled={deletingId === canvas._id}
                        title="Delete Canvas"
                        className="p-1.5 text-[#656d76] hover:text-[#cf222e] hover:bg-[#ffebe9] rounded transition-colors"
                      >
                        {deletingId === canvas._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cf222e]" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#d0d7de] bg-[#f6f8fa] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium bg-white hover:bg-[#eaeef2] text-[#1f2328] rounded border border-[#d0d7de] transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
