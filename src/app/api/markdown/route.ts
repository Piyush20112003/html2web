import { NextRequest, NextResponse } from 'next/server'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

interface MarkdownRequest {
  markdown: string
  options?: {
    enableGfm?: boolean
    enableHighlight?: boolean
    wrapper?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MarkdownRequest = await request.json()
    const { markdown, options = {} } = body

    if (!markdown || markdown.trim().length === 0) {
      return NextResponse.json(
        { error: 'Markdown 内容不能为空' },
        { status: 400 }
      )
    }

    const {
      enableGfm = true,
      enableHighlight = true,
      wrapper = true
    } = options

    // 构建处理管道
    const processor = remark()
    
    if (enableGfm) {
      processor.use(remarkGfm)
    }
    
    processor.use(remarkRehype, { allowDangerousHtml: true })
    
    if (enableHighlight) {
      processor.use(rehypeHighlight)
    }
    
    processor.use(rehypeStringify, { allowDangerousHtml: true })

    const result = await processor.process(markdown)
    let html = result.toString()

    // 如果需要包装器
    if (wrapper) {
      html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 100%;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        .markdown-body h1 {
            font-size: 2em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
        }
        .markdown-body h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
        }
        .markdown-body h3 {
            font-size: 1.25em;
        }
        .markdown-body p {
            margin-bottom: 16px;
        }
        .markdown-body code {
            background: #f6f8fa;
            border-radius: 3px;
            padding: 0.2em 0.4em;
            font-size: 85%;
        }
        .markdown-body pre {
            background: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow: auto;
            margin-bottom: 16px;
        }
        .markdown-body pre code {
            background: transparent;
            padding: 0;
            font-size: 100%;
        }
        .markdown-body blockquote {
            border-left: 4px solid #dfe2e5;
            padding: 0 16px;
            color: #6a737d;
            margin: 0 0 16px 0;
        }
        .markdown-body ul, .markdown-body ol {
            padding-left: 2em;
            margin-bottom: 16px;
        }
        .markdown-body li {
            margin-bottom: 0.25em;
        }
        .markdown-body table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        .markdown-body table th, .markdown-body table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
        .markdown-body table th {
            background: #f6f8fa;
            font-weight: 600;
        }
        .markdown-body table tr:nth-child(even) {
            background: #f8f8f8;
        }
        .markdown-body img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 16px 0;
        }
        .markdown-body a {
            color: #0366d6;
            text-decoration: none;
        }
        .markdown-body a:hover {
            text-decoration: underline;
        }
        .markdown-body hr {
            border: none;
            border-top: 1px solid #eaecef;
            height: 1px;
            margin: 24px 0;
        }
        /* 代码高亮样式 */
        .hljs {
            background: #f6f8fa !important;
            color: #24292e;
        }
        .hljs-comment,
        .hljs-quote {
            color: #6a737d;
            font-style: italic;
        }
        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-subst {
            color: #d73a49;
        }
        .hljs-number,
        .hljs-literal,
        .hljs-variable,
        .hljs-template-variable,
        .hljs-tag .hljs-attr {
            color: #005cc5;
        }
        .hljs-string,
        .hljs-doctag {
            color: #032f62;
        }
        .hljs-title,
        .hljs-section,
        .hljs-selector-id {
            color: #6f42c1;
            font-weight: bold;
        }
        .hljs-type,
        .hljs-class .hljs-title {
            color: #6f42c1;
        }
        .hljs-tag,
        .hljs-name,
        .hljs-attribute {
            color: #22863a;
            font-weight: normal;
        }
        .hljs-regexp,
        .hljs-link {
            color: #e36209;
        }
        .hljs-symbol,
        .hljs-bullet {
            color: #005cc5;
        }
        .hljs-built_in,
        .hljs-builtin-name {
            color: #005cc5;
        }
        .hljs-meta {
            color: #6f42c1;
        }
        .hljs-deletion {
            background: #ffeef0;
        }
        .hljs-addition {
            background: #f0fff4;
        }
        .hljs-emphasis {
            font-style: italic;
        }
        .hljs-strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="markdown-body">
        ${html}
    </div>
</body>
</html>`
    }

    return NextResponse.json({
      html: html,
      markdown: markdown,
      options: options,
      message: 'Markdown 转换成功'
    })

  } catch (error) {
    console.error('Markdown conversion error:', error)
    return NextResponse.json(
      { error: 'Markdown 转换失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Markdown 转换 API',
    usage: {
      method: 'POST',
      body: {
        markdown: 'string (required)',
        options: {
          enableGfm: 'boolean (default: true)',
          enableHighlight: 'boolean (default: true)',
          wrapper: 'boolean (default: true)'
        }
      },
      example: {
        markdown: '# Hello World\\n\\nThis is **bold** text.',
        options: {
          enableGfm: true,
          enableHighlight: true,
          wrapper: true
        }
      }
    }
  })
}