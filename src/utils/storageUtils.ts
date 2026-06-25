// 存储工具 - 处理 IndexedDB 配额和降级方案

export interface StorageInfo {
  quota: number
  usage: number
  percentage: number
  isLow: boolean
}

// 检查 IndexedDB 存储配额
export async function checkStorageQuota(): Promise<StorageInfo> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const quota = estimate.quota || 0
    const usage = estimate.usage || 0
    const percentage = quota > 0 ? (usage / quota) * 100 : 0
    
    return {
      quota,
      usage,
      percentage,
      isLow: percentage > 80
    }
  }
  
  // 降级方案：使用 localStorage 检测
  const used = JSON.stringify(localStorage).length * 2 // UTF-16
  return {
    quota: 5 * 1024 * 1024, // 假设 5MB
    usage: used,
    percentage: (used / (5 * 1024 * 1024)) * 100,
    isLow: false
  }
}

// 检查是否为 HTTPS 环境
export function isHTTPS(): boolean {
  return window.location.protocol === 'https:'
}

// 检查是否支持所需功能
export function checkFeatureSupport() {
  return {
    indexedDB: 'indexedDB' in window,
    serviceWorker: 'serviceWorker' in navigator,
    https: isHTTPS(),
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window,
    notifications: 'Notification' in window
  }
}

// 显示功能不支持提示
export function showFeatureWarning(features: ReturnType<typeof checkFeatureSupport>) {
  const warnings: string[] = []
  
  if (!features.https) {
    warnings.push('当前不是 HTTPS 环境，摄像头、麦克风等功能可能受限')
  }
  
  if (!features.indexedDB) {
    warnings.push('浏览器不支持 IndexedDB，数据将无法持久化')
  }
  
  if (!features.serviceWorker) {
    warnings.push('浏览器不支持 Service Worker，离线功能不可用')
  }
  
  if (!features.camera) {
    warnings.push('浏览器不支持摄像头访问')
  }
  
  if (!features.microphone) {
    warnings.push('浏览器不支持麦克风访问')
  }
  
  if (!features.speechRecognition) {
    warnings.push('浏览器不支持语音识别')
  }
  
  if (!features.notifications) {
    warnings.push('浏览器不支持系统通知')
  }
  
  if (warnings.length > 0) {
    console.warn('功能限制:', warnings)
    return warnings
  }
  
  return []
}

// 请求通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      return true
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
  }
  
  return false
}

// 清理旧数据以释放空间
export async function cleanupOldData() {
  const storageInfo = await checkStorageQuota()
  
  if (storageInfo.isLow) {
    console.warn('存储空间不足，建议清理旧数据')
    // 可以在这里添加自动清理逻辑
  }
  
  return storageInfo
}
