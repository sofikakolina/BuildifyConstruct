'use client';

import { useEffect, useRef } from 'react';
import { IfcViewerAPI } from 'web-ifc-viewer';

type IFCViewerProps = {
  filePath: string;
};

const IFCViewer = ({ filePath }: IFCViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Initialize the viewer
    const container = viewerRef.current;
    const viewer = new IfcViewerAPI({ container });

    // Set up the viewer
    viewer.axes.setAxes();
    viewer.grid.setGrid();
    viewer.IFC.setWasmPath('wasm/'); // Ensure the WASM files are accessible

    // Load the IFC file
    viewer.IFC.loadIfcUrl(filePath)
      .then((model) => {
        console.log('IFC file loaded successfully:', model);
      })
      .catch((error) => {
        console.error('Error loading IFC file:', error);
      });

    // Cleanup
    return () => {
      viewer.dispose();
    };
  }, [filePath]);

  return <div ref={viewerRef} style={{ width: '100%', height: '500px' }} />;
};

export default IFCViewer;