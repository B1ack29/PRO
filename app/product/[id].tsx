import { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getProducts, deleteProduct, Product } from '../../utils/storage';

function CriterionBar({ name, score }: { name: string; score: number }) {
  const color = score >= 8 ? '#4CAF50' : score >= 6 ? '#FF6B35' : score >= 4 ? '#FFC107' : '#F44336';
  return (
    <View style={styles.criterionRow}>
      <View style={styles.criterionMeta}>
        <Text style={styles.criterionName}>{name}</Text>
        <Text style={[styles.criterionScore, { color }]}>{score.toFixed(1)}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${score * 10}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      getProducts().then(list => {
        const found = list.find(p => p.id === id);
        setProduct(found || null);
      });
    }, [id])
  );

  if (!product) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#555' }}>Product not found</Text>
    </View>
  );

  const color = product.overallScore >= 8 ? '#4CAF50'
    : product.overallScore >= 6 ? '#FF6B35'
    : product.overallScore >= 4 ? '#FFC107' : '#F44336';

  const handleDelete = () => {
    Alert.alert('Delete', `Remove "${product.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteProduct(product.id); router.back(); }
      }
    ]);
  };

  const date = new Date(product.createdAt).toLocaleDateString('en', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        {product.imageUri
          ? <Image source={{ uri: product.imageUri }} style={styles.heroImage} />
          : <View style={styles.heroPlaceholder}>
              <Text style={{ fontSize: 64 }}>📦</Text>
            </View>
        }
        <View style={styles.heroOverlay}>
          <Text style={styles.heroCategory}>{product.category}</Text>
          <Text style={styles.heroName}>{product.name}</Text>
          <Text style={styles.heroDate}>{date}</Text>
        </View>
      </View>

      {/* Overall score */}
      <View style={[styles.overallCard, { borderColor: color }]}>
        <Text style={styles.overallLabel}>OVERALL SCORE</Text>
        <Text style={[styles.overallScore, { color }]}>{product.overallScore.toFixed(1)}</Text>
        <Text style={styles.overallMax}>/10</Text>
      </View>

      {/* Criteria */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CRITERIA BREAKDOWN</Text>
        {product.criteria.map(c => (
          <CriterionBar key={c.id} name={c.name} score={c.score} />
        ))}
      </View>

      {/* Notes */}
      {product.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTES</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{product.notes}</Text>
          </View>
        </View>
      ) : null}

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>DELETE PRODUCT</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { gap: 20 },
  hero: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: '#141414',
    alignItems: 'center', justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20,
    backgroundColor: 'rgba(13,13,13,0.85)',
  },
  heroCategory: { color: '#FF6B35', fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  heroName: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  heroDate: { color: '#555', fontSize: 12, marginTop: 4 },
  overallCard: {
    marginHorizontal: 16,
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: '#141414', borderRadius: 14,
    borderWidth: 1, padding: 20, gap: 4,
  },
  overallLabel: { color: '#555', fontSize: 11, letterSpacing: 2, flex: 1 },
  overallScore: { fontSize: 40, fontWeight: '700' },
  overallMax: { color: '#555', fontSize: 18 },
  section: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { color: '#555', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  criterionRow: { gap: 8 },
  criterionMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  criterionName: { color: '#CCC', fontSize: 14 },
  criterionScore: { fontSize: 14, fontWeight: '700' },
  track: {
    height: 6, backgroundColor: '#1E1E1E',
    borderRadius: 3, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  notesCard: {
    backgroundColor: '#141414', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E', padding: 16,
  },
  notesText: { color: '#888', fontSize: 14, lineHeight: 22 },
  deleteBtn: {
    marginHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#F44336',
    padding: 16, alignItems: 'center',
  },
  deleteBtnText: { color: '#F44336', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
});
