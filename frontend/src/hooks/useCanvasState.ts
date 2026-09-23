import { useState, useCallback, useRef, useEffect } from 'react';
import { Shape, RectShape, CircleShape, TextShape } from '../lib/types';
import { api } from '../lib/api';

export type AutosaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface HistoryState {
  past: Shape[][];
  present: Shape[];
  future: Shape[][];
}

export function useCanvasState(initialCanvasId: string | null = null) {
  const [canvasId, setCanvasId] = useState<string | null>(initialCanvasId);
  const [canvasName, setCanvasName] = useState<string>('Untitled Canvas');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // History state: double-stack approach
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: []
  });

  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References for debouncing autosave
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestShapesRef = useRef<Shape[]>(history.present);
  const latestCanvasIdRef = useRef<string | null>(canvasId);
  const latestCanvasNameRef = useRef<string>(canvasName);
  const isDraggingOrTransformingRef = useRef<boolean>(false);

  useEffect(() => {
    latestShapesRef.current = history.present;
  }, [history.present]);

  useEffect(() => {
    latestCanvasIdRef.current = canvasId;
  }, [canvasId]);

  useEffect(() => {
    latestCanvasNameRef.current = canvasName;
  }, [canvasName]);

  // Clear selection if selected element is removed from present shapes (e.g. undo/redo)
  useEffect(() => {
    if (selectedId && !history.present.some((s) => s.id === selectedId)) {
      setSelectedId(null);
    }
  }, [history.present, selectedId]);

  // Shapes getter
  const shapes = history.present;
  const selectedShape = shapes.find((s) => s.id === selectedId) || null;

  // Perform backend save
  const performSave = useCallback(async (nameToSave?: string, shapesToSave?: Shape[]) => {
    const currentName = nameToSave ?? latestCanvasNameRef.current;
    const currentShapes = shapesToSave ?? latestShapesRef.current;
    const currentId = latestCanvasIdRef.current;

    setAutosaveStatus('saving');
    try {
      if (currentId) {
        const res = await api.updateCanvas(currentId, currentName, currentShapes);
        if (res.success && res.data) {
          setAutosaveStatus('saved');
          return res.data;
        } else {
          setAutosaveStatus('error');
          setErrorMessage(res.error || 'Failed to update canvas');
          return null;
        }
      } else {
        const res = await api.createCanvas(currentName, currentShapes);
        if (res.success && res.data) {
          const newId = res.data._id || null;
          latestCanvasIdRef.current = newId;
          setCanvasId(newId);
          setAutosaveStatus('saved');
          return res.data;
        } else {
          setAutosaveStatus('error');
          setErrorMessage(res.error || 'Failed to save new canvas');
          return null;
        }
      }
    } catch (err: any) {
      setAutosaveStatus('error');
      setErrorMessage(err.message || 'Network error saving canvas');
      return null;
    }
  }, []);

  // Trigger debounced autosave (2 seconds of inactivity)
  const scheduleAutosave = useCallback(() => {
    setAutosaveStatus('unsaved');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      // Don't autosave mid-drag/transform
      if (!isDraggingOrTransformingRef.current) {
        performSave();
      }
    }, 2000);
  }, [performSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Commit a new immutable state to history
  const commitChange = useCallback(
    (newShapes: Shape[]) => {
      setHistory((prev) => ({
        past: [...prev.past, prev.present],
        present: newShapes,
        future: []
      }));
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  // Live update while dragging/transforming (bypasses history stack until commit)
  const updateShapeLive = useCallback((id: string, updates: Partial<Shape>) => {
    isDraggingOrTransformingRef.current = true;
    setHistory((prev) => ({
      ...prev,
      present: prev.present.map((s) => (s.id === id ? ({ ...s, ...updates } as Shape) : s))
    }));
  }, []);

  // Finalize drag or transform operation
  const endInteraction = useCallback(
    (id: string, finalUpdates: Partial<Shape>) => {
      isDraggingOrTransformingRef.current = false;
      setHistory((prev) => {
        const nextPresent = prev.present.map((s) =>
          s.id === id ? ({ ...s, ...finalUpdates } as Shape) : s
        );
        return {
          past: [...prev.past, prev.present],
          present: nextPresent,
          future: []
        };
      });
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  // Add shape
  const addShape = useCallback(
    (type: 'rect' | 'circle' | 'text') => {
      const id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      let newShape: Shape;

      // Position slightly offset from center
      const offsetX = 100 + (history.present.length % 8) * 20;
      const offsetY = 100 + (history.present.length % 8) * 20;

      if (type === 'rect') {
        newShape = {
          id,
          type: 'rect',
          x: offsetX,
          y: offsetY,
          width: 140,
          height: 90,
          rotation: 0,
          fill: '#3b82f6'
        } as RectShape;
      } else if (type === 'circle') {
        newShape = {
          id,
          type: 'circle',
          x: offsetX + 50,
          y: offsetY + 50,
          radius: 50,
          rotation: 0,
          fill: '#10b981'
        } as CircleShape;
      } else {
        newShape = {
          id,
          type: 'text',
          x: offsetX,
          y: offsetY,
          text: 'Double click to edit',
          fontSize: 22,
          rotation: 0,
          fill: '#f3f4f6'
        } as TextShape;
      }

      commitChange([...history.present, newShape]);
      setSelectedId(id);
    },
    [history.present, commitChange]
  );

  // Update shape properties directly (from PropertyPanel)
  const updateShapeProperties = useCallback(
    (id: string, updates: Partial<Shape>) => {
      const newShapes = history.present.map((s) =>
        s.id === id ? ({ ...s, ...updates } as Shape) : s
      );
      commitChange(newShapes);
    },
    [history.present, commitChange]
  );

  // Delete selected shape
  const deleteShape = useCallback(
    (idToDelete?: string) => {
      const targetId = typeof idToDelete === 'string' ? idToDelete : selectedId;
      if (!targetId) return;

      const newShapes = history.present.filter((s) => s.id !== targetId);
      commitChange(newShapes);
      if (selectedId === targetId) {
        setSelectedId(null);
      }
    },
    [selectedId, history.present, commitChange]
  );

  // Undo
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      };
    });
    scheduleAutosave();
  }, [scheduleAutosave]);

  // Redo
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
    scheduleAutosave();
  }, [scheduleAutosave]);

  // Layer Reordering
  const bringForward = useCallback(
    (id?: string) => {
      const targetId = id || selectedId;
      if (!targetId) return;
      const list = [...history.present];
      const idx = list.findIndex((s) => s.id === targetId);
      if (idx === -1 || idx === list.length - 1) return;

      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
      commitChange(list);
    },
    [selectedId, history.present, commitChange]
  );

  const sendBackward = useCallback(
    (id?: string) => {
      const targetId = id || selectedId;
      if (!targetId) return;
      const list = [...history.present];
      const idx = list.findIndex((s) => s.id === targetId);
      if (idx <= 0) return;

      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
      commitChange(list);
    },
    [selectedId, history.present, commitChange]
  );

  const bringToFront = useCallback(
    (id?: string) => {
      const targetId = id || selectedId;
      if (!targetId) return;
      const list = [...history.present];
      const idx = list.findIndex((s) => s.id === targetId);
      if (idx === -1 || idx === list.length - 1) return;

      const [target] = list.splice(idx, 1);
      list.push(target);
      commitChange(list);
    },
    [selectedId, history.present, commitChange]
  );

  const sendToBack = useCallback(
    (id?: string) => {
      const targetId = id || selectedId;
      if (!targetId) return;
      const list = [...history.present];
      const idx = list.findIndex((s) => s.id === targetId);
      if (idx <= 0) return;

      const [target] = list.splice(idx, 1);
      list.unshift(target);
      commitChange(list);
    },
    [selectedId, history.present, commitChange]
  );

  // Load a canvas
  const loadCanvas = useCallback((id: string, name: string, loadedShapes: Shape[]) => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    latestCanvasIdRef.current = id;
    latestCanvasNameRef.current = name;
    latestShapesRef.current = loadedShapes;

    setCanvasId(id);
    setCanvasName(name);
    setSelectedId(null);
    setHistory({
      past: [],
      present: loadedShapes,
      future: []
    });
    setAutosaveStatus('saved');
    setErrorMessage(null);
  }, []);

  // Create a new blank canvas
  const createNewCanvas = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    latestCanvasIdRef.current = null;
    latestCanvasNameRef.current = 'Untitled Canvas';
    latestShapesRef.current = [];

    setCanvasId(null);
    setCanvasName('Untitled Canvas');
    setSelectedId(null);
    setHistory({
      past: [],
      present: [],
      future: []
    });
    setAutosaveStatus('saved');
    setErrorMessage(null);
  }, []);

  // Update canvas name and schedule autosave
  const handleSetCanvasName = useCallback(
    (name: string) => {
      latestCanvasNameRef.current = name;
      setCanvasName(name);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  return {
    canvasId,
    canvasName,
    setCanvasName: handleSetCanvasName,
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
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    saveCanvas: performSave,
    loadCanvas,
    createNewCanvas,
    autosaveStatus,
    errorMessage,
    setErrorMessage
  };
}
