"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import styles from "./page.module.css";
import { Todo } from '@/types/todo'

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "priority">("createdAt");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const { data } = await client.models.Todo.list();
      const mappedTodos = data.map(todo => ({
        ...todo,
        isCompleted: false,
        priority: "medium" as const,
        content: todo.content ?? ""
      }));
      setTodos(mappedTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }

  const createTodo = async (content: string) => {
    const todo = await client.models.Todo.create({
      data: {
        content,
        isCompleted: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    return todo
  }

  const updateTodo = async (id: string, data: Partial<Todo>) => {
    const todo = await client.models.Todo.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date().toISOString(),
      },
    })
    return todo
  }

  async function deleteTodo(id: string) {
    try {
      await client.models.Todo.delete({ id });
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.isCompleted;
    return todo.isCompleted;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    const contentA = a.content || ''
    const contentB = b.content || ''
    return contentA.localeCompare(contentB)
  });

  return (
    <main className={styles.main}>
      <h1>Todo App</h1>
      
      <div className={styles.controls}>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "createdAt" | "priority")}>
          <option value="createdAt">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
        
        <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "completed")}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          onKeyPress={(e) => e.key === "Enter" && createTodo(newTodo)}
        />
        <button onClick={() => createTodo(newTodo)}>Add</button>
      </div>

      <ul className={styles.todoList}>
        {sortedTodos.map((todo) => (
          <li key={todo.id} className={styles.todoItem}>
            <input
              type="checkbox"
              checked={todo.isCompleted}
              onChange={() => updateTodo(todo.id, { isCompleted: !todo.isCompleted })}
            />
            <span className={todo.isCompleted ? styles.completed : ""}>
              {todo.content || 'Untitled Todo'}
            </span>
            <select
              value={todo.priority}
              onChange={(e) => updateTodo(todo.id, { priority: e.target.value as "low" | "medium" | "high" })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className={styles.stats}>
        <p>Total todos: {todos.length}</p>
        <p>Active: {todos.filter(t => !t.isCompleted).length}</p>
        <p>Completed: {todos.filter(t => t.isCompleted).length}</p>
      </div>
    </main>
  );
}
