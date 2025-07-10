import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Box
} from '@mui/material';
import { Employee } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  selectedEmployee,
  onSelectEmployee
}) => {
  return (
    <List>
      {employees.map((employee) => (
        <ListItem key={employee.id} disablePadding>
          <ListItemButton
            selected={selectedEmployee?.id === employee.id}
            onClick={() => onSelectEmployee(employee)}
          >
            <ListItemText
              primary={employee.name}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={employee.position}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default EmployeeList;