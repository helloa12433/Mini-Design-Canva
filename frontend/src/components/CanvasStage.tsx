'use client';

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Shape, RectShape, CircleShape, TextShape } from '../lib/types';

interface CanvasStageProps {
  shapes: Shape[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLive: (id: string, updates: Partial<Shape>) => void;
  onEndInteraction: (id: string, finalUpdates: Partial<Shape>) => void;
  stageRef: React.RefObject<Konva.Stage>;
  width?: number;
  height?: number;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  shapes,
  selectedId,
  onSelect,
  onUpdateLive,
  onEndInteraction,
  stageRef,
  width = 960,
  height = 640
}) => {
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach Transformer dynamically to the selected shape
  useEffect(() => {
    if (!transformerRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;

    if (selectedId) {
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
        return;
      }
    }
    transformerRef.current.nodes([]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedId, shapes, stageRef]);

  // Click on stage background deselects
  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'canvas-bg';
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  return (
    <div className="canvas-wrapper relative flex items-center justify-center bg-[#eaeef2] overflow-hidden p-8 rounded-lg border border-[#d0d7de] select-none shadow-sm">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        className="canvas-stage bg-white border border-[#d0d7de] rounded shadow-lg"
      >
        <Layer>
          {/* Base white background rect so stage is solid white and exports cleanly */}
          <Rect
            name="canvas-bg"
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#ffffff"
            listening={true}
          />

          {shapes.map((shape) => {
            if (shape.type === 'rect') {
              const rect = shape as RectShape;
              return (
                <Rect
                  key={rect.id}
                  id={rect.id}
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  rotation={rect.rotation || 0}
                  fill={rect.fill}
                  draggable
                  onClick={() => onSelect(rect.id)}
                  onTap={() => onSelect(rect.id)}
                  onDragMove={(e) => {
                    onUpdateLive(rect.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
                  }}
                  onDragEnd={(e) => {
                    onEndInteraction(rect.id, {
                      x: Math.round(e.target.x()),
                      y: Math.round(e.target.y())
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    const newWidth = Math.max(10, Math.round(node.width() * scaleX));
                    const newHeight = Math.max(10, Math.round(node.height() * scaleY));

                    onEndInteraction(rect.id, {
                      x: Math.round(node.x()),
                      y: Math.round(node.y()),
                      width: newWidth,
                      height: newHeight,
                      rotation: Math.round(node.rotation())
                    });
                  }}
                />
              );
            }

            if (shape.type === 'circle') {
              const circle = shape as CircleShape;
              return (
                <Circle
                  key={circle.id}
                  id={circle.id}
                  x={circle.x}
                  y={circle.y}
                  radius={circle.radius}
                  rotation={circle.rotation || 0}
                  fill={circle.fill}
                  draggable
                  onClick={() => onSelect(circle.id)}
                  onTap={() => onSelect(circle.id)}
                  onDragMove={(e) => {
                    onUpdateLive(circle.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
                  }}
                  onDragEnd={(e) => {
                    onEndInteraction(circle.id, {
                      x: Math.round(e.target.x()),
                      y: Math.round(e.target.y())
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);

                    const newRadius = Math.max(5, Math.round(circle.radius * scaleX));

                    onEndInteraction(circle.id, {
                      x: Math.round(node.x()),
                      y: Math.round(node.y()),
                      radius: newRadius,
                      rotation: Math.round(node.rotation())
                    });
                  }}
                />
              );
            }

            if (shape.type === 'text') {
              const textShape = shape as TextShape;
              return (
                <Text
                  key={textShape.id}
                  id={textShape.id}
                  x={textShape.x}
                  y={textShape.y}
                  text={textShape.text}
                  fontSize={textShape.fontSize || 22}
                  rotation={textShape.rotation || 0}
                  fill={textShape.fill}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  draggable
                  onClick={() => onSelect(textShape.id)}
                  onTap={() => onSelect(textShape.id)}
                  onDragMove={(e) => {
                    onUpdateLive(textShape.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
                  }}
                  onDragEnd={(e) => {
                    onEndInteraction(textShape.id, {
                      x: Math.round(e.target.x()),
                      y: Math.round(e.target.y())
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);

                    const newFontSize = Math.max(8, Math.round((textShape.fontSize || 22) * scaleX));

                    onEndInteraction(textShape.id, {
                      x: Math.round(node.x()),
                      y: Math.round(node.y()),
                      fontSize: newFontSize,
                      rotation: Math.round(node.rotation())
                    });
                  }}
                />
              );
            }

            return null;
          })}

          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                return oldBox;
              }
              return newBox;
            }}
            borderStroke="#0969da"
            borderDash={[4, 4]}
            anchorStroke="#0969da"
            anchorFill="#ffffff"
            anchorSize={9}
            anchorCornerRadius={2}
          />
        </Layer>
      </Stage>
    </div>
  );
};
