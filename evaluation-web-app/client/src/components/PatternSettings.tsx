import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { EvaluationPattern } from '../types';
import axios from 'axios';

interface PatternSettingsProps {
  patterns: EvaluationPattern[];
  onUpdate: () => void;
}

const API_URL = 'http://localhost:3001/api';

const PatternSettings: React.FC<PatternSettingsProps> = ({ patterns, onUpdate }) => {
  const [editingPattern, setEditingPattern] = useState<number | null>(null);
  const [editConfig, setEditConfig] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = (pattern: EvaluationPattern) => {
    setEditingPattern(pattern.id);
    setEditConfig(JSON.parse(JSON.stringify(pattern.pattern_config)));
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingPattern) return;

    try {
      await axios.put(`${API_URL}/patterns/${editingPattern}`, {
        pattern_config: editConfig
      });
      setShowEditDialog(false);
      setEditingPattern(null);
      setEditConfig(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving pattern:', error);
    }
  };

  const updateConfigValue = (path: string[], value: any) => {
    const newConfig = { ...editConfig };
    let current = newConfig;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setEditConfig(newConfig);
  };

  const addItem = (path: string[]) => {
    const newConfig = { ...editConfig };
    let current = newConfig;
    
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    current.push({
      name: '新規項目',
      points: 5
    });
    
    setEditConfig(newConfig);
  };

  const deleteItem = (path: string[], index: number) => {
    const newConfig = { ...editConfig };
    let current = newConfig;
    
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    current.splice(index, 1);
    setEditConfig(newConfig);
  };

  const renderEditForm = (pattern: EvaluationPattern) => {
    const config = editConfig;
    if (!config) return null;

    switch (pattern.pattern_number) {
      case 1: // 4軸統合評価
      case 3: // データドリブン
      case 4: // ハイブリッド成長
      case 6: // ミッションクリティカル
      case 8: // トリプルボトムライン
        const categories = config.axes || config.tiers || config.categories || config.impacts || config.values;
        const categoryName = config.axes ? 'axes' : config.tiers ? 'tiers' : config.categories ? 'categories' : config.impacts ? 'impacts' : 'values';
        
        return (
          <>
            {categories.map((category: any, catIndex: number) => (
              <Accordion key={catIndex} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{category.name} ({category.weight}%)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label="カテゴリ名"
                        value={category.name}
                        onChange={(e) => updateConfigValue([categoryName, String(catIndex), 'name'], e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="配分(%)"
                        type="number"
                        value={category.weight}
                        onChange={(e) => updateConfigValue([categoryName, String(catIndex), 'weight'], Number(e.target.value))}
                      />
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    評価項目
                  </Typography>
                  
                  <List>
                    {category.items.map((item: any, itemIndex: number) => (
                      <ListItem key={itemIndex}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.name}
                              onChange={(e) => updateConfigValue([categoryName, String(catIndex), 'items', String(itemIndex), 'name'], e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="配点"
                              value={item.points}
                              onChange={(e) => updateConfigValue([categoryName, String(catIndex), 'items', String(itemIndex), 'points'], Number(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={1}>
                            <IconButton
                              size="small"
                              onClick={() => deleteItem([categoryName, String(catIndex), 'items'], itemIndex)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addItem([categoryName, String(catIndex), 'items'])}
                    sx={{ mt: 1 }}
                  >
                    項目追加
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        );

      case 7: // コンピテンシー進化マトリクス
        return (
          <>
            <Typography variant="h6" gutterBottom>
              コアコンピテンシー
            </Typography>
            <List>
              {config.competencies.core.map((comp: any, index: number) => (
                <ListItem key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        size="small"
                        value={comp.name}
                        onChange={(e) => updateConfigValue(['competencies', 'core', String(index), 'name'], e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="最大レベル"
                        value={comp.maxLevel}
                        onChange={(e) => updateConfigValue(['competencies', 'core', String(index), 'maxLevel'], Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        size="small"
                        onClick={() => deleteItem(['competencies', 'core'], index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                const newCore = [...config.competencies.core];
                newCore.push({ name: '新規コンピテンシー', maxLevel: 5 });
                updateConfigValue(['competencies', 'core'], newCore);
              }}
            >
              コンピテンシー追加
            </Button>
          </>
        );

      case 9: // アジャイル・コンティニュアス評価
        return (
          <>
            <Typography variant="h6" gutterBottom>
              評価要素
            </Typography>
            <List>
              {config.elements.map((element: any, index: number) => (
                <ListItem key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="要素名"
                        value={element.name}
                        onChange={(e) => updateConfigValue(['elements', String(index), 'name'], e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="配分(%)"
                        value={element.weight}
                        onChange={(e) => updateConfigValue(['elements', String(index), 'weight'], Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="説明"
                        value={element.description}
                        onChange={(e) => updateConfigValue(['elements', String(index), 'description'], e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        size="small"
                        onClick={() => deleteItem(['elements'], index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                const newElements = [...config.elements];
                newElements.push({ name: '新規要素', weight: 25, description: '' });
                updateConfigValue(['elements'], newElements);
              }}
            >
              要素追加
            </Button>
          </>
        );

      default:
        return (
          <Typography color="text.secondary">
            このパターンの設定編集は現在サポートされていません。
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {patterns.map((pattern) => (
          <Grid item xs={12} md={6} key={pattern.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    パターン{pattern.pattern_number}: {pattern.pattern_name}
                  </Typography>
                  <IconButton onClick={() => handleEdit(pattern)}>
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pattern.pattern_description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  最終更新: {new Date(pattern.updated_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          評価パターン設定編集
        </DialogTitle>
        <DialogContent>
          {editingPattern && (
            <>
              {patterns.find(p => p.id === editingPattern) && 
                renderEditForm(patterns.find(p => p.id === editingPattern)!)}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatternSettings;