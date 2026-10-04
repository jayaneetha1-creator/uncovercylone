'use client';

import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Layers } from 'lucide-react';

interface FileNode {
  name: string;
  description: string;
  type: 'directory' | 'file';
  children?: FileNode[];
}

function FileTreeNode({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const isDirectory = node.type === 'directory';

  return (
    <div className="select-none text-xs">
      <div
        onClick={() => isDirectory && setIsOpen(!isOpen)}
        className={`flex items-start gap-2 py-1.5 px-2 rounded-xl transition-colors cursor-pointer hover:bg-[#F5FAFF] ${
          level > 0 ? 'ml-4 sm:ml-6' : ''
        }`}
      >
        {isDirectory ? (
          <div className="flex items-center gap-1.5 text-[#38A9F0] mt-0.5">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Folder className="w-4 h-4 fill-[#38A9F0]/20" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#5B7385] mt-0.5 ml-5">
            <File className="w-3.5 h-3.5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-mono ${isDirectory ? 'font-bold text-[#0F2A3D]' : 'font-medium text-[#5B7385]'}`}>
              {node.name}
            </span>
          </div>
          {node.description && (
            <p className="text-[11px] text-[#5B7385] mt-0.5 line-clamp-1">{node.description}</p>
          )}
        </div>
      </div>

      {isDirectory && isOpen && node.children && (
        <div className="border-l border-[#DCE8F2]/70 ml-3.5">
          {node.children.map((child, idx) => (
            <FileTreeNode key={`${child.name}-${idx}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileMapTab() {
  const [fileMap, setFileMap] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/file-map')
      .then((res) => (res.ok ? res.json() : { fileMap: null }))
      .then((data) => setFileMap(data.fileMap))
      .catch((err) => console.error('Failed to load file map:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-[#0F2A3D]">Project File Map</h2>
        </div>
        <p className="text-xs text-[#5B7385] mt-1">
          Read-only architectural overview of the project directory structure with plain-English component descriptions.
          Environment secrets (.env) and internal build caches are automatically hidden.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#5B7385]">Loading project architecture...</div>
        ) : fileMap ? (
          <div className="max-w-4xl overflow-x-auto">
            <FileTreeNode node={fileMap} level={0} />
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-rose-600">
            Failed to load FILE_MAP.json. Please check if the file exists in docs/.
          </div>
        )}
      </div>
    </div>
  );
}
