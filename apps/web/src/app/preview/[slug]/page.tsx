'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface BuilderNode {
  id: string;
  type: string;
  tag: string;
  content: string;
  styles: Record<string, string>;
  children: BuilderNode[];
}

export default function PreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any>(null);
  const [content, setContent] = useState<BuilderNode[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api.getPublishedPage(slug)
      .then((data) => {
        setPage(data.page);
        setContent(data.content as BuilderNode[] || null);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  const renderNode = (node: BuilderNode): React.ReactNode => {
    if (node.tag === 'hr') return <hr key={node.id} style={node.styles} />;
    if (node.tag === 'img') return <img key={node.id} style={node.styles} src={node.content} alt="" />;

    const Tag = (node.tag || 'div') as keyof JSX.IntrinsicElements;
    return (
      <Tag key={node.id} style={node.styles as any}>
        {node.content}
        {node.children?.map(renderNode)}
      </Tag>
    );
  };

  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1><p className="text-gray-500">{error}</p></div></div>;
  if (!content) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <html>
      <head>
        <title>{page?.seoTitle || page?.title || 'Page'}</title>
        {page?.seoDesc && <meta name="description" content={page.seoDesc} />}
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {Array.isArray(content) ? content.map(renderNode) : <p>No content</p>}
      </body>
    </html>
  );
}
