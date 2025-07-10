import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { EvaluationPattern, Employee, EvaluationData } from '../types';
import axios from 'axios';

interface EvaluationFormProps {
  pattern: EvaluationPattern;
  employee: Employee;
  onSave: (data: EvaluationData) => void;
}

const API_URL = 'http://localhost:3001/api';

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  pattern,
  employee,
  onSave
}) => {
  const [formData, setFormData] = useState<EvaluationData>({
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0]
  });
  const [existingEvaluation, setExistingEvaluation] = useState<any>(null);

  useEffect(() => {
    loadExistingEvaluation();
  }, [employee.id, pattern.pattern_number]);

  const loadExistingEvaluation = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/evaluations/${employee.id}?pattern=${pattern.pattern_number}`
      );
      if (response.data.length > 0) {
        const latest = response.data[0];
        setExistingEvaluation(latest);
        setFormData({
          ...latest.evaluation_data,
          period_start: latest.period_start,
          period_end: latest.period_end
        });
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const calculateTotalScore = () => {
    const config = pattern.pattern_config;
    let totalScore = 0;

    // Pattern-specific calculation logic
    switch (pattern.pattern_number) {
      case 1: // 4軸統合評価
        config.axes.forEach((axis: any) => {
          axis.items.forEach((item: any) => {
            totalScore += Number(formData[item.name] || 0);
          });
        });
        break;

      case 2: // 2コース制
        const course = formData.course || 'professional';
        const courseConfig = config.courses[course];
        courseConfig.evaluation.forEach((category: any) => {
          category.items.forEach((item: any) => {
            totalScore += Number(formData[item.name] || 0);
          });
        });
        break;

      case 3: // データドリブン
      case 4: // ハイブリッド成長
      case 6: // ミッションクリティカル
      case 8: // トリプルボトムライン
        const categories = config.tiers || config.categories || config.impacts || config.values;
        categories.forEach((category: any) => {
          category.items.forEach((item: any) => {
            totalScore += Number(formData[item.name] || 0);
          });
        });
        break;

      case 5: // フラット評価
        totalScore = Number(formData['全社貢献度'] || 0);
        break;

      case 7: // コンピテンシー
        config.competencies.core.forEach((comp: any) => {
          totalScore += Number(formData[comp.name] || 0) * 20;
        });
        break;

      case 9: // アジャイル
        config.elements.forEach((element: any) => {
          totalScore += Number(formData[element.name] || 0);
        });
        break;
    }

    return totalScore;
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  const handleSave = () => {
    const totalScore = calculateTotalScore();
    const grade = getGrade(totalScore);
    
    onSave({
      ...formData,
      total_score: totalScore,
      grade: grade
    });
  };

  const renderPatternForm = () => {
    const config = pattern.pattern_config;

    switch (pattern.pattern_number) {
      case 1: // 4軸統合評価
        return (
          <>
            {config.axes.map((axis: any, axisIndex: number) => (
              <Card key={axisIndex} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {axis.name} ({axis.weight}%)
                  </Typography>
                  <Grid container spacing={2}>
                    {axis.items.map((item: any, itemIndex: number) => (
                      <Grid item xs={12} sm={6} key={itemIndex}>
                        <TextField
                          fullWidth
                          label={`${item.name} (${item.points}点)`}
                          type="number"
                          inputProps={{ min: 0, max: item.points }}
                          value={formData[item.name] || ''}
                          onChange={(e) => handleInputChange(item.name, e.target.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </>
        );

      case 2: // 2コース制
        return (
          <>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>評価コース</InputLabel>
              <Select
                value={formData.course || 'professional'}
                onChange={(e) => handleInputChange('course', e.target.value)}
              >
                <MenuItem value="professional">専門職コース</MenuItem>
                <MenuItem value="management">管理職コース</MenuItem>
              </Select>
            </FormControl>
            
            {config.courses[formData.course || 'professional'].evaluation.map((category: any, index: number) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {category.name} ({category.weight}%)
                  </Typography>
                  <Grid container spacing={2}>
                    {category.items.map((item: any, itemIndex: number) => (
                      <Grid item xs={12} sm={6} key={itemIndex}>
                        <TextField
                          fullWidth
                          label={`${item.name} (${item.points}点)`}
                          type="number"
                          inputProps={{ min: 0, max: item.points }}
                          value={formData[item.name] || ''}
                          onChange={(e) => handleInputChange(item.name, e.target.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </>
        );

      case 3: // データドリブン評価
        return (
          <>
            {config.tiers.map((tier: any, index: number) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tier.name} ({tier.weight}%)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>KPI</TableCell>
                          <TableCell>配点</TableCell>
                          <TableCell>目標</TableCell>
                          <TableCell>実績</TableCell>
                          <TableCell>得点</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tier.items.map((item: any, itemIndex: number) => (
                          <TableRow key={itemIndex}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.points}点</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={formData[`${item.name}_target`] || ''}
                                onChange={(e) => handleInputChange(`${item.name}_target`, e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={formData[`${item.name}_actual`] || ''}
                                onChange={(e) => handleInputChange(`${item.name}_actual`, e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: item.points }}
                                value={formData[item.name] || ''}
                                onChange={(e) => handleInputChange(item.name, e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ))}
          </>
        );

      case 5: // 革新的フラット評価
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                貢献度評価
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>全社貢献度</InputLabel>
                <Select
                  value={formData['全社貢献度'] || ''}
                  onChange={(e) => handleInputChange('全社貢献度', e.target.value)}
                >
                  <MenuItem value={95}>S (95点)</MenuItem>
                  <MenuItem value={85}>A (85点)</MenuItem>
                  <MenuItem value={75}>B (75点)</MenuItem>
                  <MenuItem value={65}>C (65点)</MenuItem>
                  <MenuItem value={50}>D (50点)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="具体的な貢献内容"
                value={formData['貢献内容'] || ''}
                onChange={(e) => handleInputChange('貢献内容', e.target.value)}
              />
            </CardContent>
          </Card>
        );

      case 7: // コンピテンシー進化マトリクス
        return (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  コアコンピテンシー
                </Typography>
                <Grid container spacing={2}>
                  {config.competencies.core.map((comp: any, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {comp.name}
                        </Typography>
                        <FormControl fullWidth>
                          <Select
                            value={formData[comp.name] || 1}
                            onChange={(e) => handleInputChange(comp.name, e.target.value)}
                          >
                            <MenuItem value={1}>Level 1: 基礎</MenuItem>
                            <MenuItem value={2}>Level 2: 実践</MenuItem>
                            <MenuItem value={3}>Level 3: 応用</MenuItem>
                            <MenuItem value={4}>Level 4: 熟練</MenuItem>
                            <MenuItem value={5}>Level 5: 卓越</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </>
        );

      case 9: // アジャイル・コンティニュアス評価
        return (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  スプリント評価
                </Typography>
                <TextField
                  fullWidth
                  label="評価スプリント範囲"
                  placeholder="例: 第1〜第6スプリント"
                  value={formData['sprint_range'] || ''}
                  onChange={(e) => handleInputChange('sprint_range', e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Grid container spacing={2}>
                  {config.elements.map((element: any, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <TextField
                        fullWidth
                        label={`${element.name} (${element.weight}点)`}
                        type="number"
                        inputProps={{ min: 0, max: element.weight }}
                        value={formData[element.name] || ''}
                        onChange={(e) => handleInputChange(element.name, e.target.value)}
                        helperText={element.description}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </>
        );

      default:
        // Generic pattern rendering for patterns 4, 6, 8
        const items = config.categories || config.impacts || config.values || [];
        return (
          <>
            {items.map((category: any, index: number) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {category.name} ({category.weight}%)
                  </Typography>
                  <Grid container spacing={2}>
                    {category.items.map((item: any, itemIndex: number) => (
                      <Grid item xs={12} sm={6} key={itemIndex}>
                        <TextField
                          fullWidth
                          label={`${item.name} (${item.points}点)`}
                          type="number"
                          inputProps={{ min: 0, max: item.points }}
                          value={formData[item.name] || ''}
                          onChange={(e) => handleInputChange(item.name, e.target.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </>
        );
    }
  };

  const totalScore = calculateTotalScore();
  const grade = getGrade(totalScore);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {pattern.pattern_name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {pattern.pattern_description}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Period Selection */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="評価期間（開始）"
            type="date"
            value={formData.period_start}
            onChange={(e) => handleInputChange('period_start', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="評価期間（終了）"
            type="date"
            value={formData.period_end}
            onChange={(e) => handleInputChange('period_end', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Pattern-specific form */}
      {renderPatternForm()}

      {/* Score Summary */}
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            評価結果
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h3">
              {totalScore}点
            </Typography>
            <Chip
              label={`評価: ${grade}`}
              color={grade === 'S' || grade === 'A' ? 'success' : grade === 'B' ? 'primary' : 'warning'}
              size="medium"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={totalScore}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="medium"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          評価を保存
        </Button>
      </Box>
    </Box>
  );
};

export default EvaluationForm;