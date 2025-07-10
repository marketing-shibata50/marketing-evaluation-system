'use client'

import { useState, useEffect } from 'react'
import { EvaluationPattern, EvaluationItem } from '@/types/evaluation-patterns'

type Props = {
  pattern: EvaluationPattern
  employeeId: number
  onSubmit: (data: any) => void
}

export default function EvaluationForm({ pattern, employeeId, onSubmit }: Props) {
  // 初期スコアを計算
  const getInitialScores = () => {
    const initialScores: Record<string, number> = {}
    pattern.evaluationItems.forEach(item => {
      initialScores[item.id] = 5 // デフォルトは5点
    })
    return initialScores
  }

  const [formData, setFormData] = useState({
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    comment: '',
    scores: getInitialScores()
  })

  // パターンが変更されたときにスコアをリセット
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      scores: getInitialScores()
    }))
  }, [pattern.id])

  const handleScoreChange = (itemId: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [itemId]: value }
    }))
  }

  const calculateTotalScore = () => {
    const itemCount = pattern.evaluationItems.length
    const totalScore = Object.values(formData.scores).reduce((sum, score) => sum + score, 0)
    // 100点満点に正規化
    return Math.round((totalScore / (itemCount * 10)) * 100)
  }

  const calculateGrade = (totalScore: number) => {
    if (totalScore >= 90) return 'S'
    if (totalScore >= 80) return 'A'
    if (totalScore >= 70) return 'B'
    if (totalScore >= 60) return 'C'
    return 'D'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totalScore = calculateTotalScore()
    const grade = calculateGrade(totalScore)

    const evaluationData = {
      employeeId,
      patternId: pattern.id,
      periodStart: formData.periodStart,
      periodEnd: formData.periodEnd,
      totalScore,
      grade,
      comment: formData.comment,
      items: pattern.evaluationItems.map(item => ({
        itemId: item.id,
        itemName: item.name,
        score: formData.scores[item.id] || 5,
        maxScore: 10
      }))
    }

    onSubmit(evaluationData)

    // フォームをリセット
    setFormData({
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      comment: '',
      scores: getInitialScores()
    })
  }

  const totalScore = calculateTotalScore()
  const grade = calculateGrade(totalScore)

  // カテゴリ別に項目をグループ化
  const groupedItems = pattern.evaluationItems.reduce((acc, item) => {
    const category = item.category || 'その他'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, EvaluationItem[]>)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 評価期間 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">開始日</label>
          <input
            type="date"
            value={formData.periodStart}
            onChange={(e) => setFormData({...formData, periodStart: e.target.value})}
            className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">終了日</label>
          <input
            type="date"
            value={formData.periodEnd}
            onChange={(e) => setFormData({...formData, periodEnd: e.target.value})}
            className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          />
        </div>
      </div>

      {/* 通信簿スタイルの評価表 */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 border-b-2 border-gray-300 dark:border-gray-600">
          <h3 className="text-lg font-bold text-center dark:text-gray-100">評価通信簿</h3>
        </div>
        
        <div className="p-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              {category !== 'その他' && (
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b dark:border-gray-600">
                  {category}
                </h4>
              )}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                    <div className="mb-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{item.description}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">0</span>
                      <div className="flex space-x-2 flex-1">
                        {[...Array(11)].map((_, i) => (
                          <label key={i} className="flex-1 text-center cursor-pointer">
                            <input
                              type="radio"
                              name={`score-${item.id}`}
                              value={i}
                              checked={formData.scores[item.id] === i}
                              onChange={() => handleScoreChange(item.id, i)}
                              className="sr-only"
                            />
                            <div className={`
                              h-8 flex items-center justify-center rounded text-sm font-medium transition-all
                              ${formData.scores[item.id] === i 
                                ? 'bg-blue-500 text-white scale-110 shadow-md' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }
                            `}>
                              {i}
                            </div>
                          </label>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* コメント */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <label className="block text-sm font-medium mb-2 dark:text-gray-200">総合評価コメント</label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({...formData, comment: e.target.value})}
          className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          rows={4}
          placeholder="評価期間中の成果や成長、今後の課題などを記入してください。"
        />
      </div>

      {/* スコアサマリー */}
      <div className="bg-yellow-50 dark:bg-gray-800 border-2 border-yellow-300 dark:border-yellow-600 p-6 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold dark:text-gray-100 mb-2">
            総合評価
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              {totalScore}
              <span className="text-2xl">点</span>
            </div>
            <div className={`text-6xl font-bold ${
              grade === 'S' ? 'text-purple-600 dark:text-purple-400' :
              grade === 'A' ? 'text-green-600 dark:text-green-400' :
              grade === 'B' ? 'text-blue-600 dark:text-blue-400' :
              grade === 'C' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {grade}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            (100点満点)
          </div>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 font-bold text-lg shadow-lg"
      >
        評価を保存
      </button>
    </form>
  )
}