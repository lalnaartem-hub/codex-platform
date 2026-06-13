import React, { useState, useRef, useEffect } from 'react';

export const ResizableSplitter = ({ 
  left, 
  right, 
  direction = 'horizontal', 
  initialSplit = 50, 
  minSize = 20, 
  maxSize = 80 
}) => {
  const [split, setSplit] = useState(initialSplit);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      let newSplit;

      if (direction === 'horizontal') {
        const relativeX = e.clientX - containerRect.left;
        newSplit = (relativeX / containerRect.width) * 100;
      } else {
        const relativeY = e.clientY - containerRect.top;
        newSplit = (relativeY / containerRect.height) * 100;
      }

      // Ограничения размеров
      if (newSplit >= minSize && newSplit <= maxSize) {
        setSplit(newSplit);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Поддержка сенсорных экранов
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing, direction, minSize, maxSize]);

  const isHor = direction === 'horizontal';

  return (
    <div 
      ref={containerRef}
      className="resizable-splitter-container"
      style={{
        display: 'flex',
        flexDirection: isHor ? 'row' : 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Маска для предотвращения перехвата событий мыши фреймами (iframe) */}
      {isResizing && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: isHor ? 'col-resize' : 'row-resize',
            backgroundColor: 'transparent'
          }}
        />
      )}

      {/* Левая / Верхняя панель */}
      <div 
        className="resizable-panel slot-left"
        style={{
          width: isHor ? `${split}%` : '100%',
          height: isHor ? '100%' : `${split}%`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {left}
      </div>

      {/* Линия-разделитель */}
      <div 
        onMouseDown={startResize}
        onTouchStart={startResize}
        className={`panel-resizer ${isResizing ? 'resizing' : ''}`}
        style={{
          width: isHor ? '6px' : '100%',
          height: isHor ? '100%' : '6px',
          cursor: isHor ? 'col-resize' : 'row-resize',
          flexShrink: 0
        }}
      />

      {/* Правая / Нижня панель */}
      <div 
        className="resizable-panel slot-right"
        style={{
          width: isHor ? `${100 - split}%` : '100%',
          height: isHor ? '100%' : `${100 - split}%`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {right}
      </div>
    </div>
  );
};
