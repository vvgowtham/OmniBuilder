export type ProjectStatus = 'created' | 'importing' | 'analyzing' | 'ready' | 'error';
export type PageStatus = 'draft' | 'published' | 'archived';
export type ImportKind = 'url' | 'git' | 'zip' | 'ftp' | 'folder';
export type NodeType = 'block' | 'slot' | 'text' | 'image' | 'form' | 'loop' | 'condition' | 'raw';
export type ChangeSetStatus = 'draft' | 'applied' | 'failed' | 'rolled_back';
export type DeploymentStatus = 'queued' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back';

export interface User { id: string; email: string; fullName: string; avatarUrl?: string; }
export interface Project { id: string; name: string; slug: string; status: ProjectStatus; detectedFramework?: string; detectedRuntime?: string; detectedLanguage?: string; }
export interface Page { id: string; projectId: string; title: string; slug: string; status: PageStatus; }
export interface MediaAsset { id: string; projectId: string; fileName: string; mimeType: string; storageKey: string; sizeBytes: number; }
export interface Component { id: string; projectId: string; name: string; key: string; componentType: string; }
export interface Route { id: string; projectId: string; path: string; method: string; pageId?: string; }
