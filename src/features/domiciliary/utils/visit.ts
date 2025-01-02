/**
 * @writecarenotes.com
 * @fileoverview Visit utilities for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utility functions for visit management in the domiciliary care module.
 * Includes task completion calculation and other visit-related helpers.
 */

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export const calculateTaskCompletion = (tasks: Task[]): number => {
  if (!tasks.length) return 0;
  
  const completedTasks = tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
}; 