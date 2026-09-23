'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Konva from 'konva';
import { useCanvasState } from '@/hooks/useCanvasState';
import { Toolbar } from '@/components/Toolbar';
import { PropertyPanel } from '@/components/PropertyPanel';
import { CanvasModal } from '@/components/CanvasModal';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Dynamic client-only import for Konva CanvasStage
const CanvasStage = dynamic(
  () => import('@/components/CanvasStage').then((mod) => mod.CanvasStage),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#f6f8fa] text-[#656d76]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0969da]" />
      </div>
    )
  }
);


export default function CanvasEditorPage() {
  const router = useRouter();
  const stageRef = useRef<Konva.Stage>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    canvasId,
    canvasName,
    setCanvasName,
    shapes,
    selectedId,
    setSelectedId,
    selectedShape,
    addShape,
    updateShapeLive,
    endInteraction,
    updateShapeProperties,
    deleteShape,
    undo,
    redo,
    canUndo,
    canRedo,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    saveCanvas,
    loadCanvas,
    createNewCanvas,
    autosaveStatus,
    errorMessage,
    setErrorMessage
  } = useCanvasState();

  // Helper to show brief toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // Check auth and restore canvas from URL parameter on initial load / refresh
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const authRes = await api.getMe();
        if (!authRes.success || !authRes.data) {
          if (isMounted) router.push('/login');
          return;
        }

        if (isMounted) {
          setUser(authRes.data);
          setAuthLoading(false);
        }

        // Check if a canvas ID is present in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');

        if (urlId) {
          const canvasRes = await api.getCanvasById(urlId);
          if (isMounted && canvasRes.success && canvasRes.data) {
            loadCanvas(canvasRes.data._id || urlId, canvasRes.data.name, canvasRes.data.shapes);
          }
        }
      } catch {
        if (isMounted) router.push('/login');
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [router, loadCanvas]);

  // Handle manual Save action from toolbar
  const handleManualSave = async () => {
    const saved = await saveCanvas();
    if (saved && saved._id) {
      // Sync URL parameter so browser refresh preserves the canvas
      window.history.replaceState(null, '', `/?id=${saved._id}`);
      showToast('Canvas saved successfully');
    }
  };

  // Handle New Canvas
  const handleNewCanvas = () => {
    createNewCanvas();
    window.history.replaceState(null, '', '/');
    showToast('Created new canvas');
  };

  // Handle Load Canvas from modal
  const handleLoadCanvas = async (id: string) => {
    try {
      const res = await api.getCanvasById(id);
      if (res.success && res.data) {
        loadCanvas(res.data._id || id, res.data.name, res.data.shapes);
        window.history.replaceState(null, '', `/?id=${id}`);
        showToast(`Loaded "${res.data.name}"`);
      } else {
        alert(res.error || 'Failed to load canvas');
      }
    } catch (err: any) {
      alert(err.message || 'Error loading canvas');
    }
  };

  // Handle active canvas deletion
  const handleActiveCanvasDeleted = () => {
    createNewCanvas();
    window.history.replaceState(null, '', '/');
    showToast('Active canvas deleted');
  };

  // Global Keyboard Shortcuts (Delete, Undo, Redo, Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          deleteShape();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteShape, undo, redo, canUndo, canRedo, handleManualSave]);

  // Export canvas as PNG
  const handleExportPng = async () => {
    const stage = stageRef.current;
    if (!stage) {
      alert('Canvas stage is not ready for export');
      return;
    }

    try {
      // Temporarily hide transformer selection handles so they are not included in export
      const transformer = stage.findOne('Transformer');
      const wasVisible = transformer ? transformer.visible() : false;
      if (transformer) {
        transformer.hide();
        stage.draw();
      }

      // Generate PNG data URL directly from the Konva stage
      const dataUrl = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2 });

      // Restore transformer visibility
      if (transformer && wasVisible) {
        transformer.show();
        stage.draw();
      }

      // Clean filename based on canvas name, sanitizing invalid characters
      const rawName = (canvasName || '').trim().replace(/[/\\:*?"<>|]/g, '').trim();
      const fileName = `${rawName || 'mini-design-canvas'}.png`;

      // Use File System Access API if supported to ensure exact filename preservation
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'PNG Image',
                accept: { 'image/png': ['.png'] }
              }
            ]
          });
          const writable = await handle.createWritable();
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          await writable.write(blob);
          await writable.close();
          showToast('PNG exported');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            return;
          }
        }
      }

      // Standard anchor download fallback
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('PNG exported');
    } catch (err: any) {
      alert('Error exporting PNG: ' + err.message);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f6f8fa] text-[#656d76]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0969da] mb-3" />
        <span className="text-xs font-mono">Initializing Mini Design Canvas...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f6f8fa]">
      {/* Top Application Toolbar */}
      <Toolbar
        onAddShape={addShape}
        onDeleteSelected={() => deleteShape()}
        hasSelected={Boolean(selectedId)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onBringForward={() => bringForward()}
        onSendBackward={() => sendBackward()}
        onBringToFront={() => bringToFront()}
        onSendToBack={() => sendToBack()}
        onExportPng={handleExportPng}
        onSave={handleManualSave}
        onOpenCanvasModal={() => setIsModalOpen(true)}
        onNewCanvas={handleNewCanvas}
        canvasName={canvasName}
        onCanvasNameChange={setCanvasName}
        autosaveStatus={autosaveStatus}
        currentUser={user}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area: Canvas in center, PropertyPanel on right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-[#1f2328] text-white text-xs px-3 py-1.5 rounded-full shadow-lg transition-all animate-fade">
            {toastMessage}
          </div>
        )}

        {/* Canvas Area */}
        <main className="flex-1 flex flex-col items-center justify-center bg-[#f6f8fa] p-4 overflow-auto">
          {errorMessage && (
            <div className="mb-3 px-3.5 py-1.5 bg-[#ffebe9] border border-[#ff8182]/40 rounded text-xs text-[#cf222e] flex items-center justify-between gap-4 shadow-sm">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <CanvasStage
            stageRef={stageRef}
            shapes={shapes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateLive={updateShapeLive}
            onEndInteraction={endInteraction}
            width={960}
            height={640}
          />
        </main>

        {/* Right Property Inspector Panel */}
        <PropertyPanel
          selectedShape={selectedShape}
          onUpdateProperties={updateShapeProperties}
        />
      </div>

      {/* Saved Canvases Modal */}
      <CanvasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoadCanvas={handleLoadCanvas}
        onDeleteActiveCanvas={handleActiveCanvasDeleted}
        currentCanvasId={canvasId}
      />
    </div>
  );
}
