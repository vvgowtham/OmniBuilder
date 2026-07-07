import { BaseFrameworkAdapter, FileManifest, AdapterSupportResult, AnalysisContext, RouteDefinition, LayoutDefinition, ComponentDefinition, DesignToken, EditableRegion, CanonicalNode, PatchRequest, PatchBundle, ValidationResult } from '@omnibuilder/adapter-core';

export class StaticHTMLAdapter extends BaseFrameworkAdapter {
  key = 'html';
  displayName = 'Static HTML';
  supportedExtensions = ['.html', '.css', '.js'];

  async detect(manifest: FileManifest): Promise<AdapterSupportResult> {
    const hasHtml = manifest.files.some(f => f.path === 'index.html');
    return { supported: hasHtml, confidence: hasHtml ? 0.7 : 0, evidence: hasHtml ? ['index.html found'] : [] };
  }

  async extractRoutes(ctx: AnalysisContext): Promise<RouteDefinition[]> {
    return ctx.files.filter(f => f.extension === '.html').map(f => ({
      path: '/' + f.path.replace('.html', '').replace('index', ''),
      name: f.path.replace('.html', ''),
      method: 'GET', sourceFileId: f.id, sourceFilePath: f.path, isDynamic: false, params: [], metadata: {}
    }));
  }

  async extractLayouts(ctx: AnalysisContext): Promise<LayoutDefinition[]> { return []; }
  async extractComponents(ctx: AnalysisContext): Promise<ComponentDefinition[]> { return []; }
  async extractDesignTokens(ctx: AnalysisContext): Promise<DesignToken[]> { return []; }
  async identifyEditableRegions(ctx: AnalysisContext, filePath: string): Promise<EditableRegion[]> { return []; }
  async buildCanonicalTree(ctx: AnalysisContext, filePath: string): Promise<CanonicalNode[]> { return []; }
  async generatePatch(request: PatchRequest): Promise<PatchBundle> { return { filePatches: [], newFiles: [], deletedFiles: [], buildValidation: true }; }
  async validateBuild(ctx: AnalysisContext): Promise<ValidationResult> { return { valid: true, errors: [], warnings: [] }; }
}
