import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { saveProduct, calcOverall, Criterion } from '../utils/storage';
import 'react-native-uuid';
// @ts-ignore
import uuid from 'react-native-uuid';

const DEFAULT_CRITERIA = [
  'Taste', 'Aroma', 'Appearance', 'Value', 'Aftertaste'
];

const CATEGORIES = ['Drink', 'Food', 'Snack', 'Alcohol', 'Other'];

function ScoreSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const steps = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  const color = value >= 8 ? '#4CAF50' : value >= 6 ? '#FF6B35' : value >= 4 ? '#FFC107' : '#F44336';

  return (
    <View style={ss.sliderWrap}>
      <View style={ss.track}>
        <View style={[ss.fill, { width: `${value * 10}%`, backgroundColor: color }]} />
      </View>
      <View style={ss.dots}>
        {steps.map(s => (
          <TouchableOpacity key={s} onPress={() => onChange(s)} style={ss.dot} hitSlop={{ top: 8, bottom: 8 }}>
            <View style={[
              ss.dotInner,
              value === s && { backgroundColor: color, transform: [{ scale: 1.4 }] }
            ]} />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[ss.scoreVal, { color }]}>{value.toFixed(1)}</Text>
    </View>
  );
}

export default function AddScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Drink');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>(
    DEFAULT_CRITERIA.map(n => ({ id: uuid.v4() as string, name: n, score: 5 }))
  );
  const [newCriterionName, setNewCriterionName] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const addCriterion = () => {
    if (!newCriterionName.trim()) return;
    setCriteria([...criteria, { id: uuid.v4() as string, name: newCriterionName.trim(), score: 5 }]);
    setNewCriterionName('');
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateScore = (id: string, score: number) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, score } : c));
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Missing name', 'Enter a product name'); return; }
    if (!criteria.length) { Alert.alert('No criteria', 'Add at least one criterion'); return; }

    const product = {
      id: uuid.v4() as string,
      name: name.trim(),
      category,
      imageUri,
      criteria,
      overallScore: calcOverall(criteria),
      notes,
      createdAt: new Date().toISOString(),
    };

    await saveProduct(product);
    Alert.alert('Saved!', `${name} rated ${product.overallScore.toFixed(1)}/10`, [
      { text: 'OK', onPress: () => { router.replace('/'); } }
    ]);
  };

  const overall = calcOverall(criteria);
  const overallColor = overall >= 8 ? '#4CAF50' : overall >= 6 ? '#FF6B35' : overall >= 4 ? '#FFC107' : '#F44336';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageBox} activeOpacity={0.8}>
            {imageUri
              ? <Image source={{ uri: imageUri }} style={styles.image} />
              : <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderEmoji}>📷</Text>
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
            }
          </TouchableOpacity>
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
              <Text style={styles.imgBtnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imgBtn} onPress={takePhoto}>
              <Text style={styles.imgBtnText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>PRODUCT NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Coca-Cola Cherry"
            placeholderTextColor="#333"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Criteria */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>CRITERIA</Text>
            <View style={[styles.overallBadge, { backgroundColor: overallColor }]}>
              <Text style={styles.overallText}>Overall {overall.toFixed(1)}</Text>
            </View>
          </View>

          {criteria.map(c => (
            <View key={c.id} style={styles.criterionRow}>
              <View style={styles.criterionHeader}>
                <Text style={styles.criterionName}>{c.name}</Text>
                <TouchableOpacity onPress={() => removeCriterion(c.id)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScoreSlider value={c.score} onChange={(v) => updateScore(c.id, v)} />
            </View>
          ))}

          {/* Add criterion */}
          <View style={styles.addCriterionRow}>
            <TextInput
              style={styles.criterionInput}
              value={newCriterionName}
              onChangeText={setNewCriterionName}
              placeholder="New criterion..."
              placeholderTextColor="#333"
              onSubmitEditing={addCriterion}
            />
            <TouchableOpacity style={styles.addCriterionBtn} onPress={addCriterion}>
              <Text style={styles.addCriterionBtnText}>+ ADD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>NOTES</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any thoughts..."
            placeholderTextColor="#333"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>SAVE RATING</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 16, gap: 24 },
  imageSection: { alignItems: 'center', gap: 12 },
  imageBox: {
    width: 160, height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, backgroundColor: '#141414',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  imagePlaceholderEmoji: { fontSize: 36 },
  imagePlaceholderText: { color: '#444', fontSize: 12 },
  imageActions: { flexDirection: 'row', gap: 12 },
  imgBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#1E1E1E',
  },
  imgBtnText: { color: '#888', fontSize: 13 },
  section: { gap: 12 },
  label: { color: '#555', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    backgroundColor: '#141414', borderRadius: 10,
    borderWidth: 1, borderColor: '#1E1E1E',
    color: '#FFF', fontSize: 15, padding: 14,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#1E1E1E',
    backgroundColor: '#141414',
  },
  catBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catBtnText: { color: '#555', fontSize: 13 },
  catBtnTextActive: { color: '#FFF', fontWeight: '600' },
  criterionRow: {
    backgroundColor: '#141414', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E', padding: 14, gap: 10,
  },
  criterionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  criterionName: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  removeBtn: { color: '#333', fontSize: 14, padding: 4 },
  addCriterionRow: { flexDirection: 'row', gap: 10 },
  criterionInput: {
    flex: 1, backgroundColor: '#141414', borderRadius: 10,
    borderWidth: 1, borderColor: '#1E1E1E',
    color: '#FFF', fontSize: 14, padding: 12,
  },
  addCriterionBtn: {
    backgroundColor: '#1A1A1A', borderRadius: 10,
    borderWidth: 1, borderColor: '#FF6B35',
    paddingHorizontal: 16, justifyContent: 'center',
  },
  addCriterionBtnText: { color: '#FF6B35', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  saveBtn: {
    backgroundColor: '#FF6B35', borderRadius: 14,
    padding: 18, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 2 },
  overallBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  overallText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});

const ss = StyleSheet.create({
  sliderWrap: { gap: 8 },
  track: {
    height: 4, backgroundColor: '#1E1E1E',
    borderRadius: 2, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  dots: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: -10,
  },
  dot: { alignItems: 'center', justifyContent: 'center', width: 16, height: 16 },
  dotInner: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  scoreVal: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
