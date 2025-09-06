import { ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, View } from 'react-native';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  category: string;
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const loadTodos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('加载数据失败:', error);
      Alert.alert('错误', '无法加载任务数据');
    }
  };
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('工作');
  useEffect(() => {
    loadTodos();
  }, []);
  const addTodo = async () => {
    if (newTodoText.trim() === '') {
      Alert.alert('提示', '请输入任务内容');
      return;
    }

    try {
      // 发送POST请求到后端
      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTodoText.trim(),
          category: selectedCategory,
          completed: false,
        }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        console.log('创建成功:', newTodo);

        // 重新加载所有数据
        await loadTodos();

        // 清空输入框
        setNewTodoText('');
      } else {
        const error = await response.json();
        Alert.alert('创建失败', error.error || '未知错误');
      }
    } catch (error) {
      console.error('网络错误:', error);
      Alert.alert('网络错误', '请检查网络连接');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  const deleteTodo = async (id: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个任务吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 发送DELETE请求到后端
              const response = await
  fetch(`http://localhost:3000/api/todos/${id}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                const result = await response.json();
                console.log('删除成功:', result);

                // 重新加载所有数据
                await loadTodos();
              } else {
                const error = await response.json();
                Alert.alert('删除失败', error.error || '未知错误');
              }
            } catch (error) {
              console.error('网络错误:', error);
              Alert.alert('网络错误', '请检查网络连接');
            }
          }
        }
      ]
    );
  };
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">📋 我的任务清单</ThemedText>
        <ThemedText style={styles.subtitle}>
          今天要完成 {todos.filter(t => !t.completed).length} 个任务
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.categoryContainer}>
        <ThemedText style={styles.categoryLabel}>选择分类：</ThemedText>
        <View style={styles.categoryButtons}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === '工作' &&
              styles.selectedCategoryButton]}
            onPress={() => setSelectedCategory('工作')}
          >
            <ThemedText style={styles.categoryButtonText}>📊 工作</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === '生活' &&
              styles.selectedCategoryButton]}
            onPress={() => setSelectedCategory('生活')}
          >
            <ThemedText style={styles.categoryButtonText}>🏠 生活</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === '学习' &&
              styles.selectedCategoryButton]}
            onPress={() => setSelectedCategory('学习')}
          >
            <ThemedText style={styles.categoryButtonText}>📚 学习</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="添加新任务..."
          value={newTodoText}
          onChangeText={setNewTodoText}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <ThemedText style={styles.addButtonText}>添加</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.todoList}>
        {todos.map((todo) => (
          <TouchableOpacity
            key={todo.id}
            style={[styles.todoItem, todo.completed && styles.completedTodo]}
            onPress={() => toggleTodo(todo.id)}
          >
            <View style={styles.todoItemContent}>
                <ThemedText style={[
                  styles.todoText,
                  todo.completed && styles.completedText
                ]}>
                  {todo.completed ? '✅' : '⭕'} {todo.title}
                </ThemedText>
                <View style={styles.todoActions}>
                  <ThemedText style={styles.categoryTag}>
                    {todo.category === '工作' ? '📊' : todo.category === '生活' ?
  '🏠' : '📚'}
                  </ThemedText>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteTodo(todo.id)}
                  >
                    <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  todoList: {
    padding: 20,
    paddingTop: 0,
  },
  todoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTodo: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  todoText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  categoryContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  todoItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
});
