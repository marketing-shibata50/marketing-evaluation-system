const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database
const db = new sqlite3.Database('./database/evaluations.db', (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  console.log('Database created successfully');
});

// Create tables
db.serialize(() => {
  // Employees table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Evaluations table
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      pattern_type INTEGER NOT NULL,
      evaluation_data TEXT NOT NULL,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  // Evaluation patterns configuration table
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluation_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_number INTEGER NOT NULL UNIQUE,
      pattern_name TEXT NOT NULL,
      pattern_description TEXT,
      pattern_config TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert initial pattern configurations
  const patterns = [
    {
      number: 1,
      name: '4軸統合評価システム',
      description: 'Performance, Skill, Growth, Contributionの4軸で総合評価',
      config: {
        axes: [
          { name: 'Performance', weight: 40, items: [
            { name: '売上目標達成', points: 15 },
            { name: 'リード獲得数', points: 10 },
            { name: 'CAC改善率', points: 8 },
            { name: 'ROI/ROAS向上', points: 7 }
          ]},
          { name: 'Skill', weight: 25, items: [
            { name: 'マーケティング専門知識', points: 8 },
            { name: 'データ分析能力', points: 7 },
            { name: '人材業界知識', points: 5 },
            { name: 'デジタルマーケ技術', points: 5 }
          ]},
          { name: 'Growth', weight: 20, items: [
            { name: '新スキル習得', points: 6 },
            { name: '失敗からの学習', points: 5 },
            { name: 'イノベーション挑戦', points: 5 },
            { name: '自己啓発', points: 4 }
          ]},
          { name: 'Contribution', weight: 15, items: [
            { name: 'チームワーク', points: 5 },
            { name: '後輩育成', points: 4 },
            { name: '組織文化貢献', points: 3 },
            { name: '社会価値創造', points: 3 }
          ]}
        ]
      }
    },
    {
      number: 2,
      name: '2コース制キャリア評価',
      description: '専門職コースとマネジメントコースの分離評価',
      config: {
        courses: {
          professional: {
            name: '専門職コース',
            evaluation: [
              { name: '専門性', weight: 60, items: [
                { name: '専門知識の深さ', points: 20 },
                { name: '技術スキル', points: 15 },
                { name: '問題解決力', points: 15 },
                { name: '業界専門性', points: 10 }
              ]},
              { name: '成果', weight: 40, items: [
                { name: '目標達成', points: 20 },
                { name: '品質', points: 10 },
                { name: '効率性', points: 10 }
              ]}
            ]
          },
          management: {
            name: '管理職コース',
            evaluation: [
              { name: '組織管理', weight: 40, items: [
                { name: 'チーム成果', points: 15 },
                { name: '業務管理', points: 15 },
                { name: 'リソース管理', points: 10 }
              ]},
              { name: '成果', weight: 35, items: [
                { name: '部門目標達成', points: 20 },
                { name: '戦略実行', points: 15 }
              ]},
              { name: '人材育成', weight: 25, items: [
                { name: 'メンバー成長', points: 15 },
                { name: '後継者育成', points: 10 }
              ]}
            ]
          }
        }
      }
    },
    {
      number: 3,
      name: 'データドリブン評価システム',
      description: '定量的KPIを中心とした評価',
      config: {
        tiers: [
          { name: 'Tier1指標', weight: 50, items: [
            { name: 'CAC（顧客獲得コスト）', points: 15 },
            { name: 'LTV（顧客生涯価値）', points: 15 },
            { name: 'ROI（投資対効果）', points: 10 },
            { name: '成約転換率', points: 10 }
          ]},
          { name: 'Tier2指標', weight: 30, items: [
            { name: 'リード獲得数', points: 10 },
            { name: 'リード品質スコア', points: 8 },
            { name: 'ブランド認知度', points: 7 },
            { name: '顧客満足度', points: 5 }
          ]},
          { name: 'Tier3指標', weight: 20, items: [
            { name: 'プロセス改善', points: 5 },
            { name: 'スキル向上', points: 5 },
            { name: 'チーム貢献', points: 5 },
            { name: '革新的取り組み', points: 5 }
          ]}
        ]
      }
    },
    {
      number: 4,
      name: 'ハイブリッド成長評価',
      description: '成果と成長の両面を重視',
      config: {
        categories: [
          { name: '成果評価', weight: 60, items: [
            { name: '定量成果', points: 25 },
            { name: '定性成果', points: 15 },
            { name: 'スピード', points: 10 },
            { name: '効率性', points: 10 }
          ]},
          { name: '成長評価', weight: 40, items: [
            { name: '新スキル習得', points: 12 },
            { name: '新領域挑戦', points: 10 },
            { name: '継続的改善', points: 10 },
            { name: 'イノベーション', points: 8 }
          ]}
        ]
      }
    },
    {
      number: 5,
      name: '革新的フラット評価',
      description: '貢献度のみのシンプル評価',
      config: {
        evaluation: [
          { name: '全社貢献度', weight: 100, items: [
            { name: '価値創造', points: 40 },
            { name: '協働', points: 30 },
            { name: '自律性', points: 30 }
          ]}
        ]
      }
    },
    {
      number: 6,
      name: 'ミッションクリティカル・インパクト評価',
      description: 'ビジネスインパクトを中心とした評価',
      config: {
        impacts: [
          { name: 'Strategic Impact', weight: 35, items: [
            { name: '経営戦略への貢献', points: 10 },
            { name: '新規事業創出', points: 10 },
            { name: '市場開拓・拡大', points: 8 },
            { name: '競争優位性構築', points: 7 }
          ]},
          { name: 'Operational Excellence', weight: 25, items: [
            { name: '業務効率化', points: 8 },
            { name: 'プロセス革新', points: 7 },
            { name: 'コスト削減', points: 5 },
            { name: '品質向上', points: 5 }
          ]},
          { name: 'Innovation & Learning', weight: 20, items: [
            { name: '新アプローチ開発', points: 7 },
            { name: '失敗からの学習', points: 5 },
            { name: '知識体系化', points: 4 },
            { name: '組織学習貢献', points: 4 }
          ]},
          { name: 'Stakeholder Value', weight: 20, items: [
            { name: '顧客満足度向上', points: 7 },
            { name: 'チーム貢献', points: 5 },
            { name: 'パートナーシップ', points: 4 },
            { name: '社会的価値', points: 4 }
          ]}
        ]
      }
    },
    {
      number: 7,
      name: 'コンピテンシー進化マトリクス',
      description: '役割別コンピテンシーレベル評価',
      config: {
        competencies: {
          core: [
            { name: 'デジタルマーケティング力', maxLevel: 5 },
            { name: '人材市場理解力', maxLevel: 5 },
            { name: 'データドリブン思考', maxLevel: 5 }
          ],
          specialized: {
            roles: ['コンテンツマーケター', 'デマンドジェネレーター', 'ブランドマネージャー', 'アナリスト']
          }
        }
      }
    },
    {
      number: 8,
      name: 'トリプルボトムライン価値創造評価',
      description: '経済・社会・個人の3つの価値創造評価',
      config: {
        values: [
          { name: 'Economic Value', weight: 40, items: [
            { name: '直接的収益貢献', points: 20 },
            { name: 'コスト削減', points: 8 },
            { name: '効率向上', points: 7 },
            { name: 'ブランド価値', points: 5 }
          ]},
          { name: 'Social Value', weight: 30, items: [
            { name: '雇用創出貢献', points: 10 },
            { name: '多様性推進', points: 8 },
            { name: '業界発展貢献', points: 7 },
            { name: '地域活性化', points: 5 }
          ]},
          { name: 'Individual Value', weight: 30, items: [
            { name: 'スキル向上', points: 10 },
            { name: 'キャリア成長', points: 8 },
            { name: '知識共有', points: 7 },
            { name: '自己実現', points: 5 }
          ]}
        ]
      }
    },
    {
      number: 9,
      name: 'アジャイル・コンティニュアス評価',
      description: 'スプリント単位の継続的評価',
      config: {
        elements: [
          { name: 'Velocity', weight: 25, description: '速度・生産性' },
          { name: 'Quality', weight: 25, description: '品質・正確性' },
          { name: 'Collaboration', weight: 25, description: '協働・チームワーク' },
          { name: 'Innovation', weight: 25, description: '革新・改善' }
        ]
      }
    }
  ];

  // Insert patterns
  const stmt = db.prepare(`
    INSERT INTO evaluation_patterns (pattern_number, pattern_name, pattern_description, pattern_config)
    VALUES (?, ?, ?, ?)
  `);

  patterns.forEach(pattern => {
    stmt.run(pattern.number, pattern.name, pattern.description, JSON.stringify(pattern.config));
  });

  stmt.finalize();

  // Insert sample employees
  const employees = [
    { name: '山田太郎', department: 'マーケティング部', position: 'マネージャー' },
    { name: '佐藤花子', department: 'マーケティング部', position: 'シニアスペシャリスト' },
    { name: '鈴木一郎', department: 'マーケティング部', position: 'スペシャリスト' }
  ];

  const empStmt = db.prepare('INSERT INTO employees (name, department, position) VALUES (?, ?, ?)');
  employees.forEach(emp => {
    empStmt.run(emp.name, emp.department, emp.position);
  });
  empStmt.finalize();

  console.log('Database initialized successfully');
});

db.close();