// ============================================================
// OmniBuilder Adapter Core — Interfaces and Base Classes
// ============================================================

export interface FileManifest {
  projectId: string;
  projectPath: string;
  files: FileEntry[];
}

export interface FileEntry {
  id: string;
  path: string;
  extension: string;
  category: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  isBinary: boolean;
}

export interface AdapterSupportResult {
  supported: boolean;
  confidence: number;
  evidence: string[];
}

export interface AnalysisContext {
  projectId: string;
  projectPath: string;
  files: FileEntry[];
  framework: string;
}

export interface RouteDefinition {
  path: string;
  name: string;
  method: string;
  sourceFileId: string;
  sourceFilePath: string;
  isDynamic: boolean;
  params: string[];
  metadata: Record<string, any>;
}

export interface LayoutDefinition {
  name: string;
  sourceFileId: string;
  sourceFilePath: string;
  slots: string[];
  parentLayoutName?: string;
}

export interface ComponentDefinition {
  name: string;
  key: string;
  sourceFileId: string;
  sourceFilePath: string;
  componentType: string;
  props: PropDefinition[];
  slots: string[];
  usageCount: number;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

export interface EditableRegion {
  nodeId: string;
  type: 'text' | 'image' | 'link' | 'list' | 'component' | 'slot';
  sourceMap: SourceMap;
  currentValue: any;
  constraints?: any;
}

export interface SourceMap {
  fileId: string;
  filePath: string;
  startLine: number;
  endLine: number;
  startCol: number;
  endCol: number;
  astPath?: string;
}

export interface DesignToken {
  type: 'color' | 'spacing' | 'typography' | 'radius' | 'shadow' | 'breakpoint';
  name: string;
  value: string;
  source: string;
}

export interface CanonicalNode {
  id: string;
  type: string;
  tag: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  children: CanonicalNode[];
  sourceMap: SourceMap;
  editable: boolean;
  bindings: Record<string, any>;
}

export interface BuilderCommand {
  type: string;
  nodeId?: string;
  pageId?: string;
  payload: Record<string, any>;
}

export interface PatchRequest {
  projectId: string;
  command: BuilderCommand;
  targetFile: FileEntry;
  currentContent: string;
  framework: string;
}

export interface PatchBundle {
  filePatches: FilePatchItem[];
  newFiles: NewFileItem[];
  deletedFiles: string[];
  buildValidation: boolean;
}

export interface FilePatchItem {
  filePath: string;
  patchType: 'ast' | 'text' | 'template' | 'style';
  operations: PatchOperation[];
}

export interface PatchOperation {
  type: 'replace' | 'insert' | 'delete' | 'wrap' | 'unwrap' | 'move';
  target: SourceMap | string;
  content?: string;
  position?: 'before' | 'after' | 'inside-start' | 'inside-end';
}

export interface NewFileItem {
  filePath: string;
  content: string;
  category: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export abstract class BaseFrameworkAdapter {
  abstract key: string;
  abstract displayName: string;
  abstract supportedExtensions: string[];

  abstract detect(manifest: FileManifest): Promise<AdapterSupportResult>;
  abstract extractRoutes(ctx: AnalysisContext): Promise<RouteDefinition[]>;
  abstract extractLayouts(ctx: AnalysisContext): Promise<LayoutDefinition[]>;
  abstract extractComponents(ctx: AnalysisContext): Promise<ComponentDefinition[]>;
  abstract extractDesignTokens(ctx: AnalysisContext): Promise<DesignToken[]>;
  abstract identifyEditableRegions(ctx: AnalysisContext, filePath: string): Promise<EditableRegion[]>;
  abstract buildCanonicalTree(ctx: AnalysisContext, filePath: string): Promise<CanonicalNode[]>;
  abstract generatePatch(request: PatchRequest): Promise<PatchBundle>;
  abstract validateBuild(ctx: AnalysisContext): Promise<ValidationResult>;

  protected async readFile(projectPath: string, filePath: string): Promise<string> {
    const fs = require('fs/promises');
    const path = require('path');
    return fs.readFile(path.join(projectPath, filePath), 'utf-8');
  }
}
