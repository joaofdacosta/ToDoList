import 'react-native-url-polyfill/auto';
import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  LogBox,
  Keyboard,
  Alert,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmojiPicker from 'react-native-emoji-chooser';

// Oculta alertas especificos da interface
LogBox.ignoreLogs([
  'DeviceEventEmitter', 
  'Animated: `useNativeDriver`',
  'fontFamily "Inter_600SemiBold" is not a system font',
  'VirtualizedLists should never be nested'
]);

// Formatador de data global
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [categoria, setCategoria] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💆‍♂️');
  const [emojiPickerAberto, setEmojiPickerAberto] = useState(false);
  
  // Novo estado para controlar se estamos editando ou criando
  const [tarefaEditandoId, setTarefaEditandoId] = useState(null);

  const loadedRef = useRef(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks !== null) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Erro ao carregar', error);
      } finally {
        loadedRef.current = true;
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Erro ao salvar', error);
      }
    };
    saveTasks();
  }, [tasks]);

  // Modificado para resetar os estados de edicao
  function fecharModal() {
    Keyboard.dismiss();
    setModalVisivel(false);
    setEmojiPickerAberto(false);
    
    // Reseta o formulario ao fechar
    setNovaTarefa('');
    setCategoria('');
    setSelectedEmoji('💆‍♂️');
    setTarefaEditandoId(null);
  }

  // Modificado para servir tanto para Criar quanto para Salvar edicao
  function salvarTarefa() {
    if (!novaTarefa.trim()) return; 

    if (tarefaEditandoId !== null) {
      // Estamos Editando
      setTasks(prev => prev.map(task => 
        task.id === tarefaEditandoId 
          ? { ...task, text: novaTarefa.trim(), category: categoria.trim() || "Geral", emoji: selectedEmoji }
          : task
      ));
    } else {
      // Estamos Criando
      setTasks(prev => [...prev, {
        id: Date.now(),
        text: novaTarefa.trim(),
        category: categoria.trim() || "Geral",
        emoji: selectedEmoji,
        done: false
      }]);
    }

    fecharModal();
  }

  // Nova funcao: Excluir Tarefa
  function deletarTarefa(id) {
    Alert.alert("Excluir Tarefa", "Tem certeza que deseja apagar essa tarefa?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => {
        setTasks(prev => prev.filter(task => task.id !== id));
      }}
    ]);
  }

  // Nova funcao: Iniciar modo de edicao
  function iniciarEdicao(task) {
    setTarefaEditandoId(task.id);
    setNovaTarefa(task.text);
    setCategoria(task.category);
    setSelectedEmoji(task.emoji);
    setModalVisivel(true);
  }

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const incompleteTasks = tasks.filter((task) => !task.done);
  const completedTasks = tasks.filter((task) => task.done);

  const sections = [
    { title: 'Incompletas', data: incompleteTasks },
    { title: 'Realizadas', data: completedTasks },
  ];

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Checkbox
        value={item.done}
        onValueChange={() => toggleTaskCompletion(item.id)}
        color={item.done ? '#474292' : undefined}
        style={styles.checkbox}
      />
      
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskName, item.done && styles.taskNameCompleted]}>
          {item.text}
        </Text>
        {!item.done && (
          <Text style={styles.taskCategory}>
            {item.emoji} {item.category}
          </Text>
        )}
      </View>

      {/* Botoes de Editar e Excluir */}
      <View style={styles.acoesContainer}>
        <Pressable onPress={() => iniciarEdicao(item)} style={styles.btnAcao}>
          <MaterialIcons name="edit" size={22} color="#888" />
        </Pressable>
        <Pressable onPress={() => deletarTarefa(item.id)} style={styles.btnAcao}>
          <MaterialIcons name="delete-outline" size={24} color="#d9534f" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.dateText}>{dateFormatter.format(Date.now())}</Text>
        <Text style={styles.subTitle}>
          {incompleteTasks.length} incompletas, {completedTasks.length} realizadas
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        renderSectionHeader={({ section: { title, data } }) => (
          data.length > 0 ? <Text style={styles.sectionTitle}>{title}</Text> : null
        )}
        style={styles.list}
        stickySectionHeadersEnabled={false}
      />

      <Pressable style={styles.fab} onPress={() => setModalVisivel(true)}>
        <MaterialIcons name="add" size={38} color="#fff" />
      </Pressable>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={fecharModal}
      >
        <Pressable style={styles.modalOverlay} onPress={fecharModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Tarefa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Realizar treino em casa"
                  value={novaTarefa}
                  onChangeText={setNovaTarefa}
                />

                <View style={styles.rowFlex}>
                  <View style={styles.emojiCol}>
                    <Text style={styles.modalLabel}>Emoji</Text>
                    <Pressable
                      style={styles.emojiButton}
                      onPress={() => setEmojiPickerAberto(p => !p)}
                    >
                      <Text style={{ fontSize: 24 }}>{selectedEmoji}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.categoriaCol}>
                    <Text style={styles.modalLabel}>Categoria</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Mercado"
                      value={categoria}
                      onChangeText={setCategoria}
                    />
                  </View>
                </View>

                {emojiPickerAberto && (
                  <View style={styles.pickerWrapper}>
                    <EmojiPicker
                      onSelect={(emoji) => {
                        setSelectedEmoji(emoji);
                        setEmojiPickerAberto(false);
                      }}
                      mode="light"
                      lang="en"
                      columnCount={8}
                    />
                  </View>
                )}
              </View>

              {/* Botao dinamico: Muda de Criar para Salvar se estiver editando */}
              <Pressable style={styles.btnCriar} onPress={salvarTarefa}>
                <Text style={styles.btnCriarTexto}>
                  {tarefaEditandoId ? "Salvar Alterações" : "Criar"}
                </Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 15 },
  dateText: { color: '#1A1A1A', fontSize: 32, fontWeight: 'bold' },
  subTitle: { color: '#888', fontSize: 14, marginTop: 2, fontWeight: '600' },
  sectionTitle: { color: '#474292', fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 15 },
  list: { flex: 1 },
  taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { borderRadius: 4, marginRight: 15, width: 22, height: 22, borderColor: '#CCC' },
  taskTextContainer: { flex: 1 },
  taskName: { color: '#555', fontSize: 16, fontWeight: '500' },
  taskNameCompleted: { textDecorationLine: 'line-through', color: '#BBB' },
  taskCategory: { color: '#A0A0A0', fontSize: 13, marginTop: 4, fontWeight: '500' },
  
  // Estilos das acoes novas
  acoesContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  btnAcao: { marginLeft: 12, padding: 4 },

  fab: { 
    position: 'absolute', 
    bottom: 32, 
    right: 24, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#474292', 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: {
    backgroundColor: '#EFEFEF',
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%', 
  },
  modalForm: { flexShrink: 1 },
  modalLabel: { fontSize: 15, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  rowFlex: { flexDirection: 'row', gap: 12 },
  emojiCol: { width: 72 },
  categoriaCol: { flex: 1 },
  emojiButton: {
    backgroundColor: '#FFF',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerWrapper: {
    height: 280,
    flexShrink: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  btnCriar: {
    backgroundColor: '#474292',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    flexShrink: 0,
  },
  btnCriarTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});