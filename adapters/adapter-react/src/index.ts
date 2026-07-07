import { BaseFrameworkAdapter, FileManifest, AdapterSupportResult, AnalysisContext, RouteDefinition, LayoutDefinition, ComponentDefinition, DesignToken, EditableRegion, CanonicalNode, PatchRequest, PatchBundle, ValidationResult } from '@omnibuilder/adapter-core';

export class ReactAdapter extends BaseFrameworkAdapter {
  key = 'react';
  displayName = 'React';
  supportedExtensions = ['.tsx', '.jsx', '.ts', '.js'];

  async detect(manifest: FileManifest): Promise<AdapterSupportResult> {
    const hasPkg = manifest.files.some(f => f.path === 'package.json');
    if (hasPkg) {
      const content = await this.readFile(manifest.projectPath, 'package.json');
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['react'] && !deps['next']) return { supported: true, confidence: 0.95, evidence: ['react in deps'] };
    }
    return { supported: false, confidence: 0, evidence: [] };
  }

  async extractRoutes(ctx: AnalysisContext): Promise<RouteDefinition[]> {
    return ctx.files.filter(f => f.path.match(/src\/(pages|views)\/.*\.(tsx|jsx)$/)).map(f => ({
      path: '/' + (f.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || ''),
      name: f.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || 'page',
      method: 'GET', sourceFileId: f.id, sourceFilePath: f.path, isDynamic: false, params: [], metadata: {}
    }));
  }

  async extractLayouts(ctx: AnalysisContext): Promise<LayoutDefinition[]> { return []; }
  async extractComponents(ctx: AnalysisContext): Promise<ComponentDefinition[]> {
    return ctx.files.filter(f => f.path.includes('components/')).map(f => ({
      name: f.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || 'Component',
      key: (f.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || '').toLowerCase(),
      sourceFileId: f.id, sourceFilePath: f.path, componentType: 'ui', props: [], slots: ['children'], usageCount: 0
    }));
  }
  async extractDesignTokens(ctx: AnalysisContext): Promise<DesignToken[]> { return []; }
  async identifyEditableRegions(ctx: AnalysisContext, filePath: string): Promise<EditableRegion[]> { return []; }
  async buildCanonicalTree(ctx: AnalysisContext, filePath: string): Promise<CanonicalNode[]> { return []; }
  async generatePatch(request: PatchRequest): Promise<PatchBundle> { return { filePatches: [], newFiles: [], deletedFiles: [], buildValidation: true }; }
  async validateBuild(ctx: AnalysisContext): Promise<ValidationResult> { return { valid: true, errors: [], warnings: [] }; }
}
