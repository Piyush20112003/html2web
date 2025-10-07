'use client'

import Editor from '@monaco-editor/react'

interface MonacoEditorProps {
  language: 'html' | 'markdown' | 'javascript' | 'typescript' | 'css'
  value: string
  onChange: (value: string) => void
  height?: string
  theme?: 'light' | 'dark'
  options?: any
}

export default function MonacoEditor({
  language,
  value,
  onChange,
  height = '400px',
  theme = 'light',
  options = {}
}: MonacoEditorProps) {
  const handleChange = (value: string | undefined) => {
    onChange(value || '')
  }

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={handleChange}
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        tabSize: 2,
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          useShadows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10
        },
        ...options
      }}
      loading={
        <div
          style={{ height, width: '100%' }}
          className="flex items-center justify-center bg-gray-50"
        >
          <div className="text-gray-500">加载编辑器...</div>
        </div>
      }
    />
  )
}
