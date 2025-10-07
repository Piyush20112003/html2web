/**
 * 安全的剪贴板操作工具
 * 提供降级方案，确保在各种环境下都能正常工作
 */

/**
 * 安全地复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否成功复制
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return false
  }

  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // 降级方案：使用 document.execCommand
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

/**
 * 检查剪贴板 API 是否可用
 * @returns boolean
 */
export function isClipboardAvailable(): boolean {
  return typeof window !== 'undefined' && 
         (navigator.clipboard || document.queryCommandSupported?.('copy'))
}