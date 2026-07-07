import { BaseFrameworkAdapter, FileManifest, AdapterSupportResult, AnalysisContext, RouteDefinition, LayoutDefinition, ComponentDefinition, DesignToken, EditableRegion, CanonicalNode, PatchRequest, PatchBundle, ValidationResult } from '@omnibuilder/adapter-core';

export class NextjsAdapter extends BaseFrameworkAdapter {
  key = 'nextjs';
  displayName = 'Next.js';
  supportedExtensions = ['.tsx', '.jsx', '.ts', '.js'];

  async detect(manifest: FileManifest): Promise<AdapterSupportResult> {
    try {
      const content = await this.readFile(manifest.projectPath, 'package.json');
      const pkg = JSON.parse(content);
      if (pkg.dependencies?.['next']) return { supported: true, confidence: 0.99, evidence: ['next in deps'] };
    } catch {}
    return { supported: false, confidence: 0, evidence: [] };
  }

  async extractRoutes(ctx: AnalysisContext): Promise<RouteDefinition[]> {
    const routes: RouteDefinition[] = [];
    const appPages = ctx.files.filter(f => f.path.match(/^app\/.*page\.(tsx?|jsx?)$/));
    for (const file of appPages) {
      const routePath = '/' + file.path.replace(/^app\//, '').replace(/\/page\.(tsx?|jsx?)$/, '').replace(/\(.*?\)\//g, '');
      routes.push({ path: routePath || '/', name: routePath.split('/').pop() || 'home', method: 'GET', sourceFileId: file.id, sourceFilePath: file.path, isDynamic: routePath.includes('['), params: [], metadata: { router: 'app' } });
    }
    return routes;
  }

  async extractLayouts(ctx: AnalysisContext): Promise<LayoutDefinition[]> {
    return ctx.files.filter(f => f.path.match(/^app\/.*layout\.(tsx?|jsx?)$/)).map(f => ({
      name: f.path.replace(/^app\//, '').replace(/layout\.(tsx?|jsx?)$/, '') || 'RootLayout',
      sourceFileId: f.id, sourceFilePath: f.path, slots: ['children']
    }));
  }

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
