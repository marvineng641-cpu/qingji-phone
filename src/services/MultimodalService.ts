// 多模态服务 - 处理语音、图片、摄像头等多模态输入输出

export interface VoiceInputOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

export interface ImageRecognitionResult {
  labels: string[]
  confidence: number
  description?: string
}

export interface ImageGenerationOptions {
  prompt: string
  style?: 'realistic' | 'anime' | 'painting' | 'sketch'
  size?: '256x256' | '512x512' | '1024x1024'
}

class MultimodalService {
  private recognition: any = null
  private isListening: boolean = false
  private mediaStream: MediaStream | null = null
  private videoElement: HTMLVideoElement | null = null

  // 语音识别
  async initVoiceRecognition(options: VoiceInputOptions = {}) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('浏览器不支持语音识别')
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.recognition.lang = options.language || 'zh-CN'
    this.recognition.continuous = options.continuous || false
    this.recognition.interimResults = options.interimResults || true

    return this.recognition
  }

  startVoiceRecognition(onResult: (transcript: string, isFinal: boolean) => void, onError?: (error: any) => void) {
    if (!this.recognition) {
      throw new Error('语音识别未初始化')
    }

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      onResult(transcript, result.isFinal)
    }

    this.recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
      this.isListening = false
      if (onError) onError(event)
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    this.recognition.start()
    this.isListening = true
  }

  stopVoiceRecognition() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getVoiceRecognitionStatus() {
    return this.isListening
  }

  // 语音合成（TTS）
  async speak(text: string, options: { lang?: string; rate?: number; pitch?: number } = {}) {
    if (!('speechSynthesis' in window)) {
      throw new Error('浏览器不支持语音合成')
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang || 'zh-CN'
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1

    window.speechSynthesis.speak(utterance)
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // 图片识别（使用浏览器内置 API 或外部服务）
  async recognizeImage(file: File): Promise<ImageRecognitionResult> {
    // 这里使用模拟实现，实际应用中可以接入真实的图像识别 API
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        // 模拟识别结果
        const mockResult: ImageRecognitionResult = {
          labels: ['人物', '风景', '物体'],
          confidence: 0.85,
          description: '这是一张图片'
        }
        resolve(mockResult)
      }
      reader.readAsDataURL(file)
    })
  }

  // 图片生成（需要接入外部 API）
  async generateImage(options: ImageGenerationOptions): Promise<string> {
    // 这里返回模拟的图片 URL，实际应用中需要接入真实的生图 API
    console.log('生成图片:', options)
    
    // 返回一个占位图片
    return `https://via.placeholder.com/${options.size || '512x512'}?text=${encodeURIComponent(options.prompt)}`
  }

  // 摄像头访问
  async startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })

      this.videoElement = videoElement
      videoElement.srcObject = this.mediaStream
      await videoElement.play()

      return this.mediaStream
    } catch (error) {
      console.error('启动摄像头失败:', error)
      throw new Error('无法访问摄像头')
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null
      this.videoElement = null
    }
  }

  // 拍照
  async capturePhoto(): Promise<Blob> {
    if (!this.videoElement) {
      throw new Error('摄像头未启动')
    }

    const canvas = document.createElement('canvas')
    canvas.width = this.videoElement.videoWidth
    canvas.height = this.videoElement.videoHeight

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(this.videoElement, 0, 0)
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/png')
    })
  }

  // 麦克风访问（用于录音）
  async startAudioRecording(): Promise<MediaRecorder> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      return mediaRecorder
    } catch (error) {
      console.error('启动麦克风失败:', error)
      throw new Error('无法访问麦克风')
    }
  }

  // 检查浏览器支持
  checkSupport() {
    return {
      voiceRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      speechSynthesis: 'speechSynthesis' in window,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    }
  }

  // 请求通知权限
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // 发送通知
  sendNotification(title: string, body: string, icon?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico'
      })
    }
  }
}

// 单例
export const multimodalService = new MultimodalService()

// React Hook 封装
export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  const start = async (onResult: (text: string) => void) => {
    try {
      await multimodalService.initVoiceRecognition()
      multimodalService.startVoiceRecognition((text, isFinal) => {
        setTranscript(text)
        if (isFinal) {
          onResult(text)
        }
      })
      setIsListening(true)
    } catch (error) {
      console.error('启动语音识别失败:', error)
    }
  }

  const stop = () => {
    multimodalService.stopVoiceRecognition()
    setIsListening(false)
  }

  return { isListening, transcript, start, stop }
}

import { useState } from 'react'

export function useCamera() {
  const [isActive, setIsActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const start = async (videoElement: HTMLVideoElement) => {
    try {
      const mediaStream = await multimodalService.startCamera(videoElement)
      setStream(mediaStream)
      setIsActive(true)
    } catch (error) {
      console.error('启动摄像头失败:', error)
    }
  }

  const stop = () => {
    multimodalService.stopCamera()
    setStream(null)
    setIsActive(false)
  }

  const capture = async () => {
    return await multimodalService.capturePhoto()
  }

  return { isActive, stream, start, stop, capture }
}
