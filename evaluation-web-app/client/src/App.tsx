import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Typography,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';
import EvaluationForm from './components/EvaluationForm';
import EmployeeList from './components/EmployeeList';
import PatternSettings from './components/PatternSettings';
import { Employee, EvaluationPattern, EvaluationData } from './types';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [patterns, setPatterns] = useState<EvaluationPattern[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: 'マーケティング部',
    position: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Load initial data
  useEffect(() => {
    loadEmployees();
    loadPatterns();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`);
      setEmployees(response.data);
      if (response.data.length > 0 && !selectedEmployee) {
        setSelectedEmployee(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      showSnackbar('従業員データの読み込みに失敗しました', 'error');
    }
  };

  const loadPatterns = async () => {
    try {
      const response = await axios.get(`${API_URL}/patterns`);
      setPatterns(response.data);
    } catch (error) {
      console.error('Error loading patterns:', error);
      showSnackbar('評価パターンの読み込みに失敗しました', 'error');
    }
  };

  const handleAddEmployee = async () => {
    try {
      const response = await axios.post(`${API_URL}/employees`, newEmployee);
      setEmployees([...employees, response.data]);
      setNewEmployee({ name: '', department: 'マーケティング部', position: '' });
      setShowAddEmployee(false);
      showSnackbar('従業員を追加しました', 'success');
    } catch (error) {
      console.error('Error adding employee:', error);
      showSnackbar('従業員の追加に失敗しました', 'error');
    }
  };

  const handleSaveEvaluation = async (patternType: number, evaluationData: EvaluationData) => {
    if (!selectedEmployee) return;

    try {
      await axios.post(`${API_URL}/evaluations`, {
        employee_id: selectedEmployee.id,
        pattern_type: patternType,
        evaluation_data: evaluationData,
        period_start: evaluationData.period_start,
        period_end: evaluationData.period_end
      });
      showSnackbar('評価を保存しました', 'success');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      showSnackbar('評価の保存に失敗しました', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            マーケティング評価システム
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<AddIcon />}
            onClick={() => setShowAddEmployee(true)}
          >
            従業員追加
          </Button>
          <IconButton 
            color="inherit"
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Employee List */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                従業員一覧
              </Typography>
              <EmployeeList
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={setSelectedEmployee}
              />
            </Paper>
          </Grid>

          {/* Evaluation Forms */}
          <Grid item xs={12} md={9}>
            {selectedEmployee ? (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedEmployee.name} - 評価入力
                </Typography>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {patterns.map((pattern, index) => (
                      <Tab 
                        key={pattern.id} 
                        label={`パターン${pattern.pattern_number}`}
                        id={`pattern-tab-${index}`}
                      />
                    ))}
                  </Tabs>
                </Box>

                {patterns.map((pattern, index) => (
                  <Box
                    key={pattern.id}
                    role="tabpanel"
                    hidden={selectedTab !== index}
                    id={`pattern-tabpanel-${index}`}
                    sx={{ pt: 3 }}
                  >
                    {selectedTab === index && (
                      <EvaluationForm
                        pattern={pattern}
                        employee={selectedEmployee}
                        onSave={(data) => handleSaveEvaluation(pattern.pattern_number, data)}
                      />
                    )}
                  </Box>
                ))}
              </Paper>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  従業員を選択してください
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployee} onClose={() => setShowAddEmployee(false)}>
        <DialogTitle>新規従業員追加</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="氏名"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="部署"
                value={newEmployee.department}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>職位</InputLabel>
                <Select
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                >
                  <MenuItem value="マネージャー">マネージャー</MenuItem>
                  <MenuItem value="シニアスペシャリスト">シニアスペシャリスト</MenuItem>
                  <MenuItem value="スペシャリスト">スペシャリスト</MenuItem>
                  <MenuItem value="ジュニアスペシャリスト">ジュニアスペシャリスト</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddEmployee(false)}>キャンセル</Button>
          <Button onClick={handleAddEmployee} variant="contained">追加</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={showSettings} 
        onClose={() => setShowSettings(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>評価パターン設定</DialogTitle>
        <DialogContent>
          <PatternSettings 
            patterns={patterns}
            onUpdate={loadPatterns}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
