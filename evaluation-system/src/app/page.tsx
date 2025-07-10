'use client'

import { useState, useEffect } from 'react'
import EvaluationForm from '@/components/EvaluationForm'
import { evaluationPatterns } from '@/types/evaluation-patterns'

type Employee = {
  id: number
  name: string
  department: string
  position: string
}

type EvaluationItem = {
  id: number
  evaluationId: number
  itemId: string
  itemName: string
  score: number
  maxScore: number
}

type Evaluation = {
  id: number
  employeeId: number
  patternId: string
  periodStart: string
  periodEnd: string
  totalScore: number
  grade: string
  comment?: string
  employee?: Employee
  items?: EvaluationItem[]
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [selectedPattern, setSelectedPattern] = useState(evaluationPatterns[0].id)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  
  // 新規従業員フォーム
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: 'マーケティング部',
    position: ''
  })

  // 従業員一覧を取得
  useEffect(() => {
    fetchEmployees()
  }, [])

  // 選択した従業員・パターンの評価を取得
  useEffect(() => {
    if (selectedEmployee && selectedPattern) {
      fetchEvaluations(selectedEmployee, selectedPattern)
    }
  }, [selectedEmployee, selectedPattern])

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees(data)
  }

  const fetchEvaluations = async (employeeId: number, patternId: string) => {
    const res = await fetch(`/api/evaluations?employeeId=${employeeId}&patternId=${patternId}`)
    const data = await res.json()
    setEvaluations(data)
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee)
    })
    if (res.ok) {
      setNewEmployee({ name: '', department: 'マーケティング部', position: '' })
      fetchEmployees()
    }
  }

  const handleSubmitEvaluation = async (evaluationData: any) => {
    const res = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationData)
    })
    
    if (res.ok) {
      alert('評価を保存しました！')
      if (selectedEmployee && selectedPattern) {
        fetchEvaluations(selectedEmployee, selectedPattern)
      }
    }
  }

  const currentPattern = evaluationPatterns.find(p => p.id === selectedPattern)!

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          マーケティング評価システム
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：従業員リスト */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">従業員一覧</h2>
              
              {/* 従業員追加フォーム */}
              <form onSubmit={handleAddEmployee} className="mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="氏名"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                  required
                />
                <input
                  type="text"
                  placeholder="職位"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  追加
                </button>
              </form>

              {/* 従業員リスト */}
              <div className="space-y-2">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp.id)}
                    className={`w-full text-left p-3 rounded ${
                      selectedEmployee === emp.id 
                        ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400' 
                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                    } border`}
                  >
                    <div className="font-semibold dark:text-gray-100">{emp.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{emp.position}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右側：評価フォーム */}
          <div className="lg:col-span-2">
            {selectedEmployee ? (
              <div className="space-y-6">
                {/* タブナビゲーション */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">評価パターンを選択</h2>
                  <div className="flex flex-wrap gap-2">
                    {evaluationPatterns.map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => setSelectedPattern(pattern.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedPattern === pattern.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div>{pattern.name}</div>
                        <div className="text-xs">
                          {'★'.repeat(pattern.recommendationLevel)}{'☆'.repeat(5 - pattern.recommendationLevel)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 評価フォーム */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold dark:text-gray-100">{currentPattern.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{currentPattern.description}</p>
                  </div>
                  
                  <EvaluationForm
                    pattern={currentPattern}
                    employeeId={selectedEmployee}
                    onSubmit={handleSubmitEvaluation}
                  />
                </div>

                {/* 過去の評価 */}
                {evaluations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">過去の評価</h3>
                    <div className="space-y-4">
                      {evaluations.map((evaluation) => (
                        <div key={evaluation.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                          <div className="flex justify-between mb-2">
                            <span className="dark:text-gray-200">
                              {new Date(evaluation.periodStart).toLocaleDateString()} - {new Date(evaluation.periodEnd).toLocaleDateString()}
                            </span>
                            <span className="font-semibold dark:text-gray-100">{evaluation.totalScore}点 ({evaluation.grade})</span>
                          </div>
                          {evaluation.items && (
                            <div className="mt-2 space-y-1">
                              {evaluation.items.map((item) => (
                                <div key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.itemName}: {item.score}/{item.maxScore}点
                                </div>
                              ))}
                            </div>
                          )}
                          {evaluation.comment && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              コメント: {evaluation.comment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
                従業員を選択してください
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}