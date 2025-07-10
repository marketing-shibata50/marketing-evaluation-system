'use client'

import { useState, useEffect } from 'react'

type Employee = {
  id: number
  name: string
  department: string
  position: string
}

type Evaluation = {
  id: number
  employeeId: number
  periodStart: string
  periodEnd: string
  performance: number
  skill: number
  growth: number
  contribution: number
  totalScore: number
  grade: string
  comment?: string
  employee?: Employee
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  
  // フォームデータ
  const [formData, setFormData] = useState({
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    performance: 0,
    skill: 0,
    growth: 0,
    contribution: 0,
    comment: ''
  })

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

  // 選択した従業員の評価を取得
  useEffect(() => {
    if (selectedEmployee) {
      fetchEvaluations(selectedEmployee)
    }
  }, [selectedEmployee])

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees(data)
  }

  const fetchEvaluations = async (employeeId: number) => {
    const res = await fetch(`/api/evaluations?employeeId=${employeeId}`)
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

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return

    const res = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: selectedEmployee,
        ...formData
      })
    })
    
    if (res.ok) {
      alert('評価を保存しました！')
      fetchEvaluations(selectedEmployee)
      // フォームをリセット
      setFormData({
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        performance: 0,
        skill: 0,
        growth: 0,
        contribution: 0,
        comment: ''
      })
    }
  }

  const totalScore = formData.performance + formData.skill + formData.growth + formData.contribution
  let grade = 'D'
  if (totalScore >= 90) grade = 'S'
  else if (totalScore >= 80) grade = 'A'
  else if (totalScore >= 70) grade = 'B'
  else if (totalScore >= 60) grade = 'C'

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
                    <div className="font-semibold">{emp.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{emp.position}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右側：評価フォーム */}
          <div className="lg:col-span-2">
            {selectedEmployee ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">4軸統合評価システム</h2>
                
                <form onSubmit={handleSubmitEvaluation} className="space-y-6">
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

                  {/* 評価項目 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Performance（成果） - 40点満点
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={formData.performance}
                        onChange={(e) => setFormData({...formData, performance: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Skill（スキル） - 25点満点
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={formData.skill}
                        onChange={(e) => setFormData({...formData, skill: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Growth（成長） - 20点満点
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={formData.growth}
                        onChange={(e) => setFormData({...formData, growth: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Contribution（貢献） - 15点満点
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        value={formData.contribution}
                        onChange={(e) => setFormData({...formData, contribution: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">コメント</label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        className="w-full px-3 py-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* スコアサマリー */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                    <div className="text-lg font-semibold dark:text-gray-100">
                      合計スコア: {totalScore}点 / 100点
                    </div>
                    <div className="text-lg dark:text-gray-100">
                      評価: <span className={`font-bold ${
                        grade === 'S' ? 'text-purple-600 dark:text-purple-400' :
                        grade === 'A' ? 'text-green-600 dark:text-green-400' :
                        grade === 'B' ? 'text-blue-600 dark:text-blue-400' :
                        grade === 'C' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>{grade}</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 font-semibold"
                  >
                    評価を保存
                  </button>
                </form>

                {/* 過去の評価 */}
                {evaluations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">過去の評価</h3>
                    <div className="space-y-2">
                      {evaluations.map((evaluation) => (
                        <div key={evaluation.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                          <div className="flex justify-between">
                            <span>{new Date(evaluation.periodStart).toLocaleDateString()} - {new Date(evaluation.periodEnd).toLocaleDateString()}</span>
                            <span className="font-semibold">{evaluation.totalScore}点 ({evaluation.grade})</span>
                          </div>
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
