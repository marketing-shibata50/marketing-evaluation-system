// 評価パターンの定義
export type EvaluationPattern = {
  id: string
  name: string
  description: string
  recommendationLevel: number // 1-5
  evaluationItems: EvaluationItem[]
}

export type EvaluationItem = {
  id: string
  name: string
  description: string
  category?: string
}

// 9つの評価パターン定義
export const evaluationPatterns: EvaluationPattern[] = [
  {
    id: 'pattern1',
    name: '4軸統合評価システム',
    description: 'メルカリ・サイバーエージェント・SmartHRの成功事例を統合した包括的評価制度',
    recommendationLevel: 5,
    evaluationItems: [
      { id: 'performance', name: 'Performance（成果）', description: '売上目標達成率・リード獲得数・CAC改善・ROI向上' },
      { id: 'skill', name: 'Skill（スキル）', description: 'マーケティング専門スキル・データ分析能力・人材業界知識' },
      { id: 'growth', name: 'Growth（成長）', description: '新しいスキルの習得・失敗からの学習・イノベーションへの挑戦' },
      { id: 'contribution', name: 'Contribution（貢献）', description: 'チームワーク・後輩育成・組織文化への貢献' }
    ]
  },
  {
    id: 'pattern2',
    name: '2コース制キャリア評価',
    description: 'サイバーエージェント・リクルートの成功事例を基にした専門職・マネジメント分離型',
    recommendationLevel: 4,
    evaluationItems: [
      { id: 'expertise', name: '専門性', description: 'マーケティング専門知識・技術力', category: '専門職' },
      { id: 'result', name: '成果', description: '目標達成度・業績貢献', category: '専門職' },
      { id: 'management', name: '組織管理', description: 'チーム運営・目標管理', category: 'マネジメント' },
      { id: 'achievement', name: '成果', description: '部門業績・目標達成', category: 'マネジメント' },
      { id: 'development', name: '人材育成', description: 'メンバー育成・後継者育成', category: 'マネジメント' }
    ]
  },
  {
    id: 'pattern3',
    name: 'データドリブン評価システム',
    description: 'カオナビ・freee・Sansanの事例を基にした定量評価重視システム',
    recommendationLevel: 4,
    evaluationItems: [
      { id: 'cac', name: 'CAC（顧客獲得コスト）', description: '顧客獲得効率', category: 'Tier1' },
      { id: 'ltv', name: 'LTV（顧客生涯価値）', description: '顧客価値最大化', category: 'Tier1' },
      { id: 'roi', name: 'ROI（投資対効果）', description: 'マーケティング投資効率', category: 'Tier1' },
      { id: 'conversionRate', name: '成約率', description: 'リードから成約への転換率', category: 'Tier1' },
      { id: 'leadVolume', name: 'リード数', description: '月間リード獲得数', category: 'Tier2' },
      { id: 'leadQuality', name: 'リード品質', description: 'リード品質スコア', category: 'Tier2' },
      { id: 'process', name: 'プロセス改善', description: '業務効率化', category: 'Tier3' },
      { id: 'innovation', name: '革新', description: '新しい取り組み', category: 'Tier3' }
    ]
  },
  {
    id: 'pattern4',
    name: 'ハイブリッド成長評価',
    description: 'ネオキャリア・DYM・PORTの成長企業事例を統合した成長重視システム',
    recommendationLevel: 3,
    evaluationItems: [
      { id: 'quantitativeResult', name: '定量成果', description: '売上・リード等の数値', category: '成果' },
      { id: 'qualitativeResult', name: '定性成果', description: '戦略・企画の質', category: '成果' },
      { id: 'speed', name: 'スピード', description: '目標達成速度', category: '成果' },
      { id: 'learning', name: '学習', description: '新しいスキル習得', category: '成長' },
      { id: 'challenge', name: '挑戦', description: '新領域への挑戦', category: '成長' },
      { id: 'improvement', name: '改善', description: '継続的な改善', category: '成長' }
    ]
  },
  {
    id: 'pattern5',
    name: '革新的フラット評価',
    description: 'Green（アトラエ）・メルカリの革新的事例を参考にした新しい評価アプローチ',
    recommendationLevel: 3,
    evaluationItems: [
      { id: 'totalContribution', name: '総合貢献度', description: '組織全体への貢献' }
    ]
  },
  {
    id: 'pattern6',
    name: 'ミッションクリティカル・インパクト評価',
    description: 'ビジネスへの本質的な影響度を中心に据えた評価システム',
    recommendationLevel: 4,
    evaluationItems: [
      { id: 'strategicImpact', name: 'Strategic Impact', description: '経営戦略への貢献・新規事業創出' },
      { id: 'operationalExcellence', name: 'Operational Excellence', description: '業務効率化・プロセス革新' },
      { id: 'innovationLearning', name: 'Innovation & Learning', description: '新アプローチ開発・失敗からの学習' },
      { id: 'stakeholderValue', name: 'Stakeholder Value', description: '顧客満足度・チーム貢献' }
    ]
  },
  {
    id: 'pattern7',
    name: 'コンピテンシー進化マトリクス',
    description: '役割別の詳細なコンピテンシー定義と進化段階を明確化',
    recommendationLevel: 3,
    evaluationItems: [
      { id: 'digitalMarketing', name: 'デジタルマーケティング力', description: 'レベル1-5の段階評価' },
      { id: 'marketUnderstanding', name: '人材市場理解力', description: 'レベル1-5の段階評価' },
      { id: 'dataThinking', name: 'データドリブン思考', description: 'レベル1-5の段階評価' }
    ]
  },
  {
    id: 'pattern8',
    name: 'トリプルボトムライン価値創造評価',
    description: '経済・社会・個人の3つの価値創造をバランスよく評価',
    recommendationLevel: 4,
    evaluationItems: [
      { id: 'economicValue', name: 'Economic Value', description: '直接的収益貢献・間接的価値創造' },
      { id: 'socialValue', name: 'Social Value', description: '雇用創出・業界発展への貢献' },
      { id: 'individualValue', name: 'Individual Value', description: '自己成長・組織への還元' }
    ]
  },
  {
    id: 'pattern9',
    name: 'アジャイル・コンティニュアス評価',
    description: '継続的なフィードバックとスプリント型目標管理',
    recommendationLevel: 3,
    evaluationItems: [
      { id: 'velocity', name: 'Velocity（速度）', description: 'タスク完了率・目標達成スピード' },
      { id: 'quality', name: 'Quality（品質）', description: 'アウトプットの質・エラー率' },
      { id: 'collaboration', name: 'Collaboration（協働）', description: 'チーム貢献・知識共有' },
      { id: 'innovation', name: 'Innovation（革新）', description: '新しい取り組み・プロセス改善' }
    ]
  }
]